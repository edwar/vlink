"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Calendar as CalendarIcon, Loader2, Save } from "lucide-react"
import { getProfile, updateProfile } from "@/app/actions/profile"
import { cn } from "@/lib/utils"
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from "@/components/ui/input-group"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { LoadingState } from "@/components/loading-state"
import { sileo } from "sileo"

export function ProfileSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [username, setUsername] = useState("")
    const [bio, setBio] = useState("")
    const [email, setEmail] = useState("")
    const [isGoogleConnected, setIsGoogleConnected] = useState(false)
    const [hasCalendarScope, setHasCalendarScope] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile()
                setUsername(data.username)
                setBio(data.bio)
                setEmail(data.email)
                setIsGoogleConnected(data.isGoogleConnected)
                setHasCalendarScope(data.hasCalendarScope)
            } catch (err) {
                console.error("Error fetching profile:", err)
                setError("No se pudo cargar el perfil")
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${username}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl)
        setCopied(true)
        sileo.info({
            title: "Enlace copiado",
            description: "El link a tu perfil público ya está en tu portapapeles."
        })
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        setSuccess(false)
        try {
            await updateProfile({ username, bio })
            sileo.success({
                title: "Perfil actualizado",
                description: "Tus cambios se han guardado correctamente.",
                styles: {
                    title: "text-green-600! font-bold!",
                    badge: "text-green-600!"
                }
            })
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            console.error("Error saving profile:", err)
            sileo.error({
                title: "Error al guardar",
                description: err.message || "No se pudieron guardar los cambios en tu perfil."
            })
            setError(err.message || "Error al guardar los cambios")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <LoadingState fullPage={false} message="Cargando perfil..." />
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Column 1: Profile Info (Left) */}
                <div className="lg:col-span-7 space-y-8">
                    <section className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm h-full flex flex-col justify-between space-y-8">
                        <div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black font-display tracking-tight text-primary">Información del Perfil</h3>
                                <p className="text-sm text-muted-foreground font-medium">Personaliza cómo te ven tus clientes en la plataforma.</p>
                            </div>

                            <div className="grid gap-8 mt-10">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Nombre de usuario (URL)</Label>
                                    <InputGroup className="rounded-2xl overflow-hidden border-2 border-muted/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all bg-background/50">
                                        <InputGroupAddon className="bg-muted/20 border-r px-4">
                                            <InputGroupText className="text-muted-foreground font-bold text-xs">
                                                {process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '')}/
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="font-bold text-lg px-5 h-14"
                                        />
                                    </InputGroup>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Biografía Corta</Label>
                                    <Textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full bg-background/50 border-2 border-muted/50 rounded-2xl p-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg min-h-[220px] font-medium leading-relaxed resize-none"
                                        placeholder="Cuenta un poco sobre lo que haces, tus especialidades o tu experiencia profesional..."
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Column 2: Link and Google (Right) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Section: Public Link */}
                    <section className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold font-display tracking-tight">Tu Enlace Público</h3>
                            <p className="text-xs text-muted-foreground font-medium">Link directo para agendamientos.</p>
                        </div>

                        <div className="flex justify-between gap-3 p-2 bg-muted/20 rounded-2xl border border-muted-foreground/10">
                            <div className="px-4 py-3.5 text-sm font-bold overflow-hidden text-ellipsis whitespace-nowrap bg-background/80 rounded-xl border border-transparent shadow-inner-sm text-primary/80">
                                {profileUrl.replace(/^https?:\/\//, '')}
                            </div>
                            <Button
                                variant="secondary"
                                onClick={copyToClipboard}
                                className="rounded-xl font-black h-12 shadow-sm active:scale-95 transition-all hover:bg-secondary/80"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-500!" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </section>

                    {/* Section: Google Calendar */}
                    <section className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold font-display tracking-tight">Google Calendar</h3>
                                <p className="text-xs text-muted-foreground font-medium">Disponibilidad en tiempo real.</p>
                            </div>
                            {isGoogleConnected && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[9px] font-black uppercase tracking-tighter ring-1 ring-green-500/20">
                                    <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                                    Sync
                                </div>
                            )}
                        </div>

                        {isGoogleConnected && !hasCalendarScope && (
                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <CalendarIcon className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90 leading-tight font-medium">
                                    Reinicia sesión para habilitar la escritura de eventos.
                                </p>
                            </div>
                        )}

                        <div className={cn(
                            "p-5 border-2 rounded-2xl space-y-5 transition-all duration-300",
                            isGoogleConnected
                                ? "bg-muted/30 border-primary/5"
                                : "bg-background border-dashed border-muted-foreground/20"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border-2 shadow-sm transition-all",
                                    isGoogleConnected ? "bg-background border-primary/20 scale-100" : "bg-muted/50 border-transparent scale-95"
                                )}>
                                    <CalendarIcon className={cn("h-6 w-6", isGoogleConnected ? "text-primary" : "text-muted-foreground/30")} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate tracking-tight text-foreground/90">{email || "Sin sincronizar"}</p>
                                    <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest">
                                        {isGoogleConnected ? "Google Activo" : "Google Inactivo"}
                                    </p>
                                </div>
                            </div>

                            {isGoogleConnected ? (
                                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 rounded-xl h-10 transition-colors border border-transparent hover:border-destructive/10">
                                    Desconectar
                                </Button>
                            ) : (
                                <Button className="w-full rounded-xl font-black h-11 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95">
                                    Conectar Ahora
                                </Button>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-muted-foreground/10">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                        "w-full sm:w-auto px-6 h-12 rounded-2xl font-black text-xl shadow-2xl transition-all duration-500 active:scale-95 overflow-hidden",
                        success
                            ? "bg-secondary text-secondary-foreground shadow-primary/30 ring-4 ring-secondary/20 hover:bg-secondary/90"
                            : "bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/40 hover:shadow-md hover:-translate-y-1"
                    )}
                >
                    <div className="flex items-center gap-4">
                        {saving ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : success ? (
                            <Check className="h-6 w-6 animate-in zoom-in duration-300" />
                        ) : (
                            <Save className="h-6 w-6" />
                        )}
                        <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                    </div>
                </Button>
            </div>
        </div>
    )
}
