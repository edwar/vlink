"use server"

import prisma from "@/lib/prisma"
import { sendAppointmentEmail } from "@/lib/resend"
import { deleteGoogleCalendarEvent } from "@/lib/google-calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { pusherServer } from "@/lib/pusher"

/**
 * Public server action — no authentication required.
 * Cancels an appointment using the single-use cancelToken sent in the confirmation email.
 */
export async function clientCancelAppointment(token: string) {
    if (!token) return { success: false, error: "Token inválido" }

    const appointment = await prisma.appointment.findUnique({
        where: { cancelToken: token },
        include: {
            profile: { include: { user: true } },
            service: true,
        }
    })

    if (!appointment) {
        return { success: false, error: "Link inválido o cita no encontrada" }
    }

    if (appointment.status === "CANCELLED") {
        return { success: false, error: "Esta cita ya fue cancelada anteriormente" }
    }

    // Prevent cancellation less than 2 hours before the appointment
    const twoHoursBeforeStart = new Date(appointment.startTime.getTime() - 2 * 60 * 60 * 1000)
    if (new Date() > twoHoursBeforeStart) {
        return {
            success: false,
            error: "No puedes cancelar con menos de 2 horas de anticipación. Contacta al profesional directamente."
        }
    }

    await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
            status: "CANCELLED",
            cancelToken: null, // Invalidate the token after use
        }
    })

    // Remove from Google Calendar (non-blocking)
    deleteGoogleCalendarEvent(appointment.id).catch(console.error)

    // Notify professional via email  
    const professionalEmail = appointment.profile.user.email
    if (professionalEmail) {
        sendAppointmentEmail({
            to: professionalEmail,
            type: "CANCELLATION",
            clientName: appointment.profile.displayName || appointment.profile.user.name,
            professionalName: appointment.clientName, // Swap: notify the professional
            serviceName: appointment.service?.name,
            price: appointment.service?.price,
            date: format(appointment.startTime, "EEEE, d 'de' MMMM", { locale: es }),
            time: format(appointment.startTime, "HH:mm"),
        }).catch(console.error)
    }

    // Trigger Realtime Dashboard Update for the professional
    await pusherServer.trigger(`profile-${appointment.profileId}`, "appointments-updated", {
        appointmentId: appointment.id,
        status: "CANCELLED"
    }).catch(console.error)

    return { success: true, clientName: appointment.clientName }
}

/**
 * Fetch appointment details for the cancellation page preview (read-only).
 */
export async function getAppointmentByToken(token: string) {
    if (!token) return null

    const appointment = await prisma.appointment.findUnique({
        where: { cancelToken: token },
        include: {
            profile: { include: { user: true } },
            service: true,
        }
    })

    if (!appointment) return null

    return {
        id: appointment.id,
        clientName: appointment.clientName,
        status: appointment.status,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        serviceName: appointment.service?.name ?? null,
        professionalName: appointment.profile.displayName || appointment.profile.user.name,
        professionalUsername: appointment.profile.username,
    }
}
