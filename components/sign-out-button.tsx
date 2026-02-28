"use client"

import { signOut, useSession } from "@/lib/auth-client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

/**
 * Sign-out button that only renders when the user has an active session.
 * Shows text on desktop, icon-only on mobile. Designed for the landing page nav.
 */
export function SignOutButton() {
    const { data: session } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    if (!session?.user) return null

    const handleSignOut = async () => {
        setIsLoading(true)
        try {
            await signOut()
            router.push("/")
            router.refresh()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-muted-foreground border border-border/60 hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all disabled:opacity-50"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
        >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">
                {isLoading ? "Saliendo..." : "Salir"}
            </span>
        </button>
    )
}
