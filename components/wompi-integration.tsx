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

    const isChanged = subaccountId !== (initialSubaccountId || "")

    return (
        <div className="h-full flex flex-col space-y-6 relative overflow-hidden group/wompi">
            <div className="flex flex-col gap-4 relative z-10 w-full mb-2">
                <div className="flex w-full flex-col">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-2">Pasarela de Pagos</p>
                    <h3 className="text-xl font-black font-display tracking-tight text-foreground/90 uppercase">Cuenta Wompi</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-tight mt-1">
                        Vincula tu Subcuenta de Wompi para poder cobrar automáticamente en el agendamiento.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 relative z-10 w-full">
                <div className="space-y-3 w-full">
                    <Label htmlFor="subaccountId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Subaccount ID</Label>
                    <div className="relative">
                        <Input
                            id="subaccountId"
                            disabled={disabled || isPending}
                            value={subaccountId}
                            onChange={(e) => setSubaccountId(e.target.value)}
                            placeholder="Ej: sub_prod_Mw89wB"
                            className="h-14 rounded-2xl border border-border/50 bg-background/40 hover:bg-background/80 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold pl-12"
                        />
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                    </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                        {disabled
                            ? "Solo el propietario o gestores pueden modificar la cuenta de Wompi."
                            : subaccountId
                                ? "Si este código es válido, tus clientes recibirán un QR y enlace de pago al agendar servicios con precio."
                                : "Actualmente tus servicios de pago se confirmarán de inmediato sin cobrar. Configura el ID para protegerlos."}
                    </p>
                </div>

                <Button
                    className="w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 group/btn relative overflow-hidden"
                    onClick={handleSave}
                    disabled={isPending || disabled || !isChanged}
                >
                    <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/80 to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                {isChanged ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                <span>{isChanged ? "Guardar Cambios" : "Guardado"}</span>
                            </>
                        )}
                    </div>
                </Button>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-dashed border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                        <span className="bg-background px-4">O configura una nueva</span>
                    </div>
                </div>

                <WompiSubaccountForm organizationId={organizationId} onCreated={(id) => setSubaccountId(id)} />
            </div>
        </div>
    )
}
