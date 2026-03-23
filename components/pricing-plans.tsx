"use client"

import { useState } from "react"
import { CheckCircle2, ShieldCheck, Building, User, Info, Loader2 } from "lucide-react"
import { createCheckoutSession, testSetPlan } from "@/app/actions/billing"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ExternalLink, CreditCard } from "lucide-react"

type PlanType = "BASIC" | "TEAM" | "CORPORATE"

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
    mpSubscriptionId?: string | null
}

export function PricingPlans({ organizationId, currentPlan, isAdmin = false, initialPlans, mpSubscriptionId }: PricingPlansProps) {
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
            id: "BASIC" as const,
            name: "Básico",
            price: plansInfo.find(p => p.id === 'BASIC')?.price || "Gratis",
            period: "para siempre",
            description: "Para profesionales independientes empezando.",
            icon: User,
            mustPopulate: false,
            color: "text-zinc-500",
            bgLight: "bg-zinc-500/10",
            border: "border-zinc-500/20",
            features: plansInfo.find(p => p.id === 'BASIC')?.features || [
                "1 Perfil profesional",
                "Link de reservas público",
                "Agenda básica",
                "Recordatorios por email"
            ],
            limit: plansInfo.find(p => p.id === 'BASIC')?.limit || "Máximo 1 asiento"
        },
        {
            id: "TEAM" as const,
            name: "Equipos",
            price: plansInfo.find(p => p.id === 'TEAM')?.price || "$49.000",
            period: "COP / mes",
            description: "Para clínicas y agencias en crecimiento.",
            icon: ShieldCheck,
            mustPopulate: true,
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
            mustPopulate: false,
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
                        <button onClick={() => handleTestChange("BASIC")} className={cn("px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-colors", currentPlan === "BASIC" ? "bg-amber-500 text-white" : "hover:bg-muted")}>Basic</button>
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
                                "relative flex flex-col p-8 rounded-3xl border transition-all duration-300",
                                isCurrent
                                    ? `bg-card border-2 shadow-md ${plan.id === 'TEAM' ? 'border-blue-500/60 shadow-blue-500/10' : plan.id === 'CORPORATE' ? 'border-primary/60 shadow-primary/10' : 'border-zinc-500/40 shadow-zinc-500/5'}`
                                    : "bg-muted/10 border-border/40 hover:bg-card hover:border-border/80 hover:shadow-sm"
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

                            {plan.mustPopulate && !isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-linear-to-r from-amber-400 via-yellow-400 to-amber-600 text-amber-950 shadow-lg border border-amber-200/50">
                                    Más popular
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
                                <span className={cn("text-5xl font-black font-display tracking-tighter leading-none", plan.id === "BASIC" ? "text-foreground" : plan.color)}>
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
                                        if (plan.id === "BASIC") {
                                            handleTestChange("BASIC")
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
                                    ) : (
                                        `Cambiar a plan ${plan.name}`
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

            {mpSubscriptionId && (
                <div className="p-8 bg-linear-to-br from-primary/5 via-background to-background border-2 border-primary/10 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <CreditCard className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-display font-black tracking-tight text-foreground uppercase">Gestionar Suscripción</h3>
                            <p className="text-muted-foreground font-medium text-sm max-w-md">
                                Tu plan actual se renueva automáticamente. Para cambiar el método de pago o <span className="text-foreground font-bold italic">cancelar la suscripción</span>, debes hacerlo directamente en el portal de Mercado Pago.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="vlink"
                        size="lg"
                        className="w-full md:w-auto font-black uppercase tracking-widest text-[10px] px-8"
                        asChild
                    >
                        <a href="https://www.mercadopago.com.co/subscriptions" target="_blank" rel="noopener noreferrer">
                            Ir a Mercado Pago <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                    </Button>
                </div>
            )}
        </div>
    )
}
