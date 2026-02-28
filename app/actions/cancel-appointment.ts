"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { deleteGoogleCalendarEvent } from "@/lib/google-calendar"

export async function cancelAppointmentAction(id: string) {
    if (!id) return { success: false, error: "No ID provided" }

    try {
        await prisma.appointment.update({
            where: { id },
            data: { status: "CANCELLED" }
        })

        // Remove from Google Calendar if synced
        await deleteGoogleCalendarEvent(id).catch(console.error)

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error cancelling appointment:", error)
        return { success: false, error: "Failed to cancel appointment" }
    }
}
