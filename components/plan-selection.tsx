"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, Sparkles, Users, Building2, Crown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Plan = {
    id: "BASIC" | "TEAM" | "CORPORATE"
    name: string
    price: string
    limit: string
    features: string[]
    maxSeats: number
    active: boolean
}

interface PlanSelectionProps {
    plans: Plan[]
    selectedPlan: "BASIC" | "TEAM" | "CORPORATE"
    onSelect: (plan: "BASIC" | "TEAM" | "CORPORATE") => void
}

const PLAN_ICONS: Record<string, React.ElementType> = {
    BASIC: Users,
    TEAM: Building2,
    CORPORATE: Crown,
}

const PLAN_COLORS: Record<string, { bg: string; border: string; text: string; accent: string; glow: string }> = {
    BASIC: {
        bg: "from-zinc-500/5 to-transparent",
        border: "border-border/50 hover:border-zinc-400/50",
        text: "text-zinc-600 dark:text-zinc-400",
        accent: "bg-zinc-500/10",
        glow: "bg-zinc-500/5",
    },
    TEAM: {
        bg: "from-blue-500/8 to-transparent",
        border: "border-border/50 hover:border-blue-400/50",
        text: "text-blue-600 dark:text-blue-400",
        accent: "bg-blue-500/10",
        glow: "bg-blue-500/5",
    },
    CORPORATE: {
        bg: "from-primary/8 to-transparent",
        border: "border-border/50 hover:border-primary/50",
        text: "text-primary",
        accent: "bg-primary/10",
        glow: "bg-primary/5",
    },
}

export function PlanSelection({ plans, selectedPlan, onSelect }: PlanSelectionProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 mx-auto">
                    <Sparkles className="h-3 w-3" />
                    Primer mes gratis
                </div>
                <p className="text-muted-foreground text-sm font-medium max-w-md mx-auto">
                    Elige el plan que mejor se adapte a tu negocio. Tu primer mes es <span className="text-foreground font-bold">completamente gratis</span>, sin compromisos.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {plans.filter(p => p.active).map((plan) => {
                    const isSelected = selectedPlan === plan.id
                    const Icon = PLAN_ICONS[plan.id] || Users
                    const colors = PLAN_COLORS[plan.id] || PLAN_COLORS.BASIC

                    return (
                        <motion.button
                            key={plan.id}
                            type="button"
                            onClick={() => onSelect(plan.id)}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-300 overflow-hidden group",
                                isSelected
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                    : cn("bg-card", colors.border)
                            )}
                        >
                            {/* Selected indicator */}
                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Background glow */}
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150",
                                colors.glow
                            )} />

                            <div className="relative z-10 flex items-start gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                                    isSelected ? "bg-primary text-primary-foreground" : colors.accent + " " + colors.text
                                )}>
                                    <Icon className="h-6 w-6" />
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-baseline gap-3">
                                        <h3 className="text-lg font-black font-display tracking-tight">
                                            {plan.name}
                                        </h3>
                                        <span className="text-sm font-bold text-muted-foreground">
                                            {plan.price}
                                            <span className="text-[10px] font-medium">/mes</span>
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-muted-foreground">
                                        {plan.limit}
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {plan.features.slice(0, 3).map((feature) => (
                                            <span
                                                key={feature}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/50 text-[10px] font-bold text-muted-foreground"
                                            >
                                                <CheckCircle2 className="h-2.5 w-2.5 text-primary/60" />
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
