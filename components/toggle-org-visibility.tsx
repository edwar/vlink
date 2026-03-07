"use client"

import { useState } from "react"
import { toggleShowOnOrgPage } from "@/app/actions/organization"
import { sileo } from "sileo"
import { Globe, EyeOff } from "lucide-react"

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
        <div className="flex items-center gap-2">
            {enabled
                ? <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                : <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            }
            <button
                onClick={handleToggle}
                disabled={loading}
                aria-label={`Visibilidad de ${memberName} en página de organización`}
                title={enabled ? "Visible en página pública" : "Oculto de página pública"}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${enabled
                    ? "bg-primary dark:bg-primary-foreground border-primary"
                    : "bg-muted dark:bg-muted-foreground border-muted-foreground/20"
                    }`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                />
            </button>
        </div>
    )
}
