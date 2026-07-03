"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getEffectiveProfile } from "@/lib/permissions"

async function getProfileForUser() {
    const profile = await getEffectiveProfile()
    return { profile }
}

export async function getConfiguration() {
    const { profile } = await getProfileForUser()

    const services = await prisma.service.findMany({
        where: { profileId: profile.id },
        include: { images: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "asc" }
    })

    return {
        profileId: profile.id,
        displayName: profile.displayName || profile.username || "",
        advanceNoticeHours: profile.advanceNoticeHours,
        expertise: (profile as any).expertise || [],
        services: services.map((s: any) => ({
            id: s.id,
            name: s.name,
            durationMinutes: s.durationMinutes,
            isActive: s.isActive,
            price: (s as any).price ?? 0,
            images: s.images.map((img: any) => ({
                id: img.id,
                url: img.url,
                order: img.order
            }))
        }))
    }
}

export async function updateConfiguration(data: { displayName?: string, advanceNoticeHours?: number, expertise?: string[] }) {
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

    if (data.expertise !== undefined) {
        updateData.expertise = data.expertise
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

    const name = data.name.trim()

    const existing = await prisma.service.findUnique({
        where: {
            profileId_name: {
                profileId: profile.id,
                name
            }
        }
    })

    if (existing) {
        throw new Error(`Ya tienes un servicio llamado "${name}". Por favor usa un nombre diferente.`)
    }

    const service = await prisma.service.create({
        data: {
            profileId: profile.id,
            name,
            durationMinutes: data.durationMinutes,
            price: data.price || 0
        }
    })

    revalidatePath("/dashboard/configuracion")
    return { success: true, serviceId: service.id }
}

export async function updateService(id: string, data: { name?: string, durationMinutes?: number, isActive?: boolean, price?: number }) {
    const { profile } = await getProfileForUser()

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

export async function addServiceImage(serviceId: string, url: string) {
    const { profile } = await getProfileForUser()

    const service = await prisma.service.findFirst({
        where: { id: serviceId, profileId: profile.id }
    })

    if (!service) {
        throw new Error("Servicio no encontrado")
    }

    const maxOrder = await prisma.serviceImage.aggregate({
        where: { serviceId },
        _max: { order: true }
    })

    const image = await prisma.serviceImage.create({
        data: {
            serviceId,
            url,
            order: (maxOrder._max.order ?? -1) + 1
        }
    })

    revalidatePath("/dashboard/configuracion")
    return { success: true, image: { id: image.id, url: image.url, order: image.order } }
}

export async function removeServiceImage(imageId: string) {
    const { profile } = await getProfileForUser()

    const image = await prisma.serviceImage.findUnique({
        where: { id: imageId },
        include: { service: true }
    })

    if (!image || image.service.profileId !== profile.id) {
        throw new Error("Imagen no encontrada")
    }

    await prisma.serviceImage.delete({ where: { id: imageId } })

    revalidatePath("/dashboard/configuracion")
    return { success: true }
}

export async function reorderServiceImages(serviceId: string, imageIds: string[]) {
    const { profile } = await getProfileForUser()

    const service = await prisma.service.findFirst({
        where: { id: serviceId, profileId: profile.id }
    })

    if (!service) {
        throw new Error("Servicio no encontrado")
    }

    await prisma.$transaction(
        imageIds.map((id, index) =>
            prisma.serviceImage.update({
                where: { id },
                data: { order: index }
            })
        )
    )

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
