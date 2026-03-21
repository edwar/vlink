"use client"

import { Logo } from "@/components/logo"
import { signIn, useSession } from "@/lib/auth-client"
import { Sparkles, ArrowLeft, Loader2, Chrome } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const { data: session, isPending } = useSession()
    const router = useRouter()

    // Redirect to dashboard if user already has an active session
    useEffect(() => {
        if (!isPending && session?.user) {
            router.replace("/dashboard")
        }
    }, [session, isPending, router])

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        try {
            await signIn.social({
                provider: "google",
                callbackURL: "/dashboard"
            })
        } catch (error) {
            console.error("Login failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Show loading state while checking session
    if (isPending) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // If session exists, show loading while redirecting
    if (session?.user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium text-sm">Redirigiendo al dashboard...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
            {/* Background Effects matching Landing */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent blur-[100px] rounded-full -z-10 opacity-50" />

            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <Link
                    href="/"
                    className="group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all mb-4 px-4 py-2 hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10"
                >
                    <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                    Volver al inicio
                </Link>

                <div className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-[40px] p-8 md:p-12 shadow-none space-y-10 relative overflow-hidden">
                    {/* Subtle inner glow */}
                    <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

                    <div className="text-center space-y-6">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-primary blur-2xl opacity-20 animate-pulse" />
                            <div className="relative h-20 w-20 bg-primary rounded-[24px] mx-auto flex items-center justify-center shadow-none rotate-3 hover:rotate-0 transition-transform duration-500">
                                <Logo className="h-12 w-12 text-primary-foreground" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/50 rounded-full border border-primary/5 text-[10px] font-bold uppercase tracking-widest text-primary">
                                <Sparkles className="h-3 w-3" />
                                Acceso Premium
                            </div>
                            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter leading-none">
                                Login <span className="text-primary italic">profesional</span>
                            </h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                Gestiona tu agenda con VLink.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full group relative flex items-center justify-center gap-4 bg-white text-black border-2 border-slate-100 hover:border-primary/20 py-5 rounded-2xl font-bold text-lg shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isLoading ? (
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
                            {isLoading ? "Iniciando sesión..." : "Continuar con Google"}
                        </button>

                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px flex-1 bg-primary/10" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/50">Seguridad Garantizada</span>
                            <div className="h-px flex-1 bg-primary/10" />
                        </div>

                        <p className="text-center text-xs text-muted-foreground px-4 leading-relaxed font-medium">
                            Al continuar, aceptas nuestros{" "}
                            <Link href="/terminos" className="text-primary hover:underline underline-offset-4">términos de servicio</Link>
                            {" "}y{" "}
                            <Link href="/privacidad" className="text-primary hover:underline underline-offset-4">política de privacidad</Link>.
                        </p>
                    </div>
                </div>

                {/* Footer text in login */}
                <p className="text-center text-sm font-bold text-muted-foreground/60">
                    ¿Necesitas ayuda? <Link href="/soporte" className="text-primary hover:underline underline-offset-4">Centro de Soporte</Link>
                </p>
            </div>
        </div>
    )
}

