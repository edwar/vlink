"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="h-10 w-10" /> // Spacer
    }

    return (
        <button
            id="tour-theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl p-2.5 hover:bg-accent hover:text-accent-foreground transition-all active:scale-95 border border-primary/5 bg-background/50 shadow-sm"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="h-5 w-5 text-primary" />
            ) : (
                <Moon className="h-5 w-5 text-primary" />
            )}
        </button>
    )
}
