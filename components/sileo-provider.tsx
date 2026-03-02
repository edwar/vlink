"use client"

import { useTheme } from "next-themes"
import { Toaster as SileoToaster } from "sileo"

export function SileoToasterProvider() {
    const { theme, resolvedTheme } = useTheme()

    return (
        <SileoToaster
            theme={(resolvedTheme || theme || "system") as "light" | "dark" | "system"}
        />
    )
}
