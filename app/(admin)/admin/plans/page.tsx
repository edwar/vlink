import { CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function AdminPlans() {
    // These come from the constants in lib/mercadopago.ts usually,
    // but in a mature admin module they should be editable.
    const plansInfo = [
        {
            plan: "FREE",
            price: "$0",
            limit: "1 Miembro",
            active: true,
            features: ["Agendas individuales", "Sync Google", "Confirmaciones Email"]
        },
        {
            plan: "TEAM",
            price: "$49.000 COP",
            limit: "5 Miembros",
            active: true,
            features: ["Agenda de Equipo", "Página de Org", "Gestión Multimanager"]
        },
        {
            plan: "CORPORATE",
            price: "$99.000 COP",
            limit: "Ilimitado",
            active: true,
            features: ["Subdominios (Pronto)", "API Access", "Prioridad 24/7"]
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-display font-black tracking-tight text-foreground uppercase">Planes y Precios</h1>
                    <p className="text-muted-foreground font-medium">Configuración de los niveles de suscripción del SaaS.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl font-bold h-12 flex items-center gap-2">
                        <Settings2 className="h-4 w-4" /> Configuración Global
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {plansInfo.map((p) => (
                    <Card key={p.plan} className="border-none shadow-xl shadow-primary/5 bg-card flex flex-col pt-4">
                        <CardHeader className="text-center pb-2">
                            <div className={`h-16 w-16 mx-auto rounded-3xl flex items-center justify-center mb-4 ${p.plan === 'FREE' ? 'bg-zinc-100 text-zinc-500' :
                                    p.plan === 'TEAM' ? 'bg-blue-100 text-blue-500' : 'bg-primary/10 text-primary'
                                }`}>
                                <CreditCard className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-2xl font-black font-display tracking-tight">{p.plan}</CardTitle>
                            <p className="text-3xl font-black font-display tracking-tighter text-foreground mt-2">{p.price}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{p.limit}</p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6 flex flex-col">
                            <ul className="space-y-3 flex-1">
                                {p.features.map(f => (
                                    <li key={f} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-6 border-t border-border/50">
                                <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs border-2 border-primary/20 bg-transparent text-primary hover:bg-primary/5">
                                    Editar Configuración
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-amber-500/5 border-2 border-dashed border-amber-500/20 rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="h-20 w-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                        <AlertTriangle className="h-10 w-10" />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-black font-display tracking-tight">Zona de Peligro Administrativo</h3>
                        <p className="text-muted-foreground font-medium">
                            Los cambios realizados aquí afectan directamente el comportamiento de la facturación de Mercado Pago. No agregues planes nuevos sin verificar primero la configuración del SDK.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
