import prisma from "@/lib/prisma"

/** Hitos de citas en los que se invita (una sola vez) a apoyar el proyecto. */
export const DONATION_MILESTONES = [25, 100, 250, 500, 1000] as const

export function isBrandingRemoved(until: Date | null | undefined, now = new Date()) {
    return !!until && until > now
}

/**
 * ¿Debe mostrarse "Agenda creada con VLink" en la página pública de un profesional?
 * Se oculta si el profesional o alguna de sus organizaciones tiene la marca retirada vigente.
 */
export async function shouldShowBrandingForProfile(username: string) {
    const profile = await prisma.profile.findUnique({
        where: { username },
        select: {
            brandingRemovedUntil: true,
            organization: { select: { brandingRemovedUntil: true } },
            user: { select: { memberships: { select: { organization: { select: { brandingRemovedUntil: true } } } } } },
        },
    })
    if (!profile) return true
    if (isBrandingRemoved(profile.brandingRemovedUntil)) return false
    if (isBrandingRemoved(profile.organization?.brandingRemovedUntil)) return false
    return !profile.user.memberships.some((m) => isBrandingRemoved(m.organization.brandingRemovedUntil))
}

/** ¿Debe mostrarse la marca en las páginas públicas de una organización? */
export async function shouldShowBrandingForOrg(slug: string) {
    const org = await prisma.organization.findUnique({
        where: { slug },
        select: { brandingRemovedUntil: true },
    })
    return !isBrandingRemoved(org?.brandingRemovedUntil)
}

/** Mayor hito alcanzado para un número de citas (0 si ninguno). */
export function reachedMilestone(count: number) {
    return [...DONATION_MILESTONES].reverse().find((m) => count >= m) ?? 0
}
