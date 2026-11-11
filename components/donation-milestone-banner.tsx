"use client"

import { useState, useTransition } from "react"
import { Coffee, X } from "lucide-react"
import { dismissDonationMilestone } from "@/app/actions/profile"

/** Aviso que aparece una sola vez por hito de citas (25, 100, 250…) invitando a apoyar el proyecto. */
export function DonationMilestoneBanner({ milestone, donationUrl }: { milestone: number; donationUrl: string }) {
    const [hidden, setHidden] = useState(false)
    const [, startTransition] = useTransition()

    if (hidden) return null

    const dismiss = () => {
        setHidden(true)
        startTransition(() => { dismissDonationMilestone(milestone).catch(() => {}) })
    }

    return (
        <div
            role="status"
            className="relative flex flex-col gap-4 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 pr-12 sm:flex-row sm:items-center sm:justify-between"
        >
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Coffee className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <p className="font-semibold text-foreground">¡Ya llevas {milestone} citas con VLink! 🎉</p>
                    <p className="text-sm text-muted-foreground">
                        VLink lo desarrolla una sola persona. Si te está ahorrando tiempo, puedes invitarme un café; es totalmente voluntario.
                    </p>
                </div>
            </div>
            <a
                href={donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismiss}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
            >
                <Coffee className="h-4 w-4" /> Invitar un café
            </a>
            <button
                type="button"
                onClick={dismiss}
                aria-label="Cerrar aviso"
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
