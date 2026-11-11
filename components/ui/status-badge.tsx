import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const tones = {
    success: "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25",
    neutral: "bg-muted text-muted-foreground ring-border",
    warning: "bg-amber-500/10 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
} as const

const dots = {
    success: "bg-emerald-500 dark:bg-emerald-400",
    neutral: "bg-muted-foreground/60",
    warning: "bg-amber-500 dark:bg-amber-400",
} as const

/**
 * Insignia de estado discreta (texto normal, sin mayúsculas forzadas).
 * Usar para estados como "Conectado", "Activo" o "Pausado".
 */
export function StatusBadge({
    tone = "neutral",
    dot = false,
    pulse = false,
    className,
    children,
}: {
    tone?: keyof typeof tones
    dot?: boolean
    pulse?: boolean
    className?: string
    children: ReactNode
}) {
    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                tones[tone],
                className
            )}
        >
            {dot && (
                <span aria-hidden className="relative flex size-1.5">
                    {pulse && <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", dots[tone])} />}
                    <span className={cn("relative inline-flex size-1.5 rounded-full", dots[tone])} />
                </span>
            )}
            {children}
        </span>
    )
}
