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

    // Se listan todas las organizaciones. Antes se excluían las que tenían
    // algún miembro ADMIN, lo que ocultaba la organización propia del admin y
    // cualquier organización a la que el admin entrara con "Dar soporte".
    const where = {}

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

export async function getPublicSystemConfig() {
    return await prisma.systemConfig.findUnique({
        where: { id: 'global' }
    })
}

/**
 * Permite a un administrador unirse temporalmente a una organización como OWNER
 * para dar soporte o resolver problemas.
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


/**
 * Retira (o restaura) la marca "Agenda creada con VLink" de una organización o
 * de un profesional. Se usa tras recibir un pago directo por transferencia.
 * `until` = null restaura la marca.
 */
export async function setBrandingRemoval(
    target: { type: "organization" | "profile"; id: string },
    until: string | null
) {
    const session = await ensureAdmin()

    let untilDate: Date | null = null
    if (until !== null) {
        untilDate = new Date(until)
        if (isNaN(untilDate.getTime())) throw new Error("Fecha inválida")
        if (untilDate <= new Date()) throw new Error("La fecha debe ser futura")
    }

    const data = {
        brandingRemovedUntil: untilDate,
        brandingUpdatedAt: new Date(),
        brandingUpdatedBy: session.user.id,
    }

    if (target.type === "organization") {
        const org = await prisma.organization.update({ where: { id: target.id }, data, select: { slug: true } })
        revalidatePath(`/org/${org.slug}`)
    } else {
        const profile = await prisma.profile.update({ where: { id: target.id }, data, select: { username: true } })
        revalidatePath(`/${profile.username}`)
    }

    revalidatePath("/admin/organizations")
    revalidatePath("/admin/users")
    return { success: true, brandingRemovedUntil: untilDate?.toISOString() ?? null }
}
