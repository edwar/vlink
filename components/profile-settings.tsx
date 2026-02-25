"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Calendar as CalendarIcon, Loader2, Save } from "lucide-react"
import { getProfile, updateProfile } from "@/app/actions/profile"
import { cn } from "@/lib/utils"
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from "@/components/ui/input-group"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"

export function ProfileSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [username, setUsername] = useState("")
    const [bio, setBio] = useState("")
    const [email, setEmail] = useState("")
    const [isGoogleConnected, setIsGoogleConnected] = useState(false)

    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile()
                setUsername(data.username)
                setBio(data.bio)
                setEmail(data.email)
                setIsGoogleConnected(data.isGoogleConnected)
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
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        setSuccess(false)
        try {
            await updateProfile({ username, bio })
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            console.error("Error saving profile:", err)
            setError(err.message || "Error al guardar los cambios")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Cargando perfil...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <section className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">Tu Enlace Público</h3>
                    <p className="text-sm text-muted-foreground">Este es el link que compartirás con tus clientes para que agenden.</p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-muted rounded-lg border group">
                    <div className="flex-1 px-3 py-2 text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                        {profileUrl}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="p-2 bg-background border rounded-md hover:bg-accent transition-colors flex items-center gap-2 text-xs font-semibold"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "¡Copiado!" : "Copiar"}
                    </button>
                </div>
            </section>

            <section className="space-y-4 border-t pt-8">
                <div>
                    <h3 className="text-lg font-semibold">Información del Perfil</h3>
                    <p className="text-sm text-muted-foreground">Personaliza cómo te ven tus clientes.</p>
                </div>

                <div className="grid gap-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Nombre de usuario (URL)</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>{process.env.NEXT_PUBLIC_APP_URL}/</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Biografía corta</Label>
                        <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-background border rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary text-sm min-h-[100px]"
                            placeholder="Cuenta un poco sobre lo que haces..."
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-4 border-t pt-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Integración de Google Calendar</h3>
                        <p className="text-sm text-muted-foreground">Sincroniza tus citas automáticamente con Google.</p>
                    </div>
                    {isGoogleConnected ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-semibold">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Conectado
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
                            Desconectado
                        </div>
                    )}
                </div>

                <div className={cn(
                    "p-4 border rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-colors",
                    isGoogleConnected ? "bg-accent/30" : "bg-card"
                )}>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-background border rounded-lg flex items-center justify-center shrink-0">
                            <CalendarIcon className={cn("h-5 w-5", isGoogleConnected ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{email}</p>
                            <p className="text-xs text-muted-foreground">
                                {isGoogleConnected ? "Calendario principal conectado" : "Conecta tu calendario principal"}
                            </p>
                        </div>
                    </div>
                    {isGoogleConnected ? (
                        <button className="text-xs font-semibold text-destructive hover:underline shrink-0">Desconectar</button>
                    ) : (
                        <button className="text-xs font-semibold text-primary hover:underline shrink-0">Conectar Google</button>
                    )}
                </div>
            </section>

            {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm",
                        success
                            ? "bg-green-500 text-white"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : success ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {saving ? "Guardando..." : success ? "Guardado" : "Guardar Cambios"}
                </button>
            </div>
        </div>
    )
}
