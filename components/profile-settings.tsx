"use client"

import { useState } from "react"
import { Copy, Check, Globe, Calendar as CalendarIcon } from "lucide-react"

export function ProfileSettings() {
    const [username, setUsername] = useState("edwar-dev")
    const [copied, setCopied] = useState(false)

    const profileUrl = `vlink.app/${username}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
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
                        <label className="text-sm font-medium">Nombre de usuario (URL)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">vlink.app/</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-background border rounded-lg py-2 pl-[74px] pr-4 outline-none focus:ring-1 focus:ring-primary text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Biografía corta</label>
                        <textarea
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
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Conectado" />
                </div>

                <div className="p-4 bg-accent/30 border rounded-xl flex items-center gap-4">
                    <div className="h-10 w-10 bg-background border rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">edwar.dev@gmail.com</p>
                        <p className="text-xs text-muted-foreground">Calendario principal conectado</p>
                    </div>
                    <button className="text-xs font-semibold text-destructive hover:underline">Desconectar</button>
                </div>
            </section>

            <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Guardar Cambios
                </button>
            </div>
        </div>
    )
}
