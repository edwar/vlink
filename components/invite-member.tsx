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
            const result = await createInvitation(organizationId, role)
            if (result.success && result.invitationUrl) {
                setInvitationUrl(result.invitationUrl)
            }
        } catch (error) {
            console.error(error)
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
        <section className="h-full flex flex-col p-1 rounded-[2.5rem] bg-linear-to-br from-primary/10 via-transparent to-transparent group/invite">
            <div className="flex-1 flex flex-col justify-between bg-card/60 backdrop-blur-xl border border-primary/5 rounded-[2.3rem] p-6 shadow-xl shadow-primary/5 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover/invite:scale-150 transition-transform duration-1000" />

                <div className="flex flex-col justify-center items-center gap-4 relative z-10">
                    <div className="h-32 w-32 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-inner">
                        <UserPlus className="h-22 w-22" />
                    </div>
                    <div className="flex w-full flex-col">
                        <h3 className="text-xl font-black font-display tracking-tight text-foreground/90 uppercase">Invitar a un Miembro</h3>
                        <p className="text-sm text-muted-foreground font-medium leading-tight">Genera un enlace para que alguien se una a tu equipo.</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-8 relative z-10">
                    <div className="flex-1 flex flex-col h-full justify-center gap-6">
                        <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Rol del invitado</Label>
                        <Select value={role} onValueChange={(v: any) => setRole(v)} disabled={disabled}>
                            <SelectTrigger id="role" className="h-14 rounded-2xl border-2 border-primary/5 bg-background/40 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold px-5">
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-2 border-primary/10 bg-card/95 backdrop-blur-xl">
                                <SelectItem value="PROFESSIONAL" className="rounded-xl focus:bg-primary/10 focus:text-primary">Profesional (Tiene su propia agenda)</SelectItem>
                                <SelectItem value="MANAGER" className="rounded-xl focus:bg-primary/10 focus:text-primary">Gestor (Administra agendas de otros)</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
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
                        <div className="p-5 bg-background/60 rounded-[1.8rem] border-2 border-dashed border-primary/20 space-y-4 animate-in zoom-in duration-500">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Enlace de invitación</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={invitationUrl}
                                    className="h-12 bg-background/40 font-mono text-[11px] border-2 border-primary/10 rounded-xl px-4"
                                />
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-12 w-12 shrink-0 border-2 border-primary/10 rounded-xl bg-background/40 hover:bg-primary/10 hover:border-primary/20 transition-all"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-primary" />}
                                </Button>
                            </div>
                            <p className="text-[10px] text-center text-muted-foreground/60 font-medium italic">Este enlace expira en 7 días.</p>
                        </div>
                    )}

                    <Button
                        className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] group/btn overflow-hidden relative"
                        onClick={handleCreateInvitation}
                        disabled={isPending || disabled}
                    >
                        <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/80 to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex items-center justify-center gap-3">
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Generando Acceso...</span>
                                </>
                            ) : (
                                <>
                                    {invitationUrl ? <Sparkles className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                                    <span>{invitationUrl ? "Generar Nuevo Código" : "Crear Enlace de Invitación"}</span>
                                </>
                            )}
                        </div>
                    </Button>
                </div>
            </div>
        </section>
    )
}
