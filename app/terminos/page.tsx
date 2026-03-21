import Link from "next/link"
import { Scale, FileText, ArrowLeft, Gavel, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Términos y Condiciones — VLink",
    description: "Lee los términos y condiciones de uso de VLink, la plataforma de agendamiento profesional.",
}

export default function TermsPage() {
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
                        <Scale className="h-4 w-4 text-primary" />
                        Acuerdo de Servicio
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-40 pb-32">
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    {/* Hero Title */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <Gavel className="h-3.5 w-3.5" />
                            Marco Legal
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-[0.9]">
                            Términos y <span className="text-primary italic">Condiciones</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium border-l-4 border-primary/20 pl-6 py-2">
                            Al utilizar VLink, aceptas estos términos. Por favor, léelos detenidamente para entender tus derechos y responsabilidades como usuario profesional.
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="grid gap-12 text-muted-foreground/90">
                        <Section
                            icon={<CheckCircle2 className="h-6 w-6" />}
                            title="1. Aceptación de los Términos"
                        >
                            <p>Al acceder o utilizar la plataforma VLink, el usuario acepta estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no deberás utilizar nuestros servicios.</p>
                        </Section>

                        <Section
                            icon={<FileText className="h-6 w-6" />}
                            title="2. Descripción del Servicio"
                        >
                            <p>VLink proporciona una herramienta de gestión de citas y agendamiento profesional que incluye:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Sincronización con calendarios externos (Google Calendar).</li>
                                <li>Página pública de reserva para clientes.</li>
                                <li>Validación de citas mediante WhatsApp.</li>
                                <li>Gestión de equipos y roles organizacionales.</li>
                            </ul>
                        </Section>

                        <Section
                            icon={<Scale className="h-6 w-6" />}
                            title="3. Responsabilidades del Usuario"
                        >
                            <p>Como usuario profesional de VLink, eres responsable de:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 font-medium">
                                <li>Mantener la confidencialidad de tus credenciales de acceso.</li>
                                <li>Asegurar que la información proporcionada en tu perfil sea veraz.</li>
                                <li>Gestionar correctamente tus citas y la comunicación con tus clientes.</li>
                                <li>No utilizar la plataforma para fines ilícitos o envío de spam.</li>
                            </ul>
                        </Section>

                        <Section
                            icon={<AlertCircle className="h-6 w-6" />}
                            title="4. Limitación de Responsabilidad"
                        >
                            <p>VLink se ofrece "tal cual" y no garantiza que el servicio sea ininterrumpido o libre de errores. No nos hacemos responsables por:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Pérdida de ingresos debido a fallos técnicos o de sincronización.</li>
                                <li>Citas canceladas o no asistidas por parte de terceros.</li>
                                <li>Uso indebido de la plataforma por parte de tus clientes o miembros del equipo.</li>
                            </ul>
                        </Section>

                        <Section
                            icon={<Clock className="h-6 w-6" />}
                            title="5. Modificaciones del Servicio"
                        >
                            <p>VLink se reserva el derecho de modificar o interrumpir el servicio (o cualquier parte del mismo) en cualquier momento, con o sin previo aviso. También podemos actualizar estos términos periódicamente para reflejar cambios legales o funcionales.</p>
                        </Section>

                        <div className="p-8 bg-accent/30 rounded-[32px] border border-primary/10 space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                <FileText className="h-5 w-5 text-primary" />
                                Jurisdicción
                            </h3>
                            <p className="text-muted-foreground">
                                Estos términos se rigen por las leyes aplicables en el territorio de operación de VLink. Cualquier disputa será resuelta ante los tribunales competentes de dicha jurisdicción.
                            </p>
                        </div>
                    </div>

                    <footer className="pt-20 border-t border-primary/5 text-center space-y-4">
                        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
                            Última actualización: Febrero 2026
                        </p>
                        <p className="text-sm text-muted-foreground">
                            VLink - Potenciando la productividad de los profesionales de hoy.
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
                <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight text-foreground">{title}</h2>
            </div>
            <div className="text-lg leading-relaxed font-medium space-y-4">
                {children}
            </div>
        </section>
    )
}
