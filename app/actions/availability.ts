"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAvailability() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error("Unauthorized")
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        include: {
            availabilities: true
        }
    })

    return profile?.availabilities || []
}

export async function updateAvailability(data: {
    dayOfWeek?: number,
    startTime: string,
    endTime: string,
    isBlocked?: boolean,
    id?: string
}[]) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error("Unauthorized")
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id }
    })

    if (!profile) {
        throw new Error("Profile not found")
    }

    // Simple strategy: delete existing and recreate for recurring
    // For specific dates, we might want to be more surgical, but for now let's handle recurring

    await prisma.$transaction(async (tx) => {
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
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error("Unauthorized")
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id }
    })

    if (!profile) {
        throw new Error("Profile not found")
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
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id }
    })

    if (!profile) {
        throw new Error("Profile not found")
    }

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
