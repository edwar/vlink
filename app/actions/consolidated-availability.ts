"use server"

import { getOrganizationPublicProfiles } from "@/app/actions/organization"
import { getAvailableSlots } from "@/app/actions/booking"

export async function getOrgConsolidatedSlots(orgSlug: string, date: Date) {
    const org = await getOrganizationPublicProfiles(orgSlug)
    if (!org) throw new Error("Organización no encontrada")

    const results: Array<{
        profile: { username: string; displayName: string; image: string | null }
        slots: string[]
    }> = []

    for (const profile of org.profiles) {
        if (profile.serviceCount === 0) continue

        try {
            // Defaulting to 30 mins duration for consolidated search
            const slots = await getAvailableSlots(profile.username, date, 30)
            if (slots.length > 0) {
                results.push({
                    profile: {
                        username: profile.username,
                        displayName: profile.displayName,
                        image: profile.image
                    },
                    slots
                })
            }
        } catch (error) {
            console.error(`Error fetching slots for ${profile.username}:`, error)
        }
    }

    return results
}
