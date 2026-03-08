"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

/**
 * Creates a new organization and assigns the current user as OWNER
 */
export async function createOrganization(name: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const slug = name.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "")

    // Check for duplicate name
    const existing = await prisma.organization.findFirst({ where: { name } })
    if (existing) throw new Error(`Ya existe una organización con el nombre "${name}". Por favor elige otro nombre.`)

    const organization = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
            data: {
                name,
                slug,
                members: {
                    create: {
                        userId: session.user.id,
                        role: "OWNER"
                    }
                }
            }
        })

        // Link creator's profile to the organization
        await tx.profile.update({
            where: { userId: session.user.id },
            data: { organizationId: org.id }
        })

        return org
    })

    revalidatePath("/dashboard")
    return { success: true, organizationId: organization.id }
}

/**
 * Gets details of an invitation by token (public)
 */
export async function getInvitationDetails(token: string) {
    const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: {
            organization: {
                select: { name: true }
            }
        }
    })

    if (!invitation || invitation.expiresAt < new Date()) {
        return null
    }

    return {
        organizationName: invitation.organization.name,
        role: invitation.role
    }
}

/**
 * Generates an invitation token for the organization
 */
export async function createInvitation(organizationId: string, role: "MANAGER" | "PROFESSIONAL" = "PROFESSIONAL") {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" }
    }

    // Check if user is OWNER or ADMIN of the organization
    const membership = await prisma.member.findFirst({
        where: {
            organizationId,
            userId: session.user.id,
            role: { in: ["OWNER", "ADMIN"] }
        }
    })

    if (!membership) {
        return { success: false, error: "No tienes permisos para crear invitaciones en esta organización" }
    }

    // Check SaaS limits
    const orgData = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
            _count: {
                select: {
                    members: true,
                    invitations: { where: { expiresAt: { gt: new Date() } } }
                }
            }
        }
    })

    if (!orgData) return { success: false, error: "Organización no encontrada" }

    const totalSeatsUsed = orgData._count.members + orgData._count.invitations;

    // Fetch plan configuration to check limits
    const planConfig = await prisma.planConfig.findUnique({
        where: { id: orgData.subscriptionPlan }
    })

    if (planConfig && planConfig.maxSeats > 0 && totalSeatsUsed >= planConfig.maxSeats) {
        return {
            success: false,
            error: `El plan ${planConfig.name} tiene un límite de ${planConfig.maxSeats} ${planConfig.maxSeats === 1 ? 'miembro' : 'miembros'}. Actualiza tu plan para invitar más colaboradores.`
        }
    }

    const invitation = await prisma.invitation.create({
        data: {
            organizationId,
            token: randomUUID(),
            role,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
    })

    // Return the absolute URL for the invitation
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const invitationUrl = `${baseUrl}/invite/${invitation.token}`

    return { success: true, invitationUrl, token: invitation.token }
}

/**
 * Accepts an invitation using a token
 */
export async function acceptInvitation(token: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) {
        throw new Error("You must be logged in to accept an invitation")
    }

    const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: { organization: true }
    })

    if (!invitation || invitation.expiresAt < new Date()) {
        throw new Error("Invitation invalid or expired")
    }

    // Atomic transaction: Join organization and link profile
    await prisma.$transaction(async (tx) => {
        // 1. Create membership
        await tx.member.upsert({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId: invitation.organizationId
                }
            },
            update: {
                role: invitation.role
            },
            create: {
                userId: session.user.id,
                organizationId: invitation.organizationId,
                role: invitation.role
            }
        })

        // 2. Link profile to organization (primary organization for the user's agenda)
        await tx.profile.update({
            where: { userId: session.user.id },
            data: { organizationId: invitation.organizationId }
        })
    })

    revalidatePath("/dashboard")
    return { success: true, organizationName: invitation.organization.name }
}

/**
 * Gets organizations for the current user
 */
export async function getUserOrganizations() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) return []

    return await prisma.organization.findMany({
        where: {
            members: {
                some: { userId: session.user.id }
            }
        },
        include: {
            members: true
        }
    })
}

/**
 * Gets profiles managed by the current user in a specific organization
 */
