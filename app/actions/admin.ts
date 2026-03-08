"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function ensureAdmin() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized")
    }
    return session
}

export async function getGlobalStats() {
    await ensureAdmin()

    const [orgCount, userCount, apptCount, memberCount] = await Promise.all([
        prisma.organization.count(),
        prisma.user.count(),
        prisma.appointment.count(),
        prisma.member.count()
    ])

    // Get revenue stats (simplified for now: just count orgs by plan)
    const planStats = await prisma.organization.groupBy({
        by: ['subscriptionPlan'],
        _count: {
            _all: true
        }
    })

    const appointmentsByStatus = await prisma.appointment.groupBy({
        by: ['status'],
        _count: {
            _all: true
        }
    })

    return {
        orgCount,
        userCount,
        apptCount,
        memberCount,
        planStats: planStats.map(p => ({
            plan: p.subscriptionPlan,
            count: p._count._all
        })),
        appointmentsByStatus: appointmentsByStatus.map(s => ({
            status: s.status,
            count: s._count._all
        }))
    }
}

export async function getAllOrganizations() {
    await ensureAdmin()

    return await prisma.organization.findMany({
        include: {
            members: {
                include: { user: true }
            },
            _count: {
                select: {
                    members: true,
                    profiles: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getAllUsers() {
    await ensureAdmin()

    return await prisma.user.findMany({
        include: {
            profile: true,
            memberships: {
                include: { organization: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function updateUserRole(userId: string, role: "USER" | "ADMIN") {
    await ensureAdmin()

    await prisma.user.update({
        where: { id: userId },
        data: { role: role as any }
    })

    revalidatePath("/admin/users")
    return { success: true }
}

export async function getSystemConfig() {
    await ensureAdmin()

    let config = await prisma.systemConfig.findUnique({
        where: { id: 'global' }
    })

    if (!config) {
        config = await prisma.systemConfig.create({
            data: { id: 'global' }
        })
    }

    return config
}

export async function updateSystemConfig(data: {
    maintenanceMode?: boolean,
    announcementTitle?: string | null,
    announcementBody?: string | null,
    announcementType?: string
}) {
    await ensureAdmin()

    await prisma.systemConfig.upsert({
        where: { id: 'global' },
        create: {
            id: 'global',
            ...data
        },
        update: data
    })

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/admin/settings")
    return { success: true }
}

export async function getPlanConfigs() {
    await ensureAdmin()

    const plans = await prisma.planConfig.findMany({
        orderBy: { id: 'asc' }
    })

    // If no plans exist yet, seed them with defaults
    if (plans.length === 0) {
        const defaults = [
            { id: 'FREE', name: 'FREE', price: '$0', limit: '1 Miembro', features: ['Agendas individuales', 'Sync Google', 'Confirmaciones Email'], active: true },
            { id: 'TEAM', name: 'TEAM', price: '$49.000 COP', limit: '5 Miembros', features: ['Agenda de Equipo', 'Página de Org', 'Gestión Multimanager'], active: true },
            { id: 'CORPORATE', name: 'CORPORATE', price: '$99.000 COP', limit: 'Ilimitado', features: ['Subdominios (Pronto)', 'API Access', 'Prioridad 24/7'], active: true },
        ]

        for (const plan of defaults) {
            await prisma.planConfig.create({ data: plan })
        }
        return await prisma.planConfig.findMany({ orderBy: { id: 'asc' } })
    }

    return plans
}

export async function updatePlanConfig(id: string, data: {
    price?: string,
    limit?: string,
    features?: string[],
    active?: boolean
}) {
    await ensureAdmin()

    await prisma.planConfig.update({
        where: { id },
        data
    })

    revalidatePath("/admin/plans")
    return { success: true }
}

export async function getPublicSystemConfig() {
    return await prisma.systemConfig.findUnique({
        where: { id: 'global' }
    })
}
