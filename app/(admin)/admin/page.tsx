import { getGlobalStats } from "@/app/actions/admin"
import { Building2, Users, CalendarCheck2, TrendingUp, ShieldCheck, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminDashboard() {
    const stats = await getGlobalStats()

    const cards = [
        { title: "Organizaciones", value: stats.orgCount, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Usuarios Totales", value: stats.userCount, icon: Users, icon2: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
        { title: "Citas Agendadas", value: stats.apptCount, icon: CalendarCheck2, color: "text-purple-500", bg: "bg-purple-500/10" },
        { title: "Miembros Activos", value: stats.memberCount, icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
    ]

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-display font-black tracking-tight text-foreground uppercase">Consola de Administración</h1>
                    <p className="text-muted-foreground font-medium">Panel de control global de la infraestructura VLink.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon
                    return (
                        <Card key={card.title} className="border-none shadow-xl shadow-primary/5 bg-card overflow-hidden group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-2xl font-black font-display tracking-tight group-hover:scale-110 transition-transform">
                                        {card.value.toLocaleString()}
                                    </span>
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{card.title}</h3>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribución por Plan */}
                <Card className="border-none shadow-xl shadow-primary/5">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-xl font-black font-display tracking-tight flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" /> Distribución por Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 space-y-4">
                        {stats.planStats.map(ps => (
                            <div key={ps.plan} className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl">
                                <span className="text-xs font-black uppercase tracking-widest">{ps.plan}</span>
                                <span className={`px-4 py-1 rounded-full text-xs font-black ${ps.plan === 'FREE' ? 'bg-zinc-500 text-white' :
                                        ps.plan === 'TEAM' ? 'bg-blue-500 text-white' : 'bg-primary text-white'
                                    }`}>
                                    {ps.count} orgs
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Estado de Citas */}
                <Card className="border-none shadow-xl shadow-primary/5">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-xl font-black font-display tracking-tight flex items-center gap-2">
                            <CalendarCheck2 className="h-5 w-5 text-primary" /> Salud del Ecosistema
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 space-y-4">
                        {stats.appointmentsByStatus.map(s => (
                            <div key={s.status} className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl">
                                <span className="text-xs font-black uppercase tracking-widest">{s.status}</span>
                                <span className={`px-4 py-1 rounded-full text-xs font-black ${s.status === 'CANCELLED' ? 'bg-red-500 text-white' :
                                        s.status === 'CONFIRMED' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                                    }`}>
                                    {s.count}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
