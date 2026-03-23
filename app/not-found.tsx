"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Home } from "lucide-react"
import { Logo } from "@/components/logo"

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden flex flex-col relative">
            {/* Abstract Background Blur - Similar to Landing */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent blur-[100px] rounded-full -z-10 opacity-50" />

            {/* Header / Logo */}
            <header className="p-6 md:p-10">
                <Link href="/" className="inline-flex items-center gap-2 group">
                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                        <Logo className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-display font-black tracking-tighter">VLINK</span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="space-y-4">
                    <h1 className="text-[120px] md:text-[200px] font-display font-black tracking-tighter leading-none text-primary/10 relative">
                        404
                        <span className="absolute inset-0 flex items-center justify-center text-foreground text-5xl md:text-7xl lg:text-8xl italic">
                            Oops.
                        </span>
                    </h1>

                    <h2 className="text-3xl md:text-4xl font-display font-bold max-w-lg mx-auto leading-tight">
                        Parece que te has perdido en el tiempo.
                    </h2>

                    <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                        La página que buscas no existe o ha sido movida a otra dimensión.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Home className="h-5 w-5" />
                        Ir al Inicio
                    </Link>

                    <button
                        onClick={() => router.back()}
                        className="w-full sm:w-auto px-8 py-4 bg-card border border-primary/10 rounded-2xl font-bold text-base transition-all hover:bg-accent flex items-center justify-center gap-3"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Regresar
                    </button>
                </div>
            </main>

            {/* Decorative Footer Element */}
            <div className="h-2 w-full bg-linear-to-r from-transparent via-primary/20 to-transparent" />
        </div>
    )
}

