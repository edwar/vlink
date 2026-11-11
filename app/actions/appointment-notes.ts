"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getEffectiveProfile } from "@/lib/permissions"

export async function updateAppointmentNotesAction(id: string, notes: string) {
    if (!id) return { success: false, error: "ID no proporcionado" }

    try {
        const profile = await getEffectiveProfile()

        const result = await prisma.appointment.updateMany({
            where: { id, profileId: profile.id },
            data: { notes: notes.trim() || null }
        })

        if (result.count === 0) {
            return { success: false, error: "Cita no encontrada" }
        }

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error updating appointment notes:", error)
        return { success: false, error: "No se pudieron guardar las notas" }
    }
}
