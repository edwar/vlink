"use client"

import { useTheme } from "next-themes"
import { Toaster as SileoToaster } from "sileo"
import { useEffect, useState } from "react"

export function SileoToasterProvider() {
    const { theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <SileoToaster
            theme={(resolvedTheme || theme || "system") as "light" | "dark" | "system"}
        />
    )
}
