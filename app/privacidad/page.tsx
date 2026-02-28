import Link from "next/link"
import { Shield, Lock, Eye, FileText, ArrowLeft, Globe, Zap } from "lucide-react"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group transition-all">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </div>
                        <span className="font-display font-black tracking-tighter text-xl">VLINK</span>
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
                            Documentación Legal
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-[0.9]">
                            Políticas de <span className="text-primary italic">Privacidad</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium border-l-4 border-primary/20 pl-6 py-2">
                            En VLink, tu privacidad y la seguridad de tus datos son nuestra máxima prioridad. Esta política detalla cómo manejamos tu información profesional.
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="grid gap-12">
                        <Section
                            icon={<Eye className="h-6 w-6" />}
                            title="1. Información que Recolectamos"
                        >
                            <p>Para proporcionar nuestros servicios de agendamiento profesional, recolectamos los siguientes datos:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-muted-foreground">
                                <li><span className="text-foreground font-bold">Información de Perfil:</span> Nombre, correo electrónico y foto de perfil proporcionados a través de nuestros proveedores de autenticación.</li>
                                <li><span className="text-foreground font-bold">Datos de Calendario:</span> Solo si decides conectar tu Google Calendar, accedemos a tus eventos para detectar disponibilidad y crear citas nuevas.</li>
                                <li><span className="text-foreground font-bold">Información de Contacto:</span> Tu nombre público y biografía profesional que elijas mostrar en tu link único.</li>
                            </ul>
                        </Section>

                        <Section
                            icon={<Globe className="h-6 w-6" />}
                            title="2. Uso de Datos de Google (Google API Disclosure)"
                        >
                            <p className="font-bold text-primary mb-4 italic">Cumplimiento con las políticas de Google:</p>
                            <p>VLink accede a tu Google Calendar con el único propósito de automatizar tu agenda. </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-muted-foreground">
                                <li><span className="text-foreground font-bold">Uso Limitado:</span> El uso y la transferencia de la información recibida de las APIs de Google por parte de VLink cumplirán con la <Link href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" target="_blank" className="underline hover:text-primary">Política de datos de usuario de los servicios de API de Google</Link>, incluidos los requisitos de Uso Limitado.</li>
                                <li>No almacenamos el contenido privado, descripciones o asistentes de tus eventos personales que no hayan sido creados a través de VLink.</li>
                                <li>No compartimos tus datos de calendario con terceros para fines publicitarios o de marketing.</li>
                            </ul>
                        </Section>

                        <Section
                            icon={<Shield className="h-6 w-6" />}
                            title="3. Cómo Protegemos tus Datos"
                        >
                            <p>Utilizamos infraestructura de grado industrial para asegurar que tu información esté a salvo:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-muted-foreground">
                                <li>Encriptación de datos en tránsito (SSL/TLS) y en reposo.</li>
                                <li>Autenticación segura a través de Better Auth con soporte para proveedores de confianza.</li>
                                <li>Bases de datos aisladas y seguras gestionadas por Neon (PostgreSQL).</li>
                            </ul>
                        </Section>

                        <Section
                            icon={<Zap className="h-6 w-6" />}
                            title="4. Tus Derechos y Control"
                        >
                            <p>Tienes control total sobre tu información en VLink:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-muted-foreground">
                                <li><span className="text-foreground font-bold">Desconexión:</span> Puedes revocar el acceso a tu Google Calendar en cualquier momento desde tu panel de configuración.</li>
                                <li><span className="text-foreground font-bold">Eliminación:</span> Puedes solicitar la eliminación total de tu cuenta y datos asociados contactándonos directamente.</li>
                                <li><span className="text-foreground font-bold">Transparencia:</span> Solo recolectamos los datos estrictamente necesarios para el funcionamiento de la agenda.</li>
                            </ul>
                        </Section>

                        <div className="p-8 bg-accent/30 rounded-[32px] border border-primary/10 space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" />
                                Contacto de Privacidad
                            </h3>
                            <p className="text-muted-foreground">
                                Si tienes dudas sobre cómo tratamos tus datos, puedes contactarnos en:
                                <br />
                                <span className="text-foreground font-bold font-display tracking-tight text-lg mt-2 block">
                                    edwaramayadiaz@gmail.com
                                </span>
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
