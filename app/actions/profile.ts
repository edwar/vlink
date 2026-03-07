"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getEffectiveProfile } from "@/lib/permissions"

export async function getProfile() {
    const profile = await getEffectiveProfile()

    // Fetch full data for the effective profile
    const fullProfile = await prisma.profile.findUnique({
        where: { id: profile.id },
        include: {
            user: {
                include: {
                    accounts: true
                }
            }
        }
    })

    if (!fullProfile) {
        throw new Error("Profile not found")
    }

    // Check if the user has a Google account connected and the required scope
    const googleAccount = fullProfile.user.accounts.find((acc: any) => acc.providerId === 'google')
    const isGoogleConnected = !!googleAccount
    const hasCalendarScope = googleAccount?.scope?.includes('https://www.googleapis.com/auth/calendar.events')
    const email = fullProfile.user.email

    return {
        id: fullProfile.id,
        username: fullProfile.username,
        displayName: fullProfile.displayName || fullProfile.user.name,
        image: fullProfile.user.image,
        bio: fullProfile.bio || "",
        email: email,
        isGoogleConnected: isGoogleConnected,
        hasCalendarScope: !!hasCalendarScope,
        isSyncEnabled: !!fullProfile.webhookChannelId && !!fullProfile.webhookExpiresAt && fullProfile.webhookExpiresAt > new Date()
    }
}

export async function updateProfile(data: { username: string, bio: string }) {
    const profile = await getEffectiveProfile()

    const rawUsername = data.username.trim().toLowerCase()
    const { bio } = data

    // Validate username format
    if (!rawUsername || rawUsername.length < 3) {
        throw new Error("El username debe tener al menos 3 caracteres")
    }

    if (!/^[a-z0-9_-]+$/.test(rawUsername)) {
        throw new Error("El username solo puede contener letras, números, guiones (-) y guiones bajos (_)")
    }

    // Check if username is taken by another user
    const existingProfile = await prisma.profile.findUnique({
        where: { username: rawUsername }
    })

    if (existingProfile && existingProfile.id !== profile.id) {
        throw new Error(`El username "${rawUsername}" ya está en uso. Por favor elige otro.`)
    }

    // Update the profile
    await prisma.profile.update({
        where: { id: profile.id },
        data: {
            username: rawUsername,
            bio: bio.trim()
        }
    })

    revalidatePath("/dashboard/perfil")

    return { success: true }
}

export async function disconnectGoogle() {
    const profile = await getEffectiveProfile()

    // Delete the Google account record for this user
    await prisma.account.deleteMany({
        where: {
            userId: profile.userId,
            providerId: 'google'
        }
    })

    revalidatePath("/dashboard/perfil")

    return { success: true }
}

export async function enableCalendarSync() {
    const profile = await getEffectiveProfile()
    const { subscribeToGoogleCalendar } = await import("@/lib/google-calendar")

    const dbProfile = await prisma.profile.findUnique({ where: { id: profile.id } })
    if (dbProfile?.webhookChannelId && dbProfile?.webhookExpiresAt && dbProfile.webhookExpiresAt > new Date()) {
        return { success: true }
    }

    const success = await subscribeToGoogleCalendar(profile.id)
    if (!success) {
        throw new Error("No se pudo activar la sincronización con Google Calendar")
    }

    revalidatePath("/dashboard/perfil")
    return { success: true }
}
