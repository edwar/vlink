import { auth } from "@/lib/auth"
import { headers, cookies } from "next/headers"
import prisma from "@/lib/prisma"

/**
 * Resolves the professional profile that the current user is authorized to manage or view.
 * If 'vlink-view-as-profile-id' cookie is present, it verifies the user's permission
 * within the organization of that profile.
 */
export async function getEffectiveProfile() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const cookieStore = await cookies()
    const viewAsProfileId = cookieStore.get("vlink-view-as-profile-id")?.value

    // 1. If no "view as" is specified, return the user's personal profile
    if (!viewAsProfileId) {
        try {
            const personalProfile = await prisma.profile.findUnique({
                where: { userId: session.user.id },
                include: { organization: true, user: true }
            })
            if (!personalProfile) throw new Error("Personal profile not found")
            return personalProfile
        } catch (error) {
            console.error(error)
        }
    }

    // 2. If "view as" is specified, verify permissions
    const targetProfile = await prisma.profile.findUnique({
        where: { id: viewAsProfileId },
        include: { organization: true, user: true }
    })

    if (!targetProfile) {
        throw new Error("Target profile not found")
    }

    // If it's their own profile, just return it
    if (targetProfile.userId === session.user.id) {
        return targetProfile
    }

    if (!(await canManageProfile(session.user.id, targetProfile.userId))) {
        throw new Error("Access denied: You don't have permission to manage this profile's agenda")
    }

    return targetProfile
}

/**
 * True si `actorUserId` es el dueño del perfil o es OWNER/MANAGER en alguna
 * organización compartida con `targetUserId`.
 */
export async function canManageProfile(actorUserId: string, targetUserId: string) {
    if (actorUserId === targetUserId) return true

    const commonMembership = await prisma.member.findFirst({
        where: {
            userId: actorUserId,
            role: { in: ["OWNER", "MANAGER"] },
            organization: {
                members: { some: { userId: targetUserId } }
            }
        },
        select: { organizationId: true }
    })

    return !!commonMembership
}
