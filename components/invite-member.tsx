"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createInvitation } from "@/app/actions/organization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, Copy, Check, Info } from "lucide-react"

interface InviteMemberProps {
    organizationId: string
}

export function InviteMember({ organizationId }: InviteMemberProps) {
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
        <Card className="border-2 border-primary/10 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Invitar a un Miembro</CardTitle>
                        <CardDescription>Genera un enlace para que alguien se una a tu equipo.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol del invitado</Label>
                        <Select value={role} onValueChange={(v: any) => setRole(v)}>
                            <SelectTrigger id="role" className="h-12 border-2 focus:border-primary">
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PROFESSIONAL">Profesional (Tiene su propia agenda)</SelectItem>
                                <SelectItem value="MANAGER">Gestor (Administra agendas de otros)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5 px-1">
                            <Info className="h-3 w-3" />
                            {role === "PROFESSIONAL"
                                ? "El profesional podrá sincronizar su Google Calendar tras unirse."
                                : "El gestor podrá ver y coordinar todas las agendas de la organización."}
                        </p>
                    </div>
                </div>

                {invitationUrl && (
                    <div className="space-y-3 p-4 bg-muted/50 rounded-xl border-2 border-dashed animate-in zoom-in duration-300">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Enlace de invitación</Label>
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={invitationUrl}
                                className="h-12 bg-background font-mono text-xs border-2"
                            />
                            <Button size="icon" variant="outline" className="h-12 w-12 shrink-0 border-2" onClick={copyToClipboard}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground">Este enlace expira en 7 días.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-muted/30 border-t pt-4">
                <Button
                    className="w-full h-12 font-bold text-lg"
                    onClick={handleCreateInvitation}
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        invitationUrl ? "Generar otro enlace" : "Crear enlace de invitación"
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
