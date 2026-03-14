"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Calendar as CalendarIcon, Loader2, Save, AlertCircle, Clock } from "lucide-react"
import { getProfile, updateProfile, disconnectGoogle, enableCalendarSync } from "@/app/actions/profile"
import { cn } from "@/lib/utils"
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from "@/components/ui/input-group"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { LoadingState } from "@/components/loading-state"
import { sileo } from "sileo"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog"
import { authClient } from "@/lib/auth-client"

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
    const [isSyncEnabled, setIsSyncEnabled] = useState(false)
    const [isDisconnecting, setIsDisconnecting] = useState(false)
    const [enablingSync, setEnablingSync] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
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
                setIsSyncEnabled(data.isSyncEnabled)
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

    const handleDisconnectGoogle = () => {
        setConfirmOpen(true)
    }

    const handleEnableSync = async () => {
        setEnablingSync(true)
        try {
            await enableCalendarSync()
            setIsSyncEnabled(true)
            sileo.success({
                title: "Sincronización activada",
                description: "VLink reaccionará automáticamente a cambios en tu calendario."
            })
        } catch (err: any) {
            console.error(err)
            sileo.error({
                title: "Error al activar",
                description: err.message || "Hubo un problema de conexión con Google."
            })
        } finally {
            setEnablingSync(false)
        }
    }

    const confirmDisconnect = async () => {
        setConfirmOpen(false)
        setIsDisconnecting(true)
        try {
            await disconnectGoogle()
            setIsGoogleConnected(false)
            setHasCalendarScope(false)
            sileo.info({
                title: "Cuenta desconectada",
                description: "Se ha revocado el acceso a tu Google Calendar correctamente."
            })
        } catch (err: any) {
            console.error("Error disconnecting:", err)
            sileo.error({
                title: "Error al desconectar",
                description: "No se pudo revocar el acceso en este momento."
            })
        } finally {
            setIsDisconnecting(false)
        }
    }

    const handleConnectGoogle = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: window.location.href
        })
    }

    if (loading) {
        return <LoadingState fullPage={false} message="Cargando perfil..." />
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Column 1: Profile Info (Left) */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-10">
                    <section className="bg-linear-to-br from-primary/5 to-transparent border border-border/40 rounded-[2.5rem] p-8 sm:p-10 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none" />
                        <div className="relative z-10 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1 bg-primary rounded-full" />
                                <h3 className="text-3xl font-black font-display tracking-tight text-primary uppercase">Datos Maestros</h3>
                            </div>
                            <p className="text-muted-foreground font-medium text-lg max-w-xl">
                                Configura tu nombre público, biografía y personaliza tu identificador único en la plataforma.
                            </p>
                        </div>

                        <div className="grid gap-4 mt-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                                    Identidad VLink (Username)
                                </Label>
                                <div className="group transition-all">
                                    <InputGroup id="tour-username" className="relative h-14 rounded-2xl overflow-hidden border-2 border-primary/5 bg-background/40 focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-inner">
                                        <div id="tour-username-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                                        <InputGroupAddon className="bg-primary/5 border-r border-primary/10 px-6 h-14 flex items-center justify-center">
                                            <InputGroupText className="text-primary font-black text-[13px] tracking-tighter">
                                                {process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '')}/
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(
                                                e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                                            )}
                                            className="font-black text-xl px-6 h-14 bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/30"
                                            placeholder="tu-nombre"
                                        />
                                    </InputGroup>
                                    <p className="text-[10px] text-muted-foreground/50 font-medium mt-2 ml-2">
                                        Solo letras minúsculas, números, guiones <code className="font-mono">-</code> y guiones bajos <code className="font-mono">_</code>. Mínimo 3 caracteres.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                                    Biografía Profesional
                                </Label>
                                <div id="tour-bio" className="relative group transition-all">
                                    <div id="tour-bio-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                                    <Textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full bg-background/40 backdrop-blur-sm border-2 border-primary/5 rounded-4xl p-8 outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg min-h-[300px] font-medium leading-relaxed resize-none shadow-inner"
                                        placeholder="Describe tu experiencia, especialidades y el valor que ofreces a tus clientes..."
                                    />
                                    <div className="absolute bottom-6 right-8 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                        {bio.length} Caracteres
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <div className="relative w-fit group/save">
                                    <div id="tour-save-anchor" className="absolute -inset-2 pointer-events-none rounded-3xl" />
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className={cn(
                                            "w-fit h-14 px-6 rounded-2xl font-black text-xl shadow-2xl transition-all duration-500 overflow-hidden group/btn",
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
                                            {saving ? "Procesando..." : success ? "Éxito total" : "Guardar perfil"}
                                        </span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
                </div>

                {/* Column 2: Link and Google (Right) */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6 xl:space-y-16">
                    {/* Section: Public Link */}
                    <section id="tour-profile-url" className="relative bg-linear-to-b from-primary/5 to-transparent border border-border/40 rounded-[2.5rem] p-8 space-y-8 h-full">
                        <div id="tour-profile-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                        <div className="space-y-2">
                            <h3 className="text-xl font-black font-display tracking-tight text-foreground/90 uppercase">Enlace de Agenda</h3>
                            <p className="text-sm text-muted-foreground font-medium">Comparte este link para recibir reservas.</p>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-3xl border border-muted-foreground/10 shadow-inner group-hover:border-primary/20 transition-all">
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
                    </section>

                    {/* Section: Google Calendar */}
                    <section id="tour-google-sync" className="relative bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 rounded-[2.5rem] p-8 space-y-8">
                        <div id="tour-google-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
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

                        <div className="pt-2 space-y-6 transition-all duration-500">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500",
                                    isGoogleConnected
                                        ? "border-border/50 text-foreground shadow-sm"
                                        : "bg-muted/50 border-transparent opacity-50"
                                )}>
                                    <CalendarIcon className={cn("h-6 w-6", isGoogleConnected ? "text-foreground" : "text-muted-foreground/30")} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-black truncate tracking-tight text-foreground">{email || "Sin Cuenta"}</p>
                                    <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                                        {isGoogleConnected ? "Google Activo" : "Google Inactivo"}
                                    </p>
                                </div>
                            </div>

                            {isGoogleConnected ? (
                                <div className="space-y-6 bg-muted/30 border border-border/50 rounded-2xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                                            {isSyncEnabled ? <Check className="h-5 w-5 text-primary" /> : <Clock className="h-5 w-5 text-amber-500" />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black tracking-tight text-foreground">Sincronización Total</p>
                                            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed pr-2">
                                                Tu disponibilidad pública se ajustará automáticamente según los eventos en tu calendario Google.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {!isSyncEnabled && hasCalendarScope && (
                                            <Button
                                                size="sm"
                                                onClick={handleEnableSync}
                                                disabled={enablingSync}
                                                className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 h-10 shadow-sm"
                                            >
                                                {enablingSync ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Empezar Sincronización"}
                                            </Button>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDisconnectGoogle}
                                            disabled={isDisconnecting}
                                            className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 h-10 transition-colors"
                                        >
                                            {isDisconnecting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : "Revocar Acceso de Google"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleConnectGoogle}
                                    className="w-full rounded-2xl font-black h-12 shadow-sm transition-all hover:scale-105 text-lg mt-4"
                                >
                                    Conectar Calendario
                                </Button>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md p-6 sm:p-8 bg-card border border-border/40 rounded-3xl shadow-lg space-y-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20">
                            <AlertCircle className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-3xl font-black font-display tracking-tight text-foreground uppercase">
                                ¿Revocar Acceso?
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium text-lg leading-relaxed mt-2">
                                Esta acción detendrá inmediatamente la sincronización con <span className="text-foreground font-bold">Google Calendar</span>. Tus citas no se verán reflejadas y podrías tener cruces de horario.
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                            className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs border border-border/50 hover:bg-muted transition-all"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDisconnect}
                            className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all"
                        >
                            Sí, desconectar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
