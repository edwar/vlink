"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getInvitationDetails, acceptInvitation } from "@/app/actions/organization"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function InvitePage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string

    const [status, setStatus] = useState<"loading" | "unauthorized" | "valid" | "error" | "success">("loading")
    const [invitation, setInvitation] = useState<{ organizationName: string, role: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isJoining, setIsJoining] = useState(false)

    useEffect(() => {
        async function checkInvitation() {
            try {
                const details = await getInvitationDetails(token)
                if (!details) {
                    setStatus("error")
                    setError("La invitación no existe o ha expirado.")
                    return
                }
                setInvitation(details)

                const session = await authClient.getSession()
                if (!session?.data) {
                    setStatus("unauthorized")
                } else {
                    setStatus("valid")
                    // Auto-join if already logged in (Minimal Click strategy)
                    handleJoinAutomatically(token)
                }
            } catch (err) {
                setStatus("error")
                setError("Ocurrió un error al verificar la invitación.")
            }
        }
        checkInvitation()

        async function handleJoinAutomatically(invToken: string) {
            setIsJoining(true)
            try {
                const result = await acceptInvitation(invToken)
                if (result.success) {
                    setStatus("success")
                    setTimeout(() => {
                        router.push("/dashboard")
                    }, 1500)
                }
            } catch (err: any) {
                // Show the error (e.g. ownership conflict) prominently in the UI
                setError(err.message || "No se pudo unir a la organización.")
                setStatus("error")
                setIsJoining(false)
            }
        }
    }, [token, router])

    const handleLogin = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: window.location.href // Volver aquí después de login
        })
    }

    const handleJoin = async () => {
        setIsJoining(true)
        try {
            const result = await acceptInvitation(token)
            if (result.success) {
                setStatus("success")
                setTimeout(() => {
                    router.push("/dashboard")
                }, 2000)
            }
        } catch (err: any) {
            setError(err.message || "No se pudo unir a la organización.")
            setStatus("error")
        } finally {
            setIsJoining(false)
        }
    }

    if (status === "loading") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background p-4">
            <Card className="max-w-md w-full border-2 shadow-none animate-in fade-in zoom-in duration-300">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Invitación a VLink</CardTitle>
                    <CardDescription>
                        Has sido invitado a unirte a una organización para gestionar tu agenda.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {status === "error" ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm">
                            <XCircle className="h-5 w-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="p-6 rounded-xl bg-muted/50 border border-border text-center">
                            <p className="text-sm text-muted-foreground mb-1">Organización</p>
                            <h3 className="text-xl font-bold text-foreground">{invitation?.organizationName}</h3>
                            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                                Rol: {invitation?.role === "PROFESSIONAL" ? "Profesional" : "Gestor"}
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    {status === "unauthorized" && (
                        <Button
                            onClick={handleLogin}
                            disabled={isJoining}
                            className="w-full group relative flex items-center justify-center gap-4 bg-white text-black border-2 border-slate-100 hover:border-primary/20 py-5 rounded-2xl font-bold text-lg shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isJoining ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : (
                                <svg className="h-6 w-6" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            )}
                            {isJoining ? "Iniciando sesión..." : "Continuar con Google"}
                        </Button>
                    )}

                    {status === "valid" && (
                        <Button
                            className="w-full h-12 text-lg font-medium"
                            onClick={handleJoin}
                            disabled={isJoining}
                        >
                            {isJoining ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Uniéndote...
                                </>
                            ) : "Aceptar y Unirse"}
                        </Button>
                    )}

                    {status === "success" && (
                        <div className="w-full text-center p-4 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20 font-medium">
                            ¡Te has unido con éxito! Redirigiendo...
                        </div>
                    )}

                    {status === "error" && (
                        <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
                            Volver al inicio
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
