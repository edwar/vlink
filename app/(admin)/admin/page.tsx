import { getGlobalStats } from "@/app/actions/admin"
import { Building2, Users, CalendarCheck2, TrendingUp, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AdminCharts } from "@/components/admin/admin-charts"

export default async function AdminDashboard() {
    const stats = await getGlobalStats()

    const cards = [
        { title: "Organizaciones", value: stats.orgCount, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10", hoverBorder: "hover:border-blue-500/15" },
        { title: "Usuarios Totales", value: stats.userCount, icon: Users, icon2: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", hoverBorder: "hover:border-green-500/15" },
        { title: "Citas Agendadas", value: stats.apptCount, icon: CalendarCheck2, color: "text-purple-500", bg: "bg-purple-500/10", hoverBorder: "hover:border-purple-500/15" },
        { title: "Miembros Activos", value: stats.memberCount, icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10", hoverBorder: "hover:border-amber-500/15" },
    ]

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-display font-black tracking-tight text-foreground uppercase">Consola de Administración</h1>
                    <p className="text-muted-foreground font-medium">Panel de control global de la infraestructura VLink.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon
                    return (
                        <Card key={card.title} className={`col-span-3 p-6 sm:p-8 bg-linear-to-bl from-primary/5 to-transparent border border-border/10 rounded-[2.5rem] space-y-6 flex flex-col justify-between hover:from-primary/10 ${card.hoverBorder} transition-colors group overflow-hidden relative`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
                            <CardContent>
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

            <AdminCharts
                planStats={stats.planStats}
                appointmentsByStatus={stats.appointmentsByStatus}
                topServices={stats.topServices}
                monthlyGrowth={stats.monthlyGrowth}
            />
        </div>
    )
}
