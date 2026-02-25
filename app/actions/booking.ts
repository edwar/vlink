"use server"

import prisma from "@/lib/prisma"
import { startOfDay, endOfDay, addMinutes, format, isBefore } from "date-fns"
import { sendAppointmentEmail, sendOTPEmail } from "@/lib/resend"
import { es } from "date-fns/locale"
import crypto from "crypto"

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
        services: profile.services.map((s: any) => ({
            id: s.id,
            name: s.name,
            durationMinutes: s.durationMinutes
        }))
    }
}

export async function getAvailableSlots(username: string, date: Date, durationMinutes: number = 30) {
    const profile = await prisma.profile.findUnique({
        where: { username },
        include: { availabilities: true }
    })

    if (!profile) throw new Error("Perfil no encontrado")

    const dayOfWeek = date.getDay()

    // 1. Get recurring availability for this day of week
    const recurring = profile.availabilities.find((a: any) => a.dayOfWeek === dayOfWeek && !a.isBlocked)

    if (!recurring) return []

    // 2. Get specific blocks for this date
    const blocks = profile.availabilities.filter((a: any) =>
        a.isBlocked &&
        a.specificDate &&
        startOfDay(a.specificDate).getTime() === startOfDay(date).getTime()
    )

    // 3. Get existing appointments for this date
    const appointments = await prisma.appointment.findMany({
        where: {
            profileId: profile.id,
            startTime: { gte: startOfDay(date) },
            endTime: { lte: endOfDay(date) },
            status: { not: "CANCELLED" }
        }
    })

    // 4. Generate slots based on recurring hours
    const slots: string[] = []
    let currentSlot = new Date(date)
    const [startHour, startMin] = recurring.startTime.split(":").map(Number)
    const [endHour, endMin] = recurring.endTime.split(":").map(Number)

    currentSlot.setHours(startHour, startMin, 0, 0)
    const endTime = new Date(date)
    endTime.setHours(endHour, endMin, 0, 0)

    while (isBefore(currentSlot, endTime)) {
        const slotEnd = addMinutes(currentSlot, durationMinutes)
        // Only add if the entire slot fits before end time
        if (isBefore(slotEnd, endTime) || slotEnd.getTime() === endTime.getTime()) {
            const timeStr = format(currentSlot, "HH:mm")
            const slotEndStr = format(slotEnd, "HH:mm")

            // Check if slot is blocked by specific block
            const isBlocked = blocks.some((b: any) => timeStr < b.endTime && slotEndStr > b.startTime)

            // Check if slot overlaps with existing appointment
            const isOccupied = appointments.some((appt: any) => {
                const apptStart = format(appt.startTime, "HH:mm")
                const apptEnd = format(appt.endTime, "HH:mm")
                return timeStr < apptEnd && slotEndStr > apptStart
            })

            if (!isBlocked && !isOccupied) {
                slots.push(timeStr)
            }
        }

        currentSlot = addMinutes(currentSlot, durationMinutes)
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

    // Get duration from service if provided, otherwise default 30
    let durationMinutes = 30
    if (data.serviceId) {
        const service = await prisma.service.findUnique({ where: { id: data.serviceId } })
        if (service) durationMinutes = service.durationMinutes
    }

    const [hour, min] = data.time.split(":").map(Number)
    const startTime = new Date(data.date)
    startTime.setHours(hour, min, 0, 0)
    const endTime = addMinutes(startTime, durationMinutes)

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
        date: format(startTime, "EEEE, d 'de' MMMM", { locale: es }),
        time: data.time
    })

    return appointment
}

export async function generateAndSendOTP(email: string, name: string) {
    if (!email || !name) throw new Error("Email y nombre requeridos");

    // Generate 6 digit code
    const code = Array.from({ length: 6 }, () => crypto.randomInt(0, 10)).join("");

    // Create unique identifier for booking OTPs
    const identifier = `booking_otp_${email.toLowerCase()}`;

    // Store in existing verification table (delete old ones first if exist)
    await prisma.verification.deleteMany({
        where: { identifier }
    });

    await prisma.verification.create({
        data: {
            id: crypto.randomUUID(),
            identifier,
            value: code,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    });

    // Send the email
    await sendOTPEmail({
        to: email,
        clientName: name,
        code
    });

    return { success: true };
}

export async function verifyOTP(email: string, code: string) {
    if (!email || !code) throw new Error("Email y código requeridos");

    const identifier = `booking_otp_${email.toLowerCase()}`;

    const record = await prisma.verification.findFirst({
        where: { identifier, value: code }
    });

    if (!record) {
        throw new Error("Código incorrecto");
    }

    if (new Date() > record.expiresAt) {
        // Option to delete explicitly or just throw
        throw new Error("El código ha expirado. Solicita uno nuevo.");
    }

    // Code is valid, consume it
    await prisma.verification.delete({
        where: { id: record.id }
    });

    return { success: true };
}
