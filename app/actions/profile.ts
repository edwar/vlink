"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getProfile() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Fetch profile and user data (for email/accounts)
    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        include: {
            user: {
                include: {
                    accounts: true
                }
            }
        }
    })

    if (!profile) {
        throw new Error("Profile not found")
    }

    // Check if the user has a Google account connected
    const googleAccount = profile.user.accounts.find((acc: any) => acc.providerId === 'google')
    const isGoogleConnected = !!googleAccount
    const email = profile.user.email

    return {
        username: profile.username,
        bio: profile.bio || "",
        email: email,
        isGoogleConnected: isGoogleConnected
    }
}

export async function updateProfile(data: { username: string, bio: string }) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const { username, bio } = data

    // Basic validation
    if (!username || username.trim() === "") {
        throw new Error("Username cannot be empty")
    }

    // Check if username is taken by another user
    const existingProfile = await prisma.profile.findUnique({
        where: { username }
    })

    if (existingProfile && existingProfile.userId !== session.user.id) {
        throw new Error("Username is already taken")
    }

    // Update the profile
    await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
            username: username.trim(),
            bio: bio.trim()
        }
    })

    revalidatePath("/dashboard/perfil")

    return { success: true }
}
