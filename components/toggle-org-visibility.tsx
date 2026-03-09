"use client"

import { useState } from "react"
import { toggleShowOnOrgPage } from "@/app/actions/organization"
import { sileo } from "sileo"
import { Globe, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToggleOrgVisibilityProps {
    initialValue: boolean
    targetUserId: string  // The user whose profile visibility we're toggling
    memberName: string    // For the toast message
}

export function ToggleOrgVisibility({ initialValue, targetUserId, memberName }: ToggleOrgVisibilityProps) {
    const [enabled, setEnabled] = useState(initialValue)
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        setLoading(true)
        try {
            const newValue = !enabled
            await toggleShowOnOrgPage(newValue, targetUserId)
            setEnabled(newValue)
            sileo.success({
                title: newValue ? "Perfil visible" : "Perfil oculto",
                description: newValue
                    ? `${memberName} ahora aparece en la página pública de la organización.`
                    : `${memberName} ya no aparece en la página pública de la organización.`
            })
        } catch {
            sileo.error({ title: "Error", description: "No se pudo actualizar la visibilidad." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2.5">
            {enabled
                ? <Globe className="h-4 w-4 text-foreground/80 shrink-0" />
                : <EyeOff className="h-4 w-4 text-muted-foreground/60 shrink-0" />
            }
            <button
                onClick={handleToggle}
                disabled={loading}
                aria-label={`Visibilidad de ${memberName} en página de organización`}
                title={enabled ? "Visible en página pública" : "Oculto de página pública"}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    enabled ? "bg-primary" : "bg-input"
                )}
            >
                <span
                    className={cn(
                        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                        enabled ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    )
}
