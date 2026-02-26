"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function getProfileForUser() {
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

    return { profile, session }
}

export async function getServices() {
    const { profile } = await getProfileForUser()

    const services = await prisma.service.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: 'asc' }
    })

    return services.map(s => ({
        id: s.id,
        name: s.name,
        durationMinutes: s.durationMinutes,
        isActive: s.isActive,
        price: (s as any).price ?? 0
    }))
}

export async function getConfiguration() {
    const { profile, session } = await getProfileForUser()

    const services = await prisma.service.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: 'asc' }
    })

    return {
        displayName: profile.displayName || session.user.name || "",
        services: services.map(s => ({
            id: s.id,
            name: s.name,
            durationMinutes: s.durationMinutes,
            isActive: s.isActive,
            price: (s as any).price ?? 0
        }))
    }
}

export async function updateDisplayName(displayName: string) {
    const { profile } = await getProfileForUser()

    if (!displayName || displayName.trim() === "") {
        throw new Error("El nombre no puede estar vacío")
    }

    await prisma.profile.update({
        where: { id: profile.id },
        data: { displayName: displayName.trim() }
    })

    revalidatePath("/dashboard/configuracion")
    return { success: true }
}

export async function createService(data: { name: string, durationMinutes: number, price?: number }) {
    const { profile } = await getProfileForUser()

    if (!data.name || data.name.trim() === "") {
        throw new Error("El nombre del servicio es requerido")
    }

    await prisma.service.create({
        data: {
            profileId: profile.id,
            name: data.name.trim(),
            durationMinutes: data.durationMinutes,
            price: data.price || 0
        }
    })

    revalidatePath("/dashboard/configuracion")
    return { success: true }
}

export async function updateService(id: string, data: { name?: string, durationMinutes?: number, isActive?: boolean, price?: number }) {
    const { profile } = await getProfileForUser()

    // Verify ownership
    const service = await prisma.service.findFirst({
        where: { id, profileId: profile.id }
    })

    if (!service) {
        throw new Error("Servicio no encontrado")
    }

    await prisma.service.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name.trim() }),
            ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
            ...(data.price !== undefined && { price: data.price })
        }
    })

    revalidatePath("/dashboard/configuracion")
    return { success: true }
}

export async function deleteService(id: string) {
    const { profile } = await getProfileForUser()

    const service = await prisma.service.findFirst({
        where: { id, profileId: profile.id }
    })

    if (!service) {
        throw new Error("Servicio no encontrado")
    }

    await prisma.service.delete({
        where: { id }
    })

    revalidatePath("/dashboard/configuracion")
    return { success: true }
}
