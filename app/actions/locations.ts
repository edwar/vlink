"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Gets all active locations for an organization.
 */
export async function getOrganizationLocations(organizationId: string) {
    return await prisma.location.findMany({
        where: {
            organizationId,
            isActive: true
        },
        orderBy: {
            name: 'asc'
        }
    })
}

/**
 * Creates a new location for an organization.
 * Enforces plan limits.
 */
export async function createLocation(organizationId: string, data: {
    name: string;
    address?: string;
    city?: string;
    phone?: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) throw new Error("Unauthorized")

    // Verify caller is OWNER or MANAGER
    const membership = await prisma.member.findFirst({
        where: {
            organizationId,
            userId: session.user.id,
            role: { in: ["OWNER", "MANAGER"] }
        }
    })

    if (!membership) throw new Error("No tienes permisos para crear sedes")

    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
            _count: {
                select: { locations: true }
            }
        }
    })

    if (!org) throw new Error("Organización no encontrada")

    // Check plan limits
    const planConfig = await prisma.planConfig.findUnique({
        where: { id: org.subscriptionPlan }
    })

    if (planConfig && planConfig.maxLocations > 0 && org._count.locations >= planConfig.maxLocations) {
        throw new Error(`Tu plan ${planConfig.name} permite máximo ${planConfig.maxLocations} sede(s). Actualiza tu plan para añadir más.`)
    }

    const location = await prisma.$transaction(async (tx) => {
        const newLoc = await tx.location.create({
            data: {
                organizationId,
                name: data.name,
                address: data.address,
                city: data.city,
                phone: data.phone
            }
        })

        // Auto-assign historical appointments if this is the first location
        if (org._count.locations === 0) {
            await tx.appointment.updateMany({
                where: {
                    profile: { organizationId },
                    locationId: null
                },
                data: {
                    locationId: newLoc.id
                }
            })
        }

        return newLoc
    })

    revalidatePath("/dashboard/organizacion/sedes")
    revalidatePath("/dashboard/organizacion")
    return { success: true, location }
}

/**
 * Updates an existing location.
 */
export async function updateLocation(locationId: string, data: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
    isActive?: boolean;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) throw new Error("Unauthorized")

    const location = await prisma.location.findUnique({
        where: { id: locationId }
    })

    if (!location) throw new Error("Sede no encontrada")

    // Verify caller is OWNER or MANAGER of the org
    const membership = await prisma.member.findFirst({
        where: {
            organizationId: location.organizationId,
            userId: session.user.id,
            role: { in: ["OWNER", "MANAGER"] }
        }
    })

    if (!membership) throw new Error("No tienes permisos para modificar sedes")

    await prisma.location.update({
        where: { id: locationId },
        data
    })

    revalidatePath("/dashboard/organizacion/sedes")
    return { success: true }
}

/**
 * Deletes a location if it has no future appointments.
 */
export async function deleteLocation(locationId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) throw new Error("Unauthorized")

    const location = await prisma.location.findUnique({
        where: { id: locationId }
    })

    if (!location) throw new Error("Sede no encontrada")

    // Verify caller is OWNER
    const membership = await prisma.member.findFirst({
        where: {
            organizationId: location.organizationId,
            userId: session.user.id,
            role: "OWNER"
        }
    })

    if (!membership) throw new Error("Solo el propietario puede eliminar sedes")

    // Check for future appointments
    const futureAppointments = await prisma.appointment.count({
        where: {
            locationId,
            startTime: { gt: new Date() },
            status: { not: "CANCELLED" }
        }
    })

    if (futureAppointments > 0) {
        throw new Error("No se puede eliminar la sede porque tiene citas futuras programadas. Desactívala en su lugar o cancela las citas.")
    }

    await prisma.location.delete({
        where: { id: locationId }
    })

    revalidatePath("/dashboard/organizacion/sedes")
    return { success: true }
}

/**
 * Gets which services a member offers at a specific location.
 */
export async function getMemberServicesByLocation(memberId: string, locationId: string) {
    const services = await prisma.memberLocationService.findMany({
        where: {
            memberId,
            locationId,
            isActive: true
        },
        include: {
            service: true
        }
    })

    return services.map(s => s.service)
}

/**
 * Configures which services a member offers at a specific location.
 */
export async function setMemberServicesForLocation(memberId: string, locationId: string, serviceIds: string[]) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) throw new Error("Unauthorized")

    // Verify caller is OWNER/MANAGER of the org or the member themselves
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: { organization: true }
    })

    if (!member) throw new Error("Miembro no encontrado")

    const isSelf = member.userId === session.user.id
    
    if (!isSelf) {
        const callerMembership = await prisma.member.findFirst({
            where: {
                organizationId: member.organizationId,
                userId: session.user.id,
                role: { in: ["OWNER", "MANAGER"] }
            }
        })
        if (!callerMembership) throw new Error("No tienes permisos para modificar servicios de otros miembros")
    }

    await prisma.$transaction(async (tx) => {
        // Delete current mappings
        await tx.memberLocationService.deleteMany({
            where: { memberId, locationId }
        })

        // Create new mappings
        if (serviceIds.length > 0) {
            await tx.memberLocationService.createMany({
                data: serviceIds.map(serviceId => ({
                    memberId,
                    locationId,
                    serviceId,
                    isActive: true
                }))
            })
        }
    })

    revalidatePath(`/dashboard/organizacion/sedes/${locationId}/miembros`)
    return { success: true }
}
