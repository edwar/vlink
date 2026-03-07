"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateAppointmentNotesAction(id: string, notes: string) {
    if (!id) return { success: false, error: "ID no proporcionado" }

    try {
        await prisma.appointment.update({
            where: { id },
            data: { notes: notes.trim() || null }
        })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error updating appointment notes:", error)
        return { success: false, error: "No se pudieron guardar las notas" }
    }
}
