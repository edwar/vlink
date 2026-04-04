"use client"

import { useState } from "react"
import { updateOrganizationContact } from "@/app/actions/organization"
import { sileo } from "sileo"
import { Phone, MessageSquare, Save, Loader2, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface OrganizationContactProps {
    organizationId: string
    initialPhone: string | null
    initialWhatsapp: string | null
    disabled?: boolean
}

export function OrganizationContact({
    organizationId,
    initialPhone,
    initialWhatsapp,
    disabled
}: OrganizationContactProps) {
    const formatPhoneNumber = (value: string) => {
        if (!value) return ""
        // Remove all non-digits
        const digits = value.replace(/\D/g, "")

        // Limit to 10 digits
        const limited = digits.slice(0, 10)

        // Apply mask: XXX XXX XXXX
        if (limited.length <= 3) return limited
        if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`
        return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`
    }

    const [phone, setPhone] = useState(formatPhoneNumber(initialPhone || ""))
    const [whatsapp, setWhatsapp] = useState(formatPhoneNumber(initialWhatsapp || ""))
    const [saving, setSaving] = useState(false)

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhoneNumber(e.target.value))
    }

    const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWhatsapp(formatPhoneNumber(e.target.value))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateOrganizationContact(organizationId, {
                phone: phone || null,
                whatsapp: whatsapp || null
            })
            sileo.success({
                title: "Datos de contacto guardados",
                description: "La información de contacto ha sido actualizada correctamente."
            })
        } catch (err) {
            sileo.error({
                title: "Error",
                description: err instanceof Error ? err.message : "No se pudo actualizar la información."
            })
        } finally {
            setSaving(false)
        }
    }

    const hasChanges = phone !== (initialPhone || "") || whatsapp !== (initialWhatsapp || "")

    return (
        <div className="h-full flex flex-col space-y-6 relative group/contact">
            <div className="flex flex-col gap-4 relative z-10 w-full mb-2">
                <div className="flex w-full flex-col">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2">Canales de Atención</p>
                    <h3 className="text-xl font-black font-display tracking-tight text-foreground/90 uppercase text-nowrap">Contacto Clientes</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-tight mt-1">
                        Información pública para que tus clientes soliciten cambios de horario.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-5 relative z-10 w-full">
                <div className="space-y-2">
                    <Label htmlFor="org-phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Línea Telefónica</Label>
                    <div className="relative group/input">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                        <Input
                            id="org-phone"
                            value={phone}
                            onChange={handlePhoneChange}
                            disabled={disabled || saving}
                            className="pl-11 h-12 bg-background/50 rounded-2xl transition-all font-medium"
                            placeholder="321 000 0000"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="org-whatsapp" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp</Label>
                    <div className="relative group/input">
                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                        <Input
                            id="org-whatsapp"
                            value={whatsapp}
                            onChange={handleWhatsappChange}
                            disabled={disabled || saving}
                            className="pl-11 h-12 bg-background/50 rounded-2xl transition-all font-medium"
                            placeholder="321 000 0000"
                        />
                    </div>
                </div>
            </div>

            {!disabled && (
                <div className="pt-2 relative z-10">
                    <Button
                        size="default"
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className="w-full rounded-lg font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? "Guardando..." : hasChanges ? "Guardar Cambios" : "Guardado"}
                    </Button>
                </div>
            )}
        </div>
    )
}
