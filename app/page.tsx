import Link from "next/link"
import { Calendar, CheckCircle2, MessageSquare, ShieldCheck, ArrowRight, Smartphone, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-primary/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-black tracking-tighter">VLINK</span>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
            >
              Empezar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Abstract Background Blur */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent blur-[100px] rounded-full -z-10 opacity-50" />

        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-full border border-primary/10 text-xs font-bold uppercase tracking-widest text-primary">
            <Smartphone className="h-3.5 w-3.5" />
            Optimizado para Móviles
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter leading-[0.9]">
            Agendamiento <span className="text-primary italic">profesional</span>, sin fricciones.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Conecta tu Google Calendar, comparte tu link único y deja que tus clientes agenden por WhatsApp en segundos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              href="/login"
              className="w-full sm:w-auto px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              Crear mi cuenta gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <MessageSquare className="h-6 w-6" />,
              title: "Validación WhatsApp",
              desc: "Tus clientes se registran con su número de WhatsApp. Sin contraseñas, sin formularios infinitos."
            },
            {
              icon: <Calendar className="h-6 w-6" />,
              title: "Agenda Inteligente",
              desc: "Sincronización total con Google Calendar. Definie bloqueos recurrentes y evita el double-booking."
            },
            {
              icon: <ShieldCheck className="h-6 w-6" />,
              title: "Link de Marca Único",
              desc: "Tu propio espacio profesional bajo vlink.app/tu-nombre. Minimalista, moderno y oscuro."
            }
          ].map((feature, i) => (
            <div
              key={i}
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

      {/* How it works */}
      <section className="bg-accent/30 py-32 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter">Cómo funciona</h2>
            <p className="text-muted-foreground text-lg font-medium">Tres pasos simples para automatizar tu tiempo.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { step: "01", title: "Conecta", desc: "Sincroniza tu Google Calendar en un clic." },
              { step: "02", title: "Configura", desc: "Define tus horarios y bloqueos de agenda." },
              { step: "03", title: "Comparte", desc: "Envía tu link y recibe citas confirmadas." }
            ].map((step, i) => (
              <div key={i} className="space-y-4">
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
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-black tracking-tighter">VLINK</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">© 2026 VLink. Hecho para profesionales modernos.</p>
          <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Términos</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
