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

    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") + "-" + Math.random().toString(36).slice(-4)

    const organization = await prisma.organization.create({
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
        throw new Error("Unauthorized")
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
        throw new Error("You don't have permission to create invitations for this organization")
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

        // 2. Link profile to organization (if it's a professional)
        if (invitation.role === "PROFESSIONAL") {
            await tx.profile.update({
                where: { userId: session.user.id },
                data: { organizationId: invitation.organizationId }
            })
        }

        // 3. Delete invitation (one-time use or keep it? Let's keep it clean)
        // Optionally delete invitation if you want it to be single-use
        // await tx.invitation.delete({ where: { id: invitation.id } })
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

    // Obtener el rol del usuario actual en la organización
    const currentMember = await prisma.member.findFirst({
        where: {
            organizationId,
            userId: session.user.id
        }
    })

    // Si no es miembro o no tiene rol de gestión, no devuelve perfiles
    if (!currentMember || !["OWNER", "ADMIN", "MANAGER"].includes(currentMember.role)) {
        return []
    }

    // Obtener todos los miembros de la organización con sus perfiles
    const allMembers = await prisma.member.findMany({
        where: {
            organizationId,
            userId: { not: session.user.id } // No incluimos al usuario mismo (ya tiene su opción "Personal")
        },
        include: {
            user: {
                include: {
                    profile: true
                }
            }
        }
    })

    // Aplicar lógica de visibilidad solicitada:
    // 1. OWNER le aparece al MANAGER (para administrar su agenda)
    // 2. MANAGER NO le sale al OWNER
    const filteredMembers = allMembers.filter(m => {
        if (currentMember.role === "OWNER") {
            // El propietario solo ve profesionales, no gestores/admins
            return m.role === "PROFESSIONAL"
        }

        if (currentMember.role === "MANAGER" || currentMember.role === "ADMIN") {
            // El gestor puede ver a todos (Owner y Profesionales) para administrar sus agendas
            return m.role === "OWNER" || m.role === "PROFESSIONAL"
        }

        return false
    })

    return filteredMembers
        .filter(m => m.user.profile)
        .map(members => ({
            ...members.user.profile!,
            user: members.user,
            role: members.role
        }))
}
