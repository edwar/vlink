import Link from "next/link"
import { Shield, Lock, Eye, FileText, ArrowLeft, Globe, Zap, Scale, Gavel } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Documentación Legal | VLink",
    description: "Conoce nuestras políticas de privacidad y términos de uso del servicio.",
}

export default function PoliticasPage() {
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
                        <Shield className="h-4 w-4 text-primary" />
                        Privacidad Garantizada
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-40 pb-32">
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    {/* Hero Title */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <FileText className="h-3.5 w-3.5" />
                            Marco Legal & Privacidad
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-[0.9]">
                            Nuestras <span className="text-primary italic">Políticas</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium border-l-4 border-primary/20 pl-6 py-2">
                            En VLink, la transparencia es fundamental. Aquí encontrarás cómo protegemos tus datos y las reglas claras del juego para usar nuestra plataforma.
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="grid gap-12">
                        <Section
                            icon={<Eye className="h-6 w-6" />}
                            title="1. Privacidad y Datos de Usuario"
                        >
                            <p>Tu información profesional y la de tus clientes es sagrada. Recolectamos únicamente lo necesario para el funcionamiento de la agenda (nombres, correos, teléfonos).</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-muted-foreground font-medium">
                                <li>No vendemos tus datos a terceros.</li>
                                <li>Solo leemos tu Google Calendar para detectar disponibilidad si tú lo autorizas.</li>
                                <li>Mantenemos registros seguros de todas las transacciones de reserva.</li>
                            </ul>
                        </Section>

                        <Section
                            icon={<Scale className="h-6 w-6" />}
                            title="2. Términos de Uso del Servicio"
                        >
                            <p>VLink se ofrece como una herramienta de productividad. Al usarla, te comprometes a:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-muted-foreground font-medium">
                                <li>Hacer un uso lícito y profesional de la plataforma.</li>
                                <li>Gestionar correctamente tus citas con los clientes finales.</li>
                                <li>No realizar spam o abusar de los sistemas de notificación por WhatsApp.</li>
                            </ul>
                        </Section>

                        <Section
                            icon={<Lock className="h-6 w-6" />}
                            title="3. Seguridad de Infraestructura"
                        >
                            <p>Utilizamos tecnologías de punta para garantizar la integridad de tu información:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-muted-foreground font-medium">
                                <li>Encriptación SSL/TLS de extremo a extremo.</li>
                                <li>Bases de datos escalables y seguras en la nube.</li>
                                <li>Autenticación robusta de proveedores de confianza.</li>
                            </ul>
                        </Section>

                        <div className="p-8 bg-accent/30 rounded-[32px] border border-primary/10 space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Gavel className="h-5 w-5 text-primary" />
                                Jurisdicción
                            </h3>
                            <p className="text-muted-foreground font-medium">
                                Estos términos se rigen por las leyes vigentes y cualquier disputa será resuelta bajo los marcos legales correspondientes a la sede de operación de Cognilab.
                            </p>
                        </div>
                    </div>

                    <footer className="pt-20 border-t border-primary/5 text-center space-y-4">
                        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
                            Última actualización: Febrero 2026
                        </p>
                        <p className="text-sm text-muted-foreground">
                            VLink - El estándar moderno para agendamiento profesional.
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    )
}

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        <section className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                    {icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight">{title}</h2>
            </div>
            <div className="text-lg leading-relaxed font-medium text-muted-foreground/80 space-y-4">
                {children}
            </div>
        </section>
    )
}
