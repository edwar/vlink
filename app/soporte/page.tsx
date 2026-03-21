import Link from "next/link"
import { Shield, Lock, Eye, FileText, ArrowLeft, MessageSquare, Phone, Mail, Clock, CheckCircle2, Zap } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Centro de Soporte | VLink",
    description: "¿Necesitas ayuda con tu agenda? Contacta a nuestro equipo técnico en Cognilab.",
}

export default function SoportePage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group transition-all">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </div>
                        <span className="font-display font-black tracking-tighter text-xl text-primary">VLINK</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                        <Clock className="h-4 w-4 text-primary" />
                        Atención Prioritaria
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-40 pb-32">
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    {/* Hero Title */}
                    <div className="space-y-6 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <Zap className="h-3.5 w-3.5" />
                            Canales de Ayuda
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-[0.9]">
                            Centro de <span className="text-primary italic">Soporte</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed pt-2">
                            Estamos aquí para que nunca pierdas una cita. Si tienes inconvenientes técnicos con tu agenda, elige un canal de contacto:
                        </p>
                    </div>

                    {/* Support Channels Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-10 bg-linear-to-br from-primary/5 via-transparent to-transparent rounded-[40px] border border-primary/10 space-y-6 hover:-translate-y-2 transition-transform duration-500 group">
                            <div className="h-14 w-14 bg-accent rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <MessageSquare className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-display font-black tracking-tight">Vía WhatsApp</h3>
                            <p className="text-muted-foreground font-medium">Nuestro canal más veloz para soporte técnico y dudas rápidas en tiempo real.</p>
                            <Link 
                                href="https://wa.me/573216830302" 
                                target="_blank"
                                className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:gap-4 transition-all"
                            >
                                Contactar ahora <Zap className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="p-10 bg-linear-to-br from-primary/5 via-transparent to-transparent rounded-[40px] border border-primary/10 space-y-6 hover:-translate-y-2 transition-transform duration-500 group">
                            <div className="h-14 w-14 bg-accent rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Mail className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-display font-black tracking-tight">Correo Electrónico</h3>
                            <p className="text-muted-foreground font-medium">Para consultas administrativas, facturación o reportes de errores detallados.</p>
                            <Link 
                                href="mailto:soporte@vlink.cognilab.dev" 
                                className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:gap-4 transition-all"
                            >
                                Enviar email <Mail className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* FAQ Quick Section */}
                    <div className="space-y-12 pt-10">
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                            <h2 className="text-3xl font-display font-black tracking-tight">Recursos Útiles</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 text-muted-foreground/90 leading-relaxed">
                            <div className="space-y-4">
                                <h4 className="text-foreground font-bold text-lg">¿Cómo sincronizo mi Google Calendar?</h4>
                                <p className="font-medium text-muted-foreground/80">Ve a Perfil &gt; Sincronización y autoriza el acceso a tu cuenta. Solo tomaremos los espacios ocupados para evitar cruces.</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-foreground font-bold text-lg">¿Qué es el tiempo de buffer?</h4>
                                <p className="font-medium text-muted-foreground/80">Es un margen que puedes configurar entre citas para tomar descansos o prepararte. Se añade automáticamente a cada reserva.</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-foreground font-bold text-lg">¿Mis clientes reciben recordatorios?</h4>
                                <p className="font-medium text-muted-foreground/80">Sí, enviamos avisos automáticos para que no olviden sus citas, reduciendo el "no-show" en tu jornada profesional.</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-foreground font-bold text-lg">¿Cómo contacto a mi equipo?</h4>
                                <p className="font-medium text-muted-foreground/80">Puedes invitar y gestionar a tus colegas desde la sección Organizaciones, permitiendo una agenda compartida.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-accent/30 rounded-[40px] border border-primary/10 text-center space-y-4">
                        <Clock className="h-10 w-10 text-primary mx-auto opacity-50 mb-2" />
                        <h3 className="text-xl font-bold font-display tracking-tight text-foreground">Horario de Operación</h3>
                        <p className="text-muted-foreground font-medium">Lunes a Viernes: 8:00 AM — 6:00 PM (GMT-5)</p>
                    </div>

                    <footer className="pt-10 text-center">
                        <Link href="/manual" className="text-xs font-black uppercase tracking-[0.3em] text-primary hover:underline">Ir a la Guía Maestra →</Link>
                    </footer>
                </div>
            </main>
        </div>
    )
}
