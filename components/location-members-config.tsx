"use client"

import { useState } from "react"
import { setMemberServicesForLocation } from "@/app/actions/locations"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Check, Wrench } from "lucide-react"
import { sileo } from "sileo"
import { EmptyState } from "./empty-state"
import { cn } from "@/lib/utils"

interface LocationMembersConfigProps {
    memberId: string
    memberName: string
    locationId: string
    locationName: string
    allServices: { id: string, name: string }[]
    currentServiceIds: string[]
}

export function LocationMembersConfig({
    memberId,
    memberName,
    locationId,
    locationName,
    allServices,
    currentServiceIds
}: LocationMembersConfigProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>(currentServiceIds)
    const [loading, setLoading] = useState(false)

    const toggleService = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    async function handleSave() {
        setLoading(true)
        try {
            await setMemberServicesForLocation(memberId, locationId, selectedIds)
            sileo.success({ title: "Configuración guardada", description: "Los servicios del profesional se actualizaron para esta sede" })
        } catch (error: any) {
            sileo.error({ title: "Error al actualizar", description: error.message || "No se pudieron actualizar los servicios" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h4 className="text-sm font-black text-foreground">Servicios de {memberName}</h4>
                <p className="text-xs text-muted-foreground font-medium">
                    Selecciona qué servicios ofrece este profesional en <strong>{locationName}</strong>.
                </p>
            </div>

            <div className={cn("gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar", allServices.length === 0 ? "w-full" : "grid grid-cols-1 sm:grid-cols-2")}>
                {allServices.length === 0 ? (
                    <EmptyState
                        title="Servicios"
                        description="No hay servicios configurados para este profesional"
                        icon={Wrench}
                        actionText="Agregar servicio"
                        actionHref="/dashboard/configuracion"
                        className="w-full"
                    />
                ) : (
                    allServices.map(service => (
                        <div
                            key={service.id}
                            className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedIds.includes(service.id)
                                ? "bg-primary/5 border-primary/30"
                                : "bg-muted/10 border-border/40 hover:border-border/80"
                                }`}
                            onClick={() => toggleService(service.id)}
                        >
                            <Checkbox
                                id={service.id}
                                checked={selectedIds.includes(service.id)}
                                onCheckedChange={() => toggleService(service.id)}
                            />
                            <Label
                                htmlFor={service.id}
                                className="text-xs font-bold leading-none cursor-pointer flex-1"
                            >
                                {service.name}
                            </Label>
                        </div>
                    ))
                )}
            </div>
            {allServices.length > 0 && (
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full h-11 rounded-xl font-black uppercase tracking-widest"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                    Guardar Configuración
                </Button>
            )}
        </div>
    )
}
