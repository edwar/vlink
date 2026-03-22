"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getEffectiveProfile } from "@/lib/permissions"
import { getBogotaISO } from "@/lib/utils"

export async function getAvailability() {
    const profile = await getEffectiveProfile()

    const availability = await prisma.availability.findMany({
        where: { profileId: profile.id },
        include: { location: true }
    })

    return availability || []
}

export async function updateAvailability(data: {
    dayOfWeek?: number,
    startTime: string,
    endTime: string,
    isBlocked?: boolean,
    locationId?: string,
    id?: string
}[]) {
    const profile = await getEffectiveProfile()

    try {
        // Conflict detection: ensure no overlapping time slots FOR DIFFERENT LOCATIONS on the same day
        for (const item of data) {
            if (item.dayOfWeek === undefined || item.isBlocked) continue;

            const startTimeMinutes = parseTime(item.startTime);
            const endTimeMinutes = parseTime(item.endTime);

            // Check against other items in the SAME request
            for (const other of data) {
                if (other === item || other.dayOfWeek !== item.dayOfWeek || other.isBlocked) continue;
                
                const otherStart = parseTime(other.startTime);
                const otherEnd = parseTime(other.endTime);

                if (startTimeMinutes < otherEnd && endTimeMinutes > otherStart) {
                    if (item.locationId !== other.locationId) {
                        return { 
                            success: false, 
                            error: `Conflicto de sede: Tienes horarios solapados en diferentes sedes el día ${getDayName(item.dayOfWeek)}. No puedes estar en dos lugares al mismo tiempo.` 
                        };
                    }
                }
            }
        }

        // Simple strategy: delete existing and recreate for recurring
        await prisma.$transaction(async (tx: any) => {
            // Delete existing recurring availabilities
            await tx.availability.deleteMany({
                where: {
                    profileId: profile.id,
                    specificDate: null
                }
            })

            // Create new ones
            await tx.availability.createMany({
                data: data.map(item => ({
                    profileId: profile.id,
                    dayOfWeek: item.dayOfWeek,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    isBlocked: item.isBlocked || false,
                    specificDate: null,
                    locationId: item.locationId || null
                }))
            })
        })

        revalidatePath("/dashboard/disponibilidad")
        revalidatePath("/dashboard/agenda")

        return { success: true }
    } catch (error: any) {
        console.error("Error updating availability:", error)
        return { 
            success: false, 
            error: error.message || "Error inesperado al actualizar la disponibilidad" 
        };
    }
}

export async function addSpecialBlock(data: {
    specificDate: Date,
    startTime: string,
    endTime: string,
    isBlocked: boolean,
    locationId?: string | null
}) {
    const profile = await getEffectiveProfile()

    try {
        // Normalizamos la fecha a la zona horaria de Bogotá para evitar choques de UTC
        const isoDate = getBogotaISO(data.specificDate)
        const normalizedDate = new Date(`${isoDate}T00:00:00-05:00`)

        // Check for duplicate block
        const existing = await prisma.availability.findFirst({
            where: {
                profileId: profile.id,
                startTime: data.startTime,
                endTime: data.endTime,
                specificDate: normalizedDate
            }
        })

        if (existing) {
            return { success: false, error: "Ya existe un bloqueo para esta fecha y horario." }
        }

        await prisma.availability.create({
            data: {
                profileId: profile.id,
                specificDate: normalizedDate,
                startTime: data.startTime,
                endTime: data.endTime,
                isBlocked: data.isBlocked,
                locationId: data.locationId || null
            }
        })

        revalidatePath("/dashboard/disponibilidad")
        revalidatePath("/dashboard/agenda")

        return { success: true }
    } catch (error: any) {
        console.error("Error adding special block:", error)
        return { success: false, error: error.message || "Error al agregar el bloqueo especial" }
    }
}

export async function deleteAvailability(id: string) {
    const profile = await getEffectiveProfile()

    try {
        await prisma.availability.delete({
            where: {
                id,
                profileId: profile.id
            }
        })

        revalidatePath("/dashboard/disponibilidad")
        revalidatePath("/dashboard/agenda")
        return { success: true }
    } catch (error: any) {
        console.error("Error deleting availability:", error)
        return { success: false, error: error.message || "Error al eliminar la disponibilidad" }
    }
}

export async function getAppointmentsForDashboard() {
    const profile = await getEffectiveProfile()

    const appointments = await prisma.appointment.findMany({
        where: {
            profileId: profile.id,
            status: { not: "CANCELLED" }
        },
        include: {
            service: true,
            location: true
        }
    })

    return appointments
}

function parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function getDayName(day: number): string {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[day];
}