export async function getManagedProfiles(organizationId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) throw new Error("Unauthorized")

    const currentMember = await prisma.member.findFirst({
        where: {
            organizationId,
            userId: session.user.id
        }
    })

    if (!currentMember || !["OWNER", "ADMIN", "MANAGER"].includes(currentMember.role)) {
        return []
    }

    const org = await prisma.organization.findUnique({
        where: { id: organizationId }
    })

    const planConfig = org ? await prisma.planConfig.findUnique({
        where: { id: org.subscriptionPlan }
    }) : null;

    const maxSeats = planConfig?.maxSeats ?? 0;

    const allMembers = await prisma.member.findMany({
        where: { organizationId },
        include: {
            user: {
                include: {
                    profile: true
                }
            }
        }
    })


    // Sort all members to determine who is active under the current plan
    // Priority: OWNER > ADMIN > MANAGER > PROFESSIONAL, then by createdAt
    const sortedMembers = [...allMembers].sort((a, b) => {
        const roleOrder = { "OWNER": 0, "ADMIN": 1, "MANAGER": 2, "PROFESSIONAL": 3 };
        const aVal = roleOrder[a.role as keyof typeof roleOrder] ?? 99;
        const bVal = roleOrder[b.role as keyof typeof roleOrder] ?? 99;
        if (aVal !== bVal) return aVal - bVal;
        return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return sortedMembers
        .filter(m => m.user.profile && m.userId !== session.user.id)
        .map(m => {
            const memberIndex = sortedMembers.findIndex(sm => sm.id === m.id);
            return {
                ...m.user.profile!,
                user: m.user,
                role: m.role,
                isPlanActive: maxSeats === 0 || memberIndex < maxSeats
            };
        })
}

/**
 * Fetches public-facing profiles of an organization (showOnOrgPage = true)
 */
export async function getOrganizationPublicProfiles(slug: string) {
    const organization = await prisma.organization.findUnique({
        where: { slug }
    })

    const planConfig = organization ? await prisma.planConfig.findUnique({
        where: { id: organization.subscriptionPlan }
    }) : null;

    if (!organization) return null

    // Query through Member - the source of truth for org membership
    const members = await prisma.member.findMany({
        where: { organizationId: organization.id },
        include: {
            user: {
                include: {
                    profile: {
                        include: {
                            services: { where: { isActive: true }, select: { id: true } }
                        }
                    }
                }
            }
        },
        orderBy: [
            { role: 'asc' },
            { createdAt: 'asc' }
        ]
    })

    // Keep only members who have a profile with showOnOrgPage = true
    const maxSeats = planConfig?.maxSeats ?? 0;

    // Filter by plan limits and visibility
    const visibleProfiles = members
        .filter(m => m.user.profile !== null && m.user.profile.showOnOrgPage)
        .map((m, index) => ({
            username: m.user.profile!.username,
            displayName: m.user.profile!.displayName || m.user.name || m.user.profile!.username,
            bio: m.user.profile!.bio,
            image: m.user.image,
            expertise: (m.user.profile as any).expertise || [],
            serviceCount: m.user.profile!.services.length,
            isPlanActive: maxSeats === 0 || index < maxSeats
        }))
        .filter(p => p.isPlanActive) // Only return profiles active in the plan
        .sort((a, b) => a.displayName.localeCompare(b.displayName))

    return {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        profiles: visibleProfiles
    }
}

/**
 * Toggles the showOnOrgPage flag for a profile.
 * - Any user can toggle their own profile.
 * - OWNER and MANAGER can toggle any member's profile within their organization.
 */
export async function toggleShowOnOrgPage(value: boolean, targetUserId?: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) throw new Error("Unauthorized")

    const resolvedTargetUserId = targetUserId ?? session.user.id

    // If modifying someone else's profile, verify caller has OWNER or MANAGER role
    if (resolvedTargetUserId !== session.user.id) {
        // Find a shared organization where the caller is OWNER or MANAGER
        const callerMembership = await prisma.member.findFirst({
            where: {
                userId: session.user.id,
                role: { in: ["OWNER", "MANAGER", "ADMIN"] },
                organization: {
                    members: {
                        some: { userId: resolvedTargetUserId }
                    }
                }
            }
        })

        if (!callerMembership) throw new Error("No tienes permisos para modificar este perfil")
    }

    await prisma.profile.update({
        where: { userId: resolvedTargetUserId },
        data: { showOnOrgPage: value }
    })

    revalidatePath("/dashboard/organizacion")
    return { success: true }
}

/**
 * Updates the organization name (and slug). Only OWNER and MANAGER allowed.
 */
export async function updateOrganizationName(organizationId: string, newName: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) throw new Error("Unauthorized")

    // Verify caller is OWNER or MANAGER
    const membership = await prisma.member.findFirst({
        where: {
            organizationId,
            userId: session.user.id,
            role: { in: ["OWNER", "MANAGER", "ADMIN"] }
        }
    })

    if (!membership) throw new Error("No tienes permisos para cambiar el nombre de la organización")

    const trimmedName = newName.trim()

    if (!trimmedName || trimmedName.length < 2) {
        throw new Error("El nombre debe tener al menos 2 caracteres")
    }

    // Check uniqueness (excluding current organization)
    const existing = await prisma.organization.findFirst({
        where: { name: trimmedName, NOT: { id: organizationId } }
    })
    if (existing) throw new Error(`Ya existe una organización con el nombre "${trimmedName}"`)

    const newSlug = trimmedName.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "")

    await prisma.organization.update({
        where: { id: organizationId },
        data: { name: trimmedName, slug: newSlug }
    })

    revalidatePath("/dashboard/organizacion")
    return { success: true, newSlug }
}
