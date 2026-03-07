"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { deleteGoogleCalendarEvent } from "@/lib/google-calendar"
import { sendAppointmentEmail } from "@/lib/resend"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function cancelAppointmentAction(id: string) {
    if (!id) return { success: false, error: "No ID provided" }

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                profile: { include: { user: true } },
                service: true,
            }
        })

        if (!appointment) return { success: false, error: "Appointment not found" }

        await prisma.appointment.update({
            where: { id },
            data: { status: "CANCELLED" }
        })

        // Remove from Google Calendar if synced
        await deleteGoogleCalendarEvent(id).catch(console.error)

        // Notify client by email if they have one
        if (appointment.clientEmail) {
            await sendAppointmentEmail({
                to: appointment.clientEmail,
                type: "CANCELLATION",
                clientName: appointment.clientName,
                professionalName: appointment.profile.displayName || appointment.profile.user.name,
                serviceName: appointment.service?.name,
                price: appointment.service?.price,
                date: format(appointment.startTime, "EEEE, d 'de' MMMM", { locale: es }),
                time: format(appointment.startTime, "HH:mm"),
            }).catch(console.error)
        }

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error cancelling appointment:", error)
        return { success: false, error: "Failed to cancel appointment" }
    }
}
