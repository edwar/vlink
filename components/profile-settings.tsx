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
    const [displayName, setDisplayName] = useState("")
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
                setDisplayName(data.displayName)
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
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Column 1: Profile Info (Left) */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-10">
                    <section className="relative p-1 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                        <div className="relative z-10 bg-card/60 backdrop-blur-xl border border-primary/5 rounded-[2.3rem] p-8 sm:p-10 shadow-xl shadow-primary/5 space-y-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-1 bg-primary rounded-full" />
                                    <h3 className="text-3xl font-black font-display tracking-tight text-primary uppercase">Datos Maestros</h3>
                                </div>
                                <p className="text-muted-foreground font-medium text-lg max-w-xl">
                                    Configura tu nombre público, biografía y personaliza tu identificador único en la plataforma.
                                </p>
                            </div>

                            <div className="grid gap-10 mt-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                                        Identidad VLink (Username)
                                    </Label>
                                    <div className="group transition-all">
                                        <InputGroup className="h-14 rounded-2xl overflow-hidden border-2 border-primary/5 bg-background/40 focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-inner">
                                            <InputGroupAddon className="bg-primary/5 border-r border-primary/10 px-6 h-14 flex items-center justify-center">
                                                <InputGroupText className="text-primary font-black text-[13px] tracking-tighter">
                                                    {process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '')}/
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="font-black text-xl px-6 h-14 bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/30"
                                                placeholder="tu-nombre"
                                            />
                                        </InputGroup>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                                        Biografía Profesional
                                    </Label>
                                    <div className="relative group transition-all">
                                        <Textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="w-full bg-background/40 backdrop-blur-sm border-2 border-primary/5 rounded-[2rem] p-8 outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg min-h-[300px] font-medium leading-relaxed resize-none shadow-inner"
                                            placeholder="Describe tu experiencia, especialidades y el valor que ofreces a tus clientes..."
                                        />
                                        <div className="absolute bottom-6 right-8 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                            {bio.length} Caracteres
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Column 2: Link and Google (Right) */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-10">
                    {/* Section: Public Link */}
                    <section className="group p-1 rounded-[2.5rem] bg-linear-to-b from-primary/5 to-transparent">
                        <div className="bg-card/60 backdrop-blur-xl border border-primary/5 rounded-[2.3rem] p-8 shadow-xl shadow-primary/5 space-y-8 h-full">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black font-display tracking-tight text-foreground/90 uppercase">Enlace de Agenda</h3>
                                <p className="text-sm text-muted-foreground font-medium">Comparte este link para recibir reservas.</p>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-[1.5rem] border border-muted-foreground/10 shadow-inner group-hover:border-primary/20 transition-all">
                                <div className="flex-1 px-5 py-3.5 text-sm font-black overflow-hidden text-ellipsis whitespace-nowrap bg-background/80 rounded-xl border border-primary/5 shadow-inner-sm text-primary group-hover:bg-background transition-colors">
                                    {profileUrl.replace(/^https?:\/\//, '')}
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={copyToClipboard}
                                    className="rounded-xl font-black h-12 w-12 p-0 shadow-lg active:scale-75 transition-all hover:bg-primary hover:text-white hover:shadow-primary/20"
                                >
                                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Section: Google Calendar */}
                    <section className="p-1 rounded-[2.5rem] bg-linear-to-br from-primary/10 via-transparent to-transparent">
                        <div className="bg-card/60 backdrop-blur-xl border border-primary/5 rounded-[2.3rem] p-8 shadow-xl shadow-primary/5 space-y-8">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black font-display tracking-tight text-foreground/90 uppercase">Sincronización</h3>
                                    <p className="text-sm text-muted-foreground font-medium">Conexión con Google Calendar.</p>
                                </div>
                                {isGoogleConnected && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-green-500/20 shadow-sm shadow-green-500/10">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Online
                                    </div>
                                )}
                            </div>

                            {isGoogleConnected && !hasCalendarScope && (
                                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4 animate-in zoom-in duration-500">
                                    <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                                        <CalendarIcon className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90 leading-relaxed font-bold">
                                        Faltan permisos de escritura. Por seguridad, te sugerimos cerrar sesión y volver a entrar.
                                    </p>
                                </div>
                            )}

                            <div className={cn(
                                "p-6 border-2 rounded-[2rem] space-y-6 transition-all duration-500 relative overflow-hidden",
                                isGoogleConnected
                                    ? "bg-primary/5 border-primary/10 shadow-inner"
                                    : "bg-background/20 border-dashed border-muted-foreground/20"
                            )}>
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-xl transition-all duration-500",
                                        isGoogleConnected
                                            ? "bg-background border-primary shadow-primary/10 scale-100"
                                            : "bg-muted/50 border-transparent scale-90 opacity-50"
                                    )}>
                                        <CalendarIcon className={cn("h-7 w-7", isGoogleConnected ? "text-primary" : "text-muted-foreground/30")} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-black truncate tracking-tight text-foreground">{email || "Sin Cuenta"}</p>
                                        <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                                            {isGoogleConnected ? "Google Activo" : "Google Inactivo"}
                                        </p>
                                    </div>
                                </div>

                                {isGoogleConnected ? (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 relative group overflow-hidden">
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="p-2.5 bg-green-500/20 rounded-xl shrink-0 ring-1 ring-green-500/20">
                                                <Check className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black tracking-tight text-green-600">Sincronización Total</p>
                                                <p className="text-[11px] font-medium text-green-700/70 leading-relaxed pr-2">
                                                    Tu disponibilidad pública se ajustará automáticamente según los eventos en tu calendario Google.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Button className="w-full rounded-2xl font-black h-12 shadow-xl shadow-primary/10 transition-all hover:scale-105 active:scale-95 text-lg">
                                        Conectar Calendario
                                    </Button>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div className="sticky bottom-8 z-50 px-2 lg:px-0 flex justify-end">
                <div className="p-2 rounded-[2rem] bg-background/40 backdrop-blur-xl border-2 border-primary/10 shadow-2xl w-fit">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                            "w-full sm:w-auto h-16 px-12 rounded-[1.5rem] font-black text-xl shadow-2xl transition-all duration-500 overflow-hidden group/btn",
                            success
                                ? "bg-secondary text-secondary-foreground shadow-primary/30 ring-8 ring-secondary/20"
                                : "bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            {saving ? (
                                <Loader2 className="h-7 w-7 animate-spin" />
                            ) : success ? (
                                <Check className="h-7 w-7 animate-in zoom-in duration-500" />
                            ) : (
                                <Save className="h-7 w-7 group-hover/btn:rotate-12 transition-transform" />
                            )}
                            <span className="uppercase tracking-widest text-sm">
                                {saving ? "Procesando..." : success ? "Éxito total" : "Guardar cambios de mi perfil"}
                            </span>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    )
}
