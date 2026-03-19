"use client"

import { useState, useEffect } from "react"
import { getUserOrganizations } from "@/app/actions/organization"
import { CrownIcon, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

const PLAN_LABELS: Record<string, string> = {
    BASIC: "Básico",
    TEAM: "Equipos",
    ENTERPRISE: "Corporativo"
}

export function PlanBadge({ onClick }: { onClick?: () => void }) {
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

    if (!org) {
        return (
            <Link
                onClick={onClick}
                href="/dashboard/organizacion/planes"
                className="plan-badge-shiny group relative flex items-center gap-3 px-3 py-3 rounded-2xl bg-linear-to-br from-yellow-200 via-amber-400 to-yellow-600 border border-yellow-300/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all duration-300 overflow-hidden"
            >
                {/* Shiny sweep overlay */}
                <div className="pointer-events-none absolute inset-0 plan-badge-shine" aria-hidden="true" />

                <div className="h-9 w-9 rounded-xl bg-yellow-950/10 flex items-center justify-center text-yellow-950 shrink-0 transition-transform group-hover:scale-110">
                    <CrownIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 text-left relative z-10">
                    <p className="text-[10px] text-yellow-950/80 font-black uppercase tracking-widest leading-none mb-1">
                        Upgrade
                    </p>
                    <p className="text-sm text-yellow-950 font-black leading-tight">
                        Mejorar Plan
                    </p>
                </div>
                <ChevronRight className="h-4 w-4 text-yellow-950/50 group-hover:text-yellow-950 group-hover:translate-x-0.5 transition-all shrink-0 relative z-10" />

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
                        color-mix(in srgb, currentColor 8%, transparent) 25%,
                        color-mix(in srgb, currentColor 20%, transparent) 50%,
                        color-mix(in srgb, currentColor 8%, transparent) 75%,
                        transparent 100%
                    );
                    color: #fff;
                    width: 30%;
                    animation: plan-badge-shiny 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>
            </Link>
        )
    }

    const plan = org.subscriptionPlan || "BASIC"
    const label = PLAN_LABELS[plan] || plan

    return (
        <Link
            onClick={onClick}
            href="/dashboard/organizacion/planes"
            className="plan-badge-shiny group relative flex items-center gap-3 px-3 py-3 rounded-2xl bg-linear-to-br from-yellow-200 via-amber-400 to-yellow-600 border border-yellow-300/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all duration-300 overflow-hidden"
        >
            {/* Shiny sweep overlay */}
            <div className="pointer-events-none absolute inset-0 plan-badge-shine" aria-hidden="true" />

            <div className="h-9 w-9 rounded-xl bg-yellow-950/10 flex items-center justify-center text-yellow-950 group-hover:bg-yellow-950 group-hover:text-yellow-400 transition-colors shrink-0 relative z-10">
                <CrownIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 relative z-10 text-left">
                <p className="text-[10px] text-yellow-950/80 font-black uppercase tracking-widest leading-none mb-1">
                    Plan Actual
                </p>
                <p className="text-sm text-yellow-950 font-black">
                    {label}
                </p>
            </div>
            <ChevronRight className="h-4 w-4 text-yellow-950/50 group-hover:text-yellow-950 group-hover:translate-x-0.5 transition-all shrink-0 relative z-10" />

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
                        color-mix(in srgb, currentColor 8%, transparent) 25%,
                        color-mix(in srgb, currentColor 20%, transparent) 50%,
                        color-mix(in srgb, currentColor 8%, transparent) 75%,
                        transparent 100%
                    );
                    color: #fff;
                    width: 30%;
                    animation: plan-badge-shiny 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>
        </Link>
    )
}
