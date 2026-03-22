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

    const orgWhereClause = { members: { none: { user: { role: "ADMIN" as const } } } }

    const [orgCount, userCount, apptCount, memberCount] = await Promise.all([
        prisma.organization.count({ where: orgWhereClause }),
        prisma.user.count({ where: { role: "USER" } }),
        prisma.appointment.count(),
        prisma.member.count({ where: { user: { role: "USER" } } })
    ])

    const planStats = await prisma.organization.groupBy({
        by: ['subscriptionPlan'],
        where: orgWhereClause,
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

    // --- NUEVAS MÉTRICAS ---

    // 1. Top 5 Servicios más demandados globalmente (Servicios con más citas cruzando toda la plataforma)
    const topServicesData = await prisma.service.findMany({
        take: 5,
        orderBy: {
            appointments: {
                _count: 'desc'
            }
        },
        select: {
            name: true,
            _count: {
                select: { appointments: true }
            }
        }
    })

    // 2. Crecimiento Mensual de Organizaciones (Últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Empezar desde el día 1 de ese mes
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentOrgs = await prisma.organization.findMany({
        where: {
            createdAt: { gte: sixMonthsAgo },
            ...orgWhereClause
        },
        select: { createdAt: true }
    });

    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthlyGrowthRaw: Record<string, number> = {};
    const monthlyGrowthKeys: string[] = [];

    // Pre-poblar los últimos 6 meses en orden cronológico
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
        monthlyGrowthRaw[m] = 0;
        monthlyGrowthKeys.push(m);
    }

    recentOrgs.forEach(org => {
        const d = org.createdAt;
        const m = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
        if (monthlyGrowthRaw[m] !== undefined) {
            monthlyGrowthRaw[m]++;
        }
    });

    const monthlyGrowth = monthlyGrowthKeys.map(key => ({
        month: key,
        count: monthlyGrowthRaw[key]
    }));

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
        })),
        topServices: topServicesData.map(ts => ({
            name: ts.name,
            count: ts._count.appointments
        })),
        monthlyGrowth
    }
}

export async function getAllOrganizations(page: number = 1, limit: number = 10) {
    await ensureAdmin()
    const skip = (page - 1) * limit

    const where = {
        members: {
            none: {
                user: {
                    role: "ADMIN" as const
                }
            }
        }
    }

    const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
            where,
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
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.organization.count({ where })
    ])

    return { organizations, total, totalPages: Math.ceil(total / limit) }
}

export async function getAllUsers(page: number = 1, limit: number = 10) {
    await ensureAdmin()
    const skip = (page - 1) * limit
    const where = { role: "USER" as const }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                profile: true,
                memberships: {
                    include: { organization: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.user.count({ where })
    ])

    return { users, total, totalPages: Math.ceil(total / limit) }
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
    announcementType?: string,
    wompiMarketplaceEnabled?: boolean
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
            { id: 'BASIC' as const, name: 'BASIC', price: '0', limit: '1 Miembro', maxSeats: 1, maxLocations: 1, features: ['Agendas individuales', 'Sync Google', 'Confirmaciones Email'], active: true },
            { id: 'TEAM' as const, name: 'TEAM', price: '49000', limit: '5 Miembros', maxSeats: 5, maxLocations: 3, features: ['Agenda de Equipo', 'Página de Org', 'Gestión Multimanager', 'Sedes (hasta 3)'], active: true },
            { id: 'CORPORATE' as const, name: 'CORPORATE', price: '99000', limit: 'Ilimitado', maxSeats: 0, maxLocations: 0, features: ['Sedes Ilimitadas', 'Subdominios (Pronto)', 'API Access', 'Prioridad 24/7'], active: true },
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
    maxSeats?: number,
    maxLocations?: number,
    features?: string[],
    active?: boolean
}) {
    await ensureAdmin()

    await prisma.planConfig.update({
        where: { id: id as 'BASIC' | 'TEAM' | 'CORPORATE' },
        data
    })

    revalidatePath("/admin/plans")
    revalidatePath("/dashboard/organizacion/planes")
    return { success: true }
}

export async function getPublicSystemConfig() {
    return await prisma.systemConfig.findUnique({
        where: { id: 'global' }
    })
}

export async function getPublicPlanConfigs() {
    return await prisma.planConfig.findMany({
        orderBy: { id: 'asc' }
    })
}

/**
 * Permite a un administrador unirse temporalmente a una organización como OWNER
 * para dar soporte, modificar planes o resolver problemas.
 */
export async function supportOrganization(organizationId: string) {
    const session = await ensureAdmin()

    // check if they are already a member
    const existing = await prisma.member.findUnique({
        where: {
            userId_organizationId: { userId: session.user.id, organizationId }
        }
    })

    if (!existing) {
        await prisma.member.create({
            data: { userId: session.user.id, organizationId, role: "OWNER" }
        })
    } else if (existing.role !== "OWNER") {
        await prisma.member.update({
            where: { id: existing.id },
            data: { role: "OWNER" }
        })
    }

    revalidatePath("/")
    revalidatePath("/admin/organizations")
    return { success: true }
}

