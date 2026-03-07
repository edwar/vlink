"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { updateGoogleCalendarEvent } from "@/lib/google-calendar"
import { sendAppointmentEmail } from "@/lib/resend"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function rescheduleAppointmentAction(
    id: string,
    newDate: string,  // ISO date string "YYYY-MM-DD"
    newTime: string   // "HH:mm"
) {
    if (!id || !newDate || !newTime) {
        return { success: false, error: "Datos incompletos" }
    }

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                profile: { include: { user: true } },
                service: true,
            }
        })

        if (!appointment) return { success: false, error: "Cita no encontrada" }
        if (appointment.status === "CANCELLED") return { success: false, error: "No se puede reprogramar una cita cancelada" }

        const durationMinutes = appointment.service?.durationMinutes ?? 30

        // Build new start/end using Colombia UTC-5
        const newStartTime = new Date(`${newDate}T${newTime}:00-05:00`)
        const newEndTime = new Date(newStartTime.getTime() + durationMinutes * 60000)

        // Atomic collision check (exclude current appointment)
        const collision = await prisma.appointment.findFirst({
            where: {
                profileId: appointment.profileId,
                status: { not: "CANCELLED" },
                id: { not: id }, // exclude self
                OR: [
                    { startTime: { lt: newEndTime, gte: newStartTime } },
                    { endTime: { gt: newStartTime, lte: newEndTime } },
                ]
            }
        })

        if (collision) {
            return { success: false, error: "El horario seleccionado ya está ocupado" }
        }

        // Update appointment times
        await prisma.appointment.update({
            where: { id },
            data: {
                startTime: newStartTime,
                endTime: newEndTime,
                // Reset reminder flags so reminders are re-sent for new date
                reminder24hSentAt: null,
            } as any
        })

        // Update Google Calendar event (non-blocking)
        updateGoogleCalendarEvent(id).catch(console.error)

        // Notify client by email
        if (appointment.clientEmail) {
            sendAppointmentEmail({
                to: appointment.clientEmail,
                type: "RESCHEDULE",
                clientName: appointment.clientName,
                professionalName: appointment.profile.displayName || appointment.profile.user.name,
                serviceName: appointment.service?.name,
                price: appointment.service?.price,
                date: format(newStartTime, "EEEE, d 'de' MMMM", { locale: es }),
                time: newTime,
            }).catch(console.error)
        }

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error rescheduling appointment:", error)
        return { success: false, error: "Error al reprogramar la cita" }
    }
}
