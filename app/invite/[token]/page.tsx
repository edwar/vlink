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
                        <Button className="w-full h-12 text-lg font-medium" onClick={handleLogin}>
                            Iniciar sesión con Google
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
