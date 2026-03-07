import Link from "next/link"
import { Calendar, CheckCircle2, MessageSquare, ShieldCheck, ArrowRight, Smartphone, Sparkles, Users, Briefcase, Activity } from "lucide-react"
import { Logo } from "@/components/logo"
import { AuthCTA } from "@/components/auth-cta"
import { LandingNav } from "@/components/landing-nav"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "VLink — Agendamiento profesional para individuos y equipos",
  description: "Conecta tu Google Calendar, gestiona múltiples agendas y permite que tus clientes reserven en segundos con una experiencia premium.",
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Abstract Background Blur */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent blur-[100px] rounded-full -z-10 opacity-50" />

        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-full border border-primary/10 text-xs font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Novedad: Soporte para Organizaciones
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter leading-[0.9]">
            Agendamiento <span className="text-primary italic">profesional</span>, para equipos.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Conecta tu Google Calendar, gestiona múltiples agendas y permite que tus clientes reserven en segundos con una experiencia premium.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <AuthCTA
              className="w-full sm:w-auto px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              loggedInChildren={<>Ir al dashboard <ArrowRight className="h-5 w-5" /></>}
            >
              Crear mi cuenta gratis
              <ArrowRight className="h-5 w-5" />
            </AuthCTA>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Users className="h-6 w-6" />,
              title: "Gestión de Equipos",
              desc: "Crea organizaciones y asigna roles. Managers pueden coordinar múltiples agendas desde un solo lugar."
            },
            {
              icon: <Calendar className="h-6 w-6" />,
              title: "Agenda Inteligente",
              desc: "Sincronización total con Google Calendar. Bloqueos recurrentes y preventivos para evitar empalmes."
            },
            {
              icon: <Briefcase className="h-6 w-6" />,
              title: "Catálogo de Servicios",
              desc: "Define múltiples servicios con duraciones y precios personalizados. Tus clientes eligen lo que necesitan."
            }
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-8 bg-card border border-primary/5 rounded-[32px] space-y-6 hover:shadow-2xl transition-all hover:-translate-y-2 group"
            >
              <div className="h-14 w-14 bg-accent rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-display font-bold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-card/50 border border-primary/10 rounded-[48px] p-8 md:p-16 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter leading-tight">
              Diseñado para el <span className="text-primary">flujo de trabajo</span> moderno.
            </h2>
            <div className="space-y-6">
              {[
                { title: "Mobile First Extremo", desc: "Tus clientes pueden agendar desde cualquier lugar con una interfaz de tipo nativa." },
                { title: "Privacidad Delegada", desc: "Los profesionales mantienen el control de su Google Calendar personal." },
                { title: "Captura Inteligente", desc: "Formateo automático de WhatsApp y validación de datos para evitar errores en las citas." },
                { title: "Link Único Premium", desc: "Tu propia URL vlink.cognilab.dev/nombre para compartir en redes y perfiles." }
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square bg-accent/20 rounded-3xl overflow-hidden border border-primary/5 group">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-4 text-center p-8">
                <Activity className="h-12 w-12 text-primary mx-auto opacity-50 group-hover:scale-110 transition-transform duration-500" />
                <p className="text-sm font-bold uppercase tracking-widest text-primary/40">Visualización de Estadísticas</p>
                <p className="text-muted-foreground font-medium">Monitorea tus citas, ingresos y próximos clientes en tiempo real.</p>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 h-24 w-24 bg-primary/10 rounded-2xl blur-2xl" />
            <div className="absolute bottom-4 left-4 h-32 w-32 bg-accent/30 rounded-full blur-3xl opacity-50" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-accent/30 py-32 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter">Cómo funciona</h2>
            <p className="text-muted-foreground text-lg font-medium">Tres pasos simples para automatizar tu equipo.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { step: "01", title: "Conecta", desc: "Sincroniza Google Calendar y configura tu organización." },
              { step: "02", title: "Organiza", desc: "Agrega servicios, precios y define tu disponibilidad." },
              { step: "03", title: "Comparte", desc: "Envía el link y recibe citas sincronizadas al instante." }
            ].map((step) => (
              <div key={step.step} className="space-y-4">
                <span className="text-7xl font-display font-black text-primary/10 block leading-none">{step.step}</span>
                <h4 className="text-xl font-bold">{step.title}</h4>
                <p className="text-muted-foreground font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-primary/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/10">
              <Logo className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-black tracking-tighter">VLINK</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">© 2026 VLink. Hecho para profesionales modernos.</p>
          <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground">
            <Link href="/terminos" className="hover:text-primary transition-colors">Términos</Link>
            <Link href="/privacidad" className="hover:text-primary transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
