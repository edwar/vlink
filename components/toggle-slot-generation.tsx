"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sileo } from "sileo"
import { updateSlotGenerationMethod } from "@/app/actions/organization"
import { Loader2, CalendarRange } from "lucide-react"

interface ToggleSlotGenerationProps {
    organizationId: string
    currentMethod: "SERVICE_DURATION" | "FIXED_30_MIN"
}

export function ToggleSlotGeneration({ organizationId, currentMethod }: ToggleSlotGenerationProps) {
    const [method, setMethod] = useState(currentMethod)
    const [isUpdating, setIsUpdating] = useState(false)
    const router = useRouter()

    const OPTIONS = [
        {
            value: "SERVICE_DURATION",
            label: "Duración del Servicio (Default)",
            description: "Slots cada 60min para servicios de 60min"
        },
        {
            value: "FIXED_30_MIN",
            label: "Intervalos de 30 minutos",
            description: "Muestra opciones cada 30min (ej. 09:00, 09:30, 10:00)"
        }
    ]

    const handleUpdate = async (newMethod: "SERVICE_DURATION" | "FIXED_30_MIN") => {
        setIsUpdating(true)
        try {
            const result = await updateSlotGenerationMethod(organizationId, newMethod)
            if (result.success) {
                setMethod(newMethod)
                sileo.success({
                    title: "Configuración actualizada",
                    description: "Los intervalos de cita han sido modificados correctamente."
                })
                router.refresh()
            }
        } catch (error: any) {
            sileo.error({
                title: "Error",
                description: error.message || "No se pudo actualizar la configuración."
            })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <Card className="bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 overflow-hidden group h-full">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                        <CalendarRange className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Generación de Horarios</CardTitle>
                        <CardDescription>
                            Define cómo se crean los bloques de tiempo disponibles para tus clientes.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="space-y-4">
                        <Select
                            value={method}
                            onValueChange={(val) => handleUpdate(val as any)}
                            disabled={isUpdating}
                        >
                            <SelectTrigger className="w-full md:w-[400px] h-11 bg-muted/50 border-border/50 hover:bg-muted transition-colors">
                                <SelectValue placeholder="Selecciona un método" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start" className="w-(--radix-select-trigger-width) rounded-sm border shadow-xl">
                                {OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="py-2.5 ring-0 ring-offset-0 cursor-pointer rounded-[6px] focus:bg-accent/50">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{option.label}</span>
                                            <span className="text-xs text-muted-foreground">{option.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="p-3 rounded-lg bg-secondary/50 border border-secondary text-sm text-secondary-foreground/80 flex items-start gap-2">
                            <div className="mt-0.5">💡</div>
                            <p>
                                {method === "SERVICE_DURATION"
                                    ? "Los clientes verán espacios disponibles según el tiempo exacto que dura cada servicio seleccionado."
                                    : "Los clientes podrán elegir citas cada 30 minutos, independientemente de la duración del servicio (siempre que el profesional esté libre)."}
                            </p>
                        </div>
                    </div>

                    {isUpdating && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Actualizando configuración...
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
