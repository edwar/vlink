"use client"

import { create } from 'zustand'

interface ProfileState {
    viewAsProfileId: string | null
    setViewAsProfileId: (id: string | null) => void
    clearProfile: () => void
}

// Utility to get cookie on client side
const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
}

export const useProfileStore = create<ProfileState>((set) => ({
    viewAsProfileId: typeof window !== 'undefined' ? getCookie('vlink-view-as-profile-id') : null,

    setViewAsProfileId: (id) => {
        set({ viewAsProfileId: id })

        if (typeof window !== 'undefined') {
            if (!id || id === 'personal') {
                document.cookie = "vlink-view-as-profile-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
            } else {
                document.cookie = `vlink-view-as-profile-id=${id}; path=/; max-age=31536000; SameSite=Lax`
            }
        }
    },

    clearProfile: () => {
        set({ viewAsProfileId: null })
        if (typeof window !== 'undefined') {
            document.cookie = "vlink-view-as-profile-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
        }
    }
}))
