"use client"

import { useState } from "react"
import { updateWompiSubaccount } from "@/app/actions/organization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CreditCard, Info, Check, Save, Landmark, AlertTriangle } from "lucide-react"
import { sileo } from "sileo"
import { WompiSubaccountForm } from "./wompi-subaccount-form"

interface WompiIntegrationProps {
    organizationId: string
    initialSubaccountId: string | null
    disabled?: boolean
    isMarketplaceEnabled?: boolean
}

export function WompiIntegration({ organizationId, initialSubaccountId, disabled, isMarketplaceEnabled }: WompiIntegrationProps) {
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
        <div className="h-full flex flex-col space-y-6 relative group/wompi">
            <div className="flex flex-col gap-4 relative z-10 w-full mb-2">
                <div className="flex w-full flex-col">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-2">Pasarela de Pagos</p>
                    <h3 className="text-xl font-black font-display tracking-tight text-foreground/90 uppercase">Cuenta Wompi</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-tight mt-1">
                        {isConfigured
                            ? "Tu organización está lista para recibir pagos directamente en tu cuenta digital Wompi."
                            : "Crea tu cuenta de cobros en Wompi para recibir los pagos de tus reservas de forma automática."}
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 relative z-10 w-full">
                {/* Cost breakdown cards */}
                <div className="grid grid-cols-2 gap-3 mb-1">
                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex flex-col gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/70">Recibir Pago</p>
                        <p className="text-[13px] text-foreground/90 font-black leading-tight">2.65% + $700</p>
                        <p className="text-[9px] font-medium text-muted-foreground leading-tight">+ IVA · por transacción aprobada</p>
                    </div>
                    <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl flex flex-col gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-violet-600/70">Dispersión</p>
                        <p className="text-[13px] text-foreground/90 font-black leading-tight">$1.849 + 0.4%</p>
                        <p className="text-[9px] font-medium text-muted-foreground leading-tight">+ IVA · por transferencia a subcuenta</p>
                    </div>
                </div>


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
                            disabled={disabled || !isMarketplaceEnabled}
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
            
            <div className="mt-auto pt-6 border-t border-border/50">
                <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] text-center flex items-center justify-center gap-1.5">
                    <span className="w-4 h-px bg-foreground/20" />
                    Powered by Wompi
                    <span className="w-4 h-px bg-foreground/20" />
                </p>
            </div>
        </div>
    )
}
