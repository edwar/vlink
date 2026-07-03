"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createInvitation } from "@/app/actions/organization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, Copy, Check, Info, Sparkles } from "lucide-react"
import { sileo } from "sileo"

interface InviteMemberProps {
    organizationId: string
    disabled?: boolean
}

export function InviteMember({ organizationId, disabled }: InviteMemberProps) {
    const [role, setRole] = useState<"MANAGER" | "PROFESSIONAL">("PROFESSIONAL")
    const [isPending, setIsPending] = useState(false)
    const [invitationUrl, setInvitationUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleCreateInvitation = async () => {
        setIsPending(true)
        try {
            const result = await createInvitation(organizationId, role) as any
            if (result.success && result.invitationUrl) {
                setInvitationUrl(result.invitationUrl)
                sileo.success({
                    title: "Acceso generado",
                    description: "Se ha creado un enlace de invitación correctamente."
                })
            } else if (result.error) {
                sileo.warning({
                    title: "Límite alcanzado",
                    description: result.error
                })
            }
        } catch (error: any) {
            console.error(error)
            sileo.error({
                title: "Error inesperado",
                description: "No se pudo realizar la invitación en este momento."
            })
        } finally {
            setIsPending(false)
        }
    }

    const copyToClipboard = () => {
        if (invitationUrl) {
            navigator.clipboard.writeText(invitationUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="h-full flex flex-col justify-between space-y-6 relative group/invite">
            <div className="flex flex-col justify-center items-center gap-4 relative z-10 w-full">
                <div className="h-28 w-28 bg-primary/10 rounded-4xl flex items-center justify-center text-primary shrink-0 transition-transform duration-500 group-hover/invite:scale-105">
                    <UserPlus className="h-12 w-12" />
                </div>
                <div className="flex w-full flex-col items-centertext-center">
                    <h3 className="text-xl font-black font-display tracking-tight text-foreground/90 uppercase">Invitar a un Miembro</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-tight">Genera un enlace para que alguien se una a tu equipo.</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6 relative z-10 w-full mt-4">
                <div className="flex-1 flex flex-col justify-center gap-4">
                    <div className="space-y-2 w-full">
                        <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Rol del invitado</Label>
                        <Select value={role} onValueChange={(v: any) => setRole(v)} disabled={disabled}>
                            <SelectTrigger id="role" className="h-14 rounded-2xl border bg-background/40 hover:bg-background/80 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold px-5">
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="rounded-2xl border shadow-xl overflow-hidden">
                                <SelectItem value="PROFESSIONAL" className="rounded-lg px-4 focus:bg-primary/5 focus:text-primary">
                                    <div className="flex flex-col items-baseline gap-0.5">
                                        <span className="font-bold">Profesional</span>
                                        <span className="text-[10px] text-muted-foreground font-medium normal-case tracking-normal">Tiene su propia agenda</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="MANAGER" className="rounded-lg px-4 focus:bg-primary/5 focus:text-primary">
                                    <div className="flex flex-col items-baseline gap-0.5">
                                        <span className="font-bold">Gestor</span>
                                        <span className="text-[10px] text-muted-foreground font-medium normal-case tracking-normal">Administra agendas de otros</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-2xl border">
                        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                            {disabled
                                ? "Solo el propietario puede generar nuevos enlaces de invitación."
                                : role === "PROFESSIONAL"
                                    ? "El profesional podrá sincronizar su Google Calendar tras unirse."
                                    : "El gestor podrá ver y coordinar todas las agendas de la organización."}
                        </p>
                    </div>
                </div>

                {invitationUrl && (
                    <div className="space-y-4 animate-in zoom-in duration-500">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Enlace de invitación</Label>
                        <div className="flex">
                            <Input
                                readOnly
                                value={invitationUrl}
                                className="rounded-r-none border-dashed font-medium truncate"
                            />
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-14 w-14 shrink-0 border border-border/50 rounded-r-2xl rounded-l-none bg-background/40 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all"
                                onClick={copyToClipboard}
                            >
                                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                            </Button>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground/60 font-medium italic">Este enlace expira en 7 días.</p>
                    </div>
                )}

                <Button
                    size="default"
                    className="w-fit ml-auto rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] group/btn overflow-hidden relative"
                    onClick={handleCreateInvitation}
                    disabled={isPending || disabled}
                >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Generando Acceso...</span>
                            </>
                        ) : (
                            <>
                                {invitationUrl ? <Sparkles className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                <span>{invitationUrl ? "Generar Nuevo Código" : "Crear Enlace"}</span>
                            </>
                        )}
                    </div>
                </Button>
            </div>
        </div>
    )
}
