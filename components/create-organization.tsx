"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createOrganization } from "@/app/actions/organization"
import { getPublicPlanConfigs } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Building2, Rocket, ArrowRight, ArrowLeft } from "lucide-react"
import { PlanSelection } from "./plan-selection"
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

export function CreateOrganization() {
    const [step, setStep] = useState<1 | 2>(1)
    const [name, setName] = useState("")
    const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "TEAM" | "CORPORATE">("BASIC")
    const [plans, setPlans] = useState<Plan[]>([])
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        getPublicPlanConfigs().then((data) => {
            setPlans(data as Plan[])
        })
    }, [])

    const handleNext = () => {
        if (!name.trim()) return
        setError(null)
        setStep(2)
    }

    const handleSubmit = async () => {
        if (!name.trim()) return

        setIsPending(true)
        setError(null)
        try {
            const result = await createOrganization(name.trim(), selectedPlan)
            if (result.success) {
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || "No se pudo crear la organización.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Card className="max-w-lg mx-auto border border-border/40 shadow-none rounded-3xl animate-in fade-in zoom-in duration-500 overflow-hidden">
            <CardHeader className="text-center space-y-1">
                <div className="mx-auto bg-primary/10 p-4 rounded-3xl w-fit mb-4">
                    <Building2 className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl font-display font-black tracking-tight">
                    {step === 1 ? "Crea tu Organización" : "Elige tu Plan"}
                </CardTitle>
                <CardDescription className="text-base font-medium">
                    {step === 1
                        ? "Centraliza la gestión de agendas para tu equipo o empresa."
                        : "Selecciona el plan ideal. Tu primer mes es gratis."
                    }
                </CardDescription>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 pt-4">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? "w-8 bg-primary" : "w-4 bg-muted"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? "w-8 bg-primary" : "w-4 bg-muted"}`} />
                </div>
            </CardHeader>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="org-name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                    Nombre de la empresa/asociación
                                </Label>
                                <Input
                                    id="org-name"
                                    placeholder="Ej: Clínica Dental VLink"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleNext() } }}
                                    disabled={isPending}
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 animate-in slide-in-from-top-2">
                                    {error}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="pt-4 pb-8">
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="w-full h-14 text-lg font-black rounded-xl transition-all"
                                disabled={!name.trim()}
                            >
                                Siguiente
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </CardFooter>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CardContent className="space-y-4 pt-4">
                            <PlanSelection
                                plans={plans}
                                selectedPlan={selectedPlan}
                                onSelect={setSelectedPlan}
                            />
                            {error && (
                                <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 animate-in slide-in-from-top-2">
                                    {error}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="pt-4 pb-8 flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="h-14 px-6 rounded-xl font-bold"
                                disabled={isPending}
                            >
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Atrás
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                className="flex-1 h-14 text-lg font-black rounded-xl transition-all"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Rocket className="mr-2 h-5 w-5" />
                                        Empezar Gratis
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}
