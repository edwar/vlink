"use client"

import { useState } from "react"
import { updateWompiSubaccount } from "@/app/actions/organization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CreditCard, Info, Check, Save, Landmark } from "lucide-react"
import { sileo } from "sileo"
import { WompiSubaccountForm } from "./wompi-subaccount-form"

interface WompiIntegrationProps {
    organizationId: string
    initialSubaccountId: string | null
    disabled?: boolean
}

export function WompiIntegration({ organizationId, initialSubaccountId, disabled }: WompiIntegrationProps) {
    const [subaccountId, setSubaccountId] = useState(initialSubaccountId || "")
    const [isPending, setIsPending] = useState(false)

    const handleSave = async () => {
        setIsPending(true)
        try {
            const result = await updateWompiSubaccount(organizationId, subaccountId)
            if (result.success) {
                sileo.success({
                    title: "Wompi Configurado",
                    description: "Se ha actualizado la cuenta de cobros exitosamente."
                })
            }
        } catch (error: any) {
            console.error(error)
            sileo.error({
                title: "Error inesperado",
                description: error.message || "No se pudo guardar la configuración."
            })
        } finally {
            setIsPending(false)
        }
    }

    const isConfigured = !!subaccountId

    return (
        <div className="h-full flex flex-col space-y-6 relative overflow-hidden group/wompi">
            <div className="flex flex-col gap-4 relative z-10 w-full mb-2">
                <div className="flex w-full flex-col">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-2">Pasarela de Pagos</p>
                    <h3 className="text-xl font-black font-display tracking-tight text-foreground/90 uppercase">Cuenta Wompi</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-tight mt-1">
                        {isConfigured 
                            ? "Tu organización está lista para recibir pagos directamente en tu cuenta digital Wompi."
                            : "Vincula tu Subcuenta de Wompi para poder cobrar automáticamente en el agendamiento."}
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 relative z-10 w-full">
                {isConfigured ? (
                    <div className="space-y-6">
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-4xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <Check className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600/70">Wompi Conectado</p>
                                    <p className="text-sm font-black text-foreground font-mono">{subaccountId}</p>
                                </div>
                            </div>
                            
                            {!disabled && (
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSubaccountId("")}
                                    className="text-muted-foreground hover:text-red-500 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Desvincular
                                </Button>
                            )}
                        </div>

                        <div className="text-[11px] text-muted-foreground bg-muted/30 p-4 rounded-2xl border border-border/40 text-center font-medium">
                            Los pagos de tus servicios con costo caerán directamente en esta cuenta digital con la disposición inmediata de fondos.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <WompiSubaccountForm 
                            organizationId={organizationId} 
                            onCreated={(id) => {
                                setSubaccountId(id)
                                sileo.success({
                                    title: "Subcuenta configurada",
                                    description: "La subcuenta ha sido creada y vinculada automáticamente."
                                })
                            }} 
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
