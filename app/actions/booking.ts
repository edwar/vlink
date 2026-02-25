"use server"

import prisma from "@/lib/prisma"
import { startOfDay, endOfDay, addMinutes, format, isBefore } from "date-fns"
import { sendAppointmentEmail } from "@/lib/resend"
import { es } from "date-fns/locale"

export async function getAvailableSlots(username: string, date: Date) {
    const profile = await prisma.profile.findUnique({
        where: { username },
        include: { availabilities: true }
    })

    if (!profile) throw new Error("Perfil no encontrado")

    const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1 // Convert 0-6 (Sun-Sat) to 0-6 (Mon-Sun) if needed, but schema uses 0-6 (Sun-Sat). Wait, date.getDay() is 0 (Sun) to 6 (Sat).

    // 1. Get recurring availability for this day of week
    const recurring = profile.availabilities.find((a: any) => a.dayOfWeek === date.getDay() && !a.isBlocked)

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
        const timeStr = format(currentSlot, "HH:mm")

        // Check if slot is blocked by specific block
        const isBlocked = blocks.some((b: any) => timeStr >= b.startTime && timeStr < b.endTime)

        // Check if slot overlaps with existing appointment
        const isOccupied = appointments.some((appt: any) => {
            const apptStart = format(appt.startTime, "HH:mm")
            const apptEnd = format(appt.endTime, "HH:mm")
            return timeStr >= apptStart && timeStr < apptEnd
        })

        if (!isBlocked && !isOccupied) {
            slots.push(timeStr)
        }

        currentSlot = addMinutes(currentSlot, 30) // Default 30 min slots
    }

    return slots
}

export async function createAppointment(data: {
    username: string,
    date: Date,
    time: string,
    clientName: string,
    clientPhone: string,
    clientEmail: string
}) {
    const profile = await prisma.profile.findUnique({ where: { username: data.username } })
    if (!profile) throw new Error("Perfil no encontrado")

    const [hour, min] = data.time.split(":").map(Number)
    const startTime = new Date(data.date)
    startTime.setHours(hour, min, 0, 0)
    const endTime = addMinutes(startTime, 30)

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
