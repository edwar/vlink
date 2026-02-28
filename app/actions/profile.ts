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
        bio: fullProfile.bio || "",
        email: email,
        isGoogleConnected: isGoogleConnected,
        hasCalendarScope: !!hasCalendarScope
    }
}

export async function updateProfile(data: { username: string, bio: string }) {
    const profile = await getEffectiveProfile()

    const { username, bio } = data

    // Basic validation
    if (!username || username.trim() === "") {
        throw new Error("Username cannot be empty")
    }

    // Check if username is taken by another user
    const existingProfile = await prisma.profile.findUnique({
        where: { username }
    })

    if (existingProfile && existingProfile.id !== profile.id) {
        throw new Error("Username is already taken")
    }

    // Update the profile
    await prisma.profile.update({
        where: { id: profile.id },
        data: {
            username: username.trim(),
            bio: bio.trim()
        }
    })

    revalidatePath("/dashboard/perfil")

    return { success: true }
}
