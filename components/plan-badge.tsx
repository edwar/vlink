"use client"

import { useState, useEffect } from "react"
import { getUserOrganizations } from "@/app/actions/organization"
import { Sparkles, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

const PLAN_LABELS: Record<string, string> = {
    FREE: "Gratuito",
    TEAM: "Equipos",
    ENTERPRISE: "Corporativo"
}

const PLAN_COLORS: Record<string, string> = {
    FREE: "text-muted-foreground",
    TEAM: "text-blue-500",
    ENTERPRISE: "text-amber-500"
}

export function PlanBadge() {
    const [org, setOrg] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const orgs = await getUserOrganizations()
                if (orgs.length > 0) {
                    setOrg(orgs[0])
                }
            } catch {
                // silently ignore
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center gap-3 px-3 py-3 rounded-2xl border border-border/30">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-2.5 w-16 rounded-full" />
                    <Skeleton className="h-3.5 w-20 rounded-full" />
                </div>
            </div>
        )
    }

    if (!org) return null

    const plan = org.subscriptionPlan || "FREE"
    const label = PLAN_LABELS[plan] || plan
    const color = PLAN_COLORS[plan] || "text-muted-foreground"

    return (
        <Link
            href="/dashboard/organizacion/planes"
            className="plan-badge-shiny group relative flex items-center gap-3 px-3 py-3 rounded-2xl bg-linear-to-r from-primary/5 to-transparent border border-border/30 hover:border-primary/20 hover:from-primary/10 transition-all duration-300 overflow-hidden"
        >
            {/* Shiny sweep overlay */}
            <div className="pointer-events-none absolute inset-0 plan-badge-shine" aria-hidden="true" />

            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 relative z-10">
                <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-0.5">
                    Plan Actual
                </p>
                <p className={`text-sm font-black ${color}`}>
                    {label}
                </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 relative z-10" />

            <style>{`
                @keyframes plan-badge-shiny {
                    0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
                    5% { opacity: 1; }
                    20% { transform: translateX(320%) skewX(-12deg); opacity: 1; }
                    25% { opacity: 0; }
                    100% { opacity: 0; transform: translateX(320%) skewX(-12deg); }
                }
                .plan-badge-shine {
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        color-mix(in srgb, currentColor 4%, transparent) 25%,
                        color-mix(in srgb, currentColor 10%, transparent) 50%,
                        color-mix(in srgb, currentColor 4%, transparent) 75%,
                        transparent 100%
                    );
                    color: var(--primary);
                    width: 60%;
                    animation: plan-badge-shiny 30s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>
        </Link>
    )
}
