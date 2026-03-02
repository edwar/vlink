"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getEffectiveProfile } from "@/lib/permissions"

async function getProfileForUser() {
    const profile = await getEffectiveProfile()
    return { profile }
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
    const { profile } = await getProfileForUser()

    const services = await prisma.service.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: 'asc' }
    })

    return {
        displayName: profile.displayName || profile.username || "",
        advanceNoticeHours: profile.advanceNoticeHours,
        services: services.map(s => ({
            id: s.id,
            name: s.name,
            durationMinutes: s.durationMinutes,
            isActive: s.isActive,
            price: (s as any).price ?? 0
        }))
    }
}

export async function updateConfiguration(data: { displayName?: string, advanceNoticeHours?: number }) {
    const { profile } = await getProfileForUser()

    const updateData: any = {}

    if (data.displayName !== undefined) {
        if (!data.displayName.trim()) {
            throw new Error("El nombre no puede estar vacío")
        }
        updateData.displayName = data.displayName.trim()
    }

    if (data.advanceNoticeHours !== undefined) {
        if (data.advanceNoticeHours < 0) {
            throw new Error("La antelación debe ser mayor o igual a 0")
        }
        updateData.advanceNoticeHours = data.advanceNoticeHours
    }

    if (Object.keys(updateData).length === 0) return { success: true }

    await prisma.profile.update({
        where: { id: profile.id },
        data: updateData
    })

    revalidatePath("/dashboard/configuracion")
    revalidatePath("/dashboard/perfil")
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
