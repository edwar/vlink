"use server"

import prisma from "@/lib/prisma"
import { startOfDay, endOfDay, addMinutes, format, isBefore } from "date-fns"
import { sendAppointmentEmail } from "@/lib/resend"
import { es } from "date-fns/locale"

export async function getProfileForBooking(username: string) {
    const profile = await prisma.profile.findUnique({
        where: { username },
        include: {
            user: true,
            services: {
                where: { isActive: true },
                orderBy: { createdAt: 'asc' }
            }
        }
    })

    if (!profile) return null

    return {
        displayName: profile.displayName || profile.user.name || username,
        bio: profile.bio || "",
        username: profile.username,
        image: profile.user.image,
        advanceNoticeHours: profile.advanceNoticeHours,
        expertise: (profile as any).expertise || [],
        services: profile.services.map((s: any) => ({
            id: s.id,
            name: s.name,
            durationMinutes: s.durationMinutes,
            price: s.price
        }))
    }
}

export async function getAvailableSlots(username: string, date: Date, durationMinutes: number = 30) {
    const profile = await prisma.profile.findUnique({
        where: { username },
        include: { availabilities: true }
    }) as any

    if (!profile) throw new Error("Perfil no encontrado")

    const dayOfWeek = date.getDay()

    // 1. Get recurring availability for this day of week
    const recurring = profile.availabilities.find((a: any) => a.dayOfWeek === dayOfWeek && !a.isBlocked)

    if (!recurring) return []

    // Force Colombia timezone for correct boundary limits
    const isoDate = date.toISOString().split("T")[0];
    const dayStart = new Date(`${isoDate}T00:00:00-05:00`);
    const dayEnd = new Date(`${isoDate}T23:59:59-05:00`);

    // 2. Get specific blocks for this date
    const blocks = profile.availabilities.filter((a: any) => {
        if (!a.isBlocked || !a.specificDate) return false;
        return a.specificDate.toISOString().split("T")[0] === isoDate;
    })

    // 3. Get existing appointments for this date using precise UTC boundaries
    const appointments = await prisma.appointment.findMany({
        where: {
            profileId: profile.id,
            startTime: { gte: dayStart },
            endTime: { lte: dayEnd },
            status: { not: "CANCELLED" }
        }
    })

    // 4. Generate slots based on recurring hours
    const slots: string[] = []

    const [startHour, startMin] = recurring.startTime.split(":").map(Number)
    const [endHour, endMin] = recurring.endTime.split(":").map(Number)

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + durationMinutes <= endMinutes) {
        const slotEndMinutes = currentMinutes + durationMinutes;

        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        const eh = Math.floor(slotEndMinutes / 60);
        const em = slotEndMinutes % 60;
        const slotEndStr = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

        // Create Date object for this specific slot to check against advanceNoticeHours
        const slotStartDateTime = new Date(`${isoDate}T${timeStr}:00-05:00`)
        const now = new Date()
        const requiredAdvanceNoticeMs = (profile.advanceNoticeHours ?? 24) * 60 * 60 * 1000
        const isTooSoon = (slotStartDateTime.getTime() - now.getTime()) < requiredAdvanceNoticeMs

        // Check if slot is blocked by specific block
        const isBlocked = blocks.some((b: any) => timeStr < b.endTime && slotEndStr > b.startTime)

        // Check if slot overlaps with existing appointment
        const isOccupied = appointments.some((appt: any) => {
            // Compare accurately using minutes difference from midnight Colombia time
            const apptStartMins = (appt.startTime.getTime() - dayStart.getTime()) / 60000;
            const apptEndMins = (appt.endTime.getTime() - dayStart.getTime()) / 60000;
            return currentMinutes < apptEndMins && slotEndMinutes > apptStartMins;
        })

        if (!isBlocked && !isOccupied && !isTooSoon) {
            slots.push(timeStr)
        }

        currentMinutes += durationMinutes;
    }

    return slots
}

export async function createAppointment(data: {
    username: string,
    date: Date,
    time: string,
    clientName: string,
    clientPhone: string,
    clientEmail: string,
    serviceId?: string
}) {
    const profile = await prisma.profile.findUnique({ where: { username: data.username } })
    if (!profile) throw new Error("Perfil no encontrado")

    // Get duration and service info if provided
    let durationMinutes = 30
    let serviceName = undefined
    let servicePrice = undefined

    if (data.serviceId) {
        const service = await prisma.service.findUnique({ where: { id: data.serviceId } })
        if (service) {
            durationMinutes = service.durationMinutes
            serviceName = service.name
            servicePrice = service.price
        }
    }

    const isoDate = data.date.toISOString().split("T")[0]; // "2026-02-28"
    const startTime = new Date(`${isoDate}T${data.time.padStart(5, '0')}:00-05:00`);

    // Explicit end time using math
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    // Re-verify availability (Atomic check)
    const collision = await prisma.appointment.findFirst({
        where: {
            profileId: profile.id,
            status: { not: "CANCELLED" },
            OR: [
                { startTime: { lt: endTime, gte: startTime } },
                { endTime: { gt: startTime, lte: endTime } }
            ]
        }
    })

    if (collision) throw new Error("Slot ya ocupado")

    const appointment = await prisma.appointment.create({
        data: {
            profileId: profile.id,
            serviceId: data.serviceId || null,
            clientName: data.clientName,
            clientPhone: data.clientPhone,
            clientEmail: data.clientEmail,
            startTime,
            endTime,
            status: "CONFIRMED"
        }
    })

    // Get professional name for email
    const user = await prisma.user.findUnique({ where: { id: profile.userId } })

    // Send confirmation email
    await sendAppointmentEmail({
        to: data.clientEmail,
        type: "CONFIRMATION",
        clientName: data.clientName,
        professionalName: user?.name || data.username,
        serviceName,
        price: servicePrice,
        date: format(startTime, "EEEE, d 'de' MMMM", { locale: es }),
        time: data.time
    })

    // Sync with Google Calendar (Awaiting execution to prevent serverless suspension/timeouts on Prisma)
    const { createGoogleCalendarEvent } = await import("@/lib/google-calendar")
    await createGoogleCalendarEvent(appointment.id).catch(console.error)

    return appointment
}

