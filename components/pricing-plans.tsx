"use client"

import { useState } from "react"
import { CheckCircle2, ShieldCheck, Building, User, Info, Loader2 } from "lucide-react"
import { createCheckoutSession, testSetPlan } from "@/app/actions/billing"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type PlanType = "FREE" | "TEAM" | "CORPORATE"

interface DatabasePlanConfig {
    id: string
    price: string
    limit: string
    features: string[]
}

interface PricingPlansProps {
    organizationId: string
    currentPlan: PlanType
    isAdmin?: boolean
    initialPlans?: DatabasePlanConfig[]
}

export function PricingPlans({ organizationId, currentPlan, isAdmin = false, initialPlans }: PricingPlansProps) {
    const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubscribe = async (plan: "TEAM" | "CORPORATE") => {
        setLoadingPlan(plan)
        setError(null)

        try {
            const { success, url, error: err } = await createCheckoutSession(organizationId, plan)

            // if Mercado Pago generated a link, send user to Checkout
            if (success && url) {
                window.location.href = url
            } else {
                throw new Error(err || "Error desconocido contactando a Mercado Pago")
            }
        } catch (e: any) {
            setError(e.message)
            setLoadingPlan(null)
        }
    }

    const handleTestChange = async (plan: PlanType) => {
        setLoadingPlan(plan)
        await testSetPlan(organizationId, plan)
        setLoadingPlan(null)
    }

    // Map database plans to UI display properties
    const plansInfo = initialPlans || []
    const plans = [
        {
            id: "FREE" as const,
            name: "Individual",
            price: plansInfo.find(p => p.id === 'FREE')?.price || "Gratis",
            period: "para siempre",
            description: "Para profesionales independientes empezando.",
            icon: User,
            color: "text-zinc-500",
            bgLight: "bg-zinc-500/10",
            border: "border-zinc-500/20",
            features: plansInfo.find(p => p.id === 'FREE')?.features || [
                "1 Perfil profesional",
                "Link de reservas público",
                "Agenda básica",
                "Recordatorios por email"
            ],
            limit: plansInfo.find(p => p.id === 'FREE')?.limit || "Máximo 1 asiento"
        },
        {
            id: "TEAM" as const,
            name: "Equipos",
            price: plansInfo.find(p => p.id === 'TEAM')?.price || "$49.000",
            period: "COP / mes",
            description: "Para clínicas y agencias en crecimiento.",
            icon: ShieldCheck,
            color: "text-blue-500",
            bgLight: "bg-blue-500/10",
            border: "border-blue-500/20",
            features: plansInfo.find(p => p.id === 'TEAM')?.features || [
                "Hasta 5 profesionales separados",
                "Página de organización (Directorio)",
                "Analytics avanzadas del equipo",
                "Soporte prioritario"
            ],
            limit: plansInfo.find(p => p.id === 'TEAM')?.limit || "Hasta 5 asientos"
        },
        {
            id: "CORPORATE" as const,
            name: "Corporativo",
            price: plansInfo.find(p => p.id === 'CORPORATE')?.price || "$99.000",
            period: "COP / mes",
            description: "Gestión a gran escala y múltiples sedes.",
            icon: Building,
            color: "text-primary",
            bgLight: "bg-primary/10",
            border: "border-primary/20",
            features: plansInfo.find(p => p.id === 'CORPORATE')?.features || [
                "Profesionales ilimitados",
                "Subdominios personalizados (Pronto)",
                "Integración con Zapier (Pronto)",
                "Manager de cuentas dedicado"
            ],
            limit: plansInfo.find(p => p.id === 'CORPORATE')?.limit || "Asientos ilimitados"
        }
    ]

    return (
        <div className="space-y-12">
            {error && (
                <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-xl text-red-600 font-medium flex items-center gap-3">
                    <Info className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Test Controls (Developer/Admin bypass) */}
            {isAdmin && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-amber-600" />
                        <div>
                            <p className="text-sm font-black text-amber-700">Modo Desarrollo (Simulador)</p>
                            <p className="text-xs text-amber-600/80 font-medium">Fuerza el cambio de plan sin pasar por pasarela para probar límites en la app.</p>
                        </div>
                    </div>
                    <div className="flex bg-background border border-border/50 rounded-xl p-1 gap-1">
                        <button onClick={() => handleTestChange("FREE")} className={cn("px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-colors", currentPlan === "FREE" ? "bg-amber-500 text-white" : "hover:bg-muted")}>Free</button>
                        <button onClick={() => handleTestChange("TEAM")} className={cn("px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-colors", currentPlan === "TEAM" ? "bg-amber-500 text-white" : "hover:bg-muted")}>Team</button>
                        <button onClick={() => handleTestChange("CORPORATE")} className={cn("px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-colors", currentPlan === "CORPORATE" ? "bg-amber-500 text-white" : "hover:bg-muted")}>Corp</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
                {plans.map((plan) => {
                    const isCurrent = currentPlan === plan.id;
                    const Icon = plan.icon;
                    return (
                        <div
                            key={plan.id}
                            className={cn(
                                "relative flex flex-col p-8 rounded-[2.5rem] border-2 transition-all duration-300",
                                isCurrent
                                    ? `bg-card border-[3px] shadow-2xl ${plan.id === 'TEAM' ? 'border-blue-500 shadow-blue-500/20' : plan.id === 'CORPORATE' ? 'border-primary shadow-primary/20' : 'border-zinc-500/50 shadow-zinc-500/10'}`
                                    : "bg-muted/20 border-primary/20 hover:bg-card hover:border-primary hover:shadow-xl"
                            )}
                        >
                            {isCurrent && (
                                <div className={cn(
                                    "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg",
                                    plan.id === "TEAM" ? "bg-blue-500" : plan.id === "CORPORATE" ? "bg-primary" : "bg-zinc-600"
                                )}>
                                    Plan Actual
                                </div>
                            )}

                            <div className="mb-6 space-y-4">
                                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg", plan.bgLight)}>
                                    <Icon className={cn("h-7 w-7", plan.color)} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-display font-black tracking-tight">{plan.name}</h3>
                                    <p className="text-muted-foreground text-sm font-medium mt-1">{plan.description}</p>
                                </div>
                            </div>

                            <div className="mb-8 flex items-end gap-2 border-b border-border/50 pb-8">
                                <span className={cn("text-5xl font-black font-display tracking-tighter leading-none", plan.id === "FREE" ? "text-foreground" : plan.color)}>
                                    {plan.price === "Gratis" ? "Gratis" : Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0 }).format(Number(plan.price))}
                                </span>
                                <span className="text-muted-foreground font-bold tracking-tight pb-1">{plan.period}</span>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                <p className="text-xs font-black uppercase tracking-widest text-foreground/70">{plan.limit}</p>
                                <ul className="space-y-4">
                                    {plan.features.map((feat: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                                            <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", plan.bgLight)}>
                                                <CheckCircle2 className={cn("h-3.5 w-3.5", plan.color)} />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-auto mt-auto">
                                <Button
                                    variant={isCurrent ? "outline" : "vlink"}
                                    size="lg"
                                    className="w-full"
                                    onClick={() => {
                                        if (plan.id === "FREE") {
                                            handleTestChange("FREE")
                                        } else {
                                            handleSubscribe(plan.id)
                                        }
                                    }}
                                    disabled={loadingPlan === plan.id || isCurrent}
                                >
                                    {loadingPlan === plan.id ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : isCurrent ? (
                                        "Activo"
                                    ) : plan.id === "FREE" ? (
                                        "Degradar a Gratis"
                                    ) : (
                                        `Cambiar a ${plan.name}`
                                    )}
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="text-center md:text-left mt-8 max-w-2xl px-2">
                <p className="text-sm font-medium text-muted-foreground">
                    Los pagos se procesan de manera local y 100% segura a través de la infraestructura de <strong className="text-foreground">Mercado Pago Colombia</strong>. VLink no almacena la información de tus tarjetas ni métodos de pago directos.
                </p>
            </div>
        </div>
    )
}
