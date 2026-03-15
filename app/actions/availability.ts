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
        where: { profileId: profile.id }
    })

    return availability || []
}

export async function updateAvailability(data: {
    dayOfWeek?: number,
    startTime: string,
    endTime: string,
    isBlocked?: boolean,
    id?: string
}[]) {
    const profile = await getEffectiveProfile()

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
                specificDate: null
            }))
        })
    })

    revalidatePath("/dashboard/disponibilidad")
    revalidatePath("/dashboard/agenda")

    return { success: true }
}

export async function addSpecialBlock(data: {
    specificDate: Date,
    startTime: string,
    endTime: string,
    isBlocked: boolean
}) {
    const profile = await getEffectiveProfile()

    // Normalizamos la fecha a la zona horaria de Bogotá para evitar choques de UTC
    const isoDate = getBogotaISO(data.specificDate)
    const normalizedDate = new Date(`${isoDate}T00:00:00-05:00`)

    // Check for duplicate block
    const allAvailabilities = await prisma.availability.findMany({
        where: {
            profileId: profile.id,
            startTime: data.startTime,
            endTime: data.endTime
        }
    })

    const existing = allAvailabilities.find(a => 
        a.specificDate && getBogotaISO(a.specificDate) === isoDate
    )

    if (existing) {
        throw new Error("Ya existe un bloqueo para esta fecha y horario.")
    }

    await prisma.availability.create({
        data: {
            profileId: profile.id,
            specificDate: normalizedDate,
            startTime: data.startTime,
            endTime: data.endTime,
            isBlocked: data.isBlocked
        }
    })

    if (existing) {
        throw new Error("Ya existe un bloqueo para esta fecha y horario.")
    }

    await prisma.availability.create({
        data: {
            profileId: profile.id,
            specificDate: data.specificDate,
            startTime: data.startTime,
            endTime: data.endTime,
            isBlocked: data.isBlocked
        }
    })

    revalidatePath("/dashboard/disponibilidad")
    revalidatePath("/dashboard/agenda")

    return { success: true }
}

export async function deleteAvailability(id: string) {
    const profile = await getEffectiveProfile()

    await prisma.availability.delete({
        where: {
            id,
            profileId: profile.id
        }
    })

    revalidatePath("/dashboard/disponibilidad")
    revalidatePath("/dashboard/agenda")
    return { success: true }
}

export async function getAppointmentsForDashboard() {
    const profile = await getEffectiveProfile()

    const appointments = await prisma.appointment.findMany({
        where: {
            profileId: profile.id,
            status: { not: "CANCELLED" }
        },
        include: {
            service: true
        }
    })

    return appointments
}
