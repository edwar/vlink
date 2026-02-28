import prisma from "@/lib/prisma"
import { startOfDay, endOfDay, format, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, CheckCircle2, CalendarOff } from "lucide-react"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { subDays, eachDayOfInterval, format as formatDateFns } from "date-fns"
import { getEffectiveProfile } from "@/lib/permissions"
import { AppointmentCard } from "@/components/appointment-card"
import { EmptyState } from "@/components/empty-state"

export default async function DashboardPage() {
    const profile = await getEffectiveProfile()
    const today = new Date()

    // Get all appointments for this profile (including cancelled for conversion rate)
    const allAppointmentsWithCancelled = await prisma.appointment.findMany({
        where: {
            profileId: profile.id,
        },
        include: {
            service: true
        }
    })

    const allAppointments = allAppointmentsWithCancelled.filter(a => a.status !== "CANCELLED")

    const todayAppointments = allAppointments.filter(appt =>
        appt.startTime >= startOfDay(today) && appt.startTime <= endOfDay(today)
    )

    const upcomingAppointments = allAppointments.filter(appt =>
        isAfter(appt.startTime, today) && !todayAppointments.includes(appt)
    )

    // ANALYTICS DATA GENERATION
    // 1. Weekly Stats (Last 7 days)
    const last7Days = eachDayOfInterval({
        start: startOfDay(subDays(today, 6)),
        end: endOfDay(today)
    })

    const dailyStats = last7Days.map(day => {
        const start = startOfDay(day)
        const end = endOfDay(day)
        const dayAppts = allAppointmentsWithCancelled.filter(a => a.startTime >= start && a.startTime <= end)
        return {
            date: formatDateFns(day, "eee", { locale: es }),
            total: dayAppts.length,
            confirmed: dayAppts.filter(a => a.status === "CONFIRMED").length
        }
    })

    // 2. Service Distribution
    const serviceGroups = allAppointments.reduce((acc, appt) => {
        const name = appt.service?.name || "Sin servicio"
        acc[name] = (acc[name] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const colors = [
        "hsl(224.3 76.3% 48%)",   // Indigo
        "hsl(142.1 76.2% 36.3%)", // Emerald
        "hsl(38 92% 50%)",        // Amber
        "hsl(346 84% 61%)",       // Pink
        "hsl(199 89% 48%)",       // Sky
    ]
    const serviceStats = Object.entries(serviceGroups).map(([name, count], i) => ({
        name,
        count,
        fill: colors[i % colors.length]
    }))

    // 3. Conversion Rate
    const totalRequests = allAppointmentsWithCancelled.length
    const confirmedCount = allAppointmentsWithCancelled.filter(a => a.status === "CONFIRMED").length
    const conversionRate = totalRequests > 0 ? Math.round((confirmedCount / totalRequests) * 100) : 0

    // Stats for cards
    const totalAppointmentsToday = todayAppointments.length
    const totalMinutes = todayAppointments.reduce((acc, appt) => {
        const duration = (appt.endTime.getTime() - appt.startTime.getTime()) / (1000 * 60)
        return acc + duration
    }, 0)
    const hoursOccupied = Math.round((totalMinutes / 60) * 10) / 10

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-display font-black tracking-tight text-primary">
                        Panel de Control
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Gestiona tus citas y actividad reciente. Hoy es {format(today, "EEEE, d 'de' MMMM", { locale: es })}.
                    </p>
                </div>
            </header>

            <Tabs defaultValue="agenda" className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                    <TabsList className="bg-muted/30 p-1 rounded-2xl h-auto border">
                        <TabsTrigger value="agenda" className="rounded-xl px-8 py-2.5 font-black uppercase text-xs tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Mi Agenda
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="rounded-xl px-8 py-2.5 font-black uppercase text-xs tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Estadísticas
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                        <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Hoy</span>
                        <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500" /> Confirmadas</span>
                    </div>
                </div>

                <TabsContent value="agenda" className="space-y-12 mt-0 focus-visible:ring-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 bg-card border-2 border-primary/5 rounded-xl shadow-sm space-y-4 hover:border-primary/20 transition-all group">
                            <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <CalendarIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-black font-display tracking-tight">{totalAppointmentsToday}</p>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Citas hoy</p>
                            </div>
                        </div>

                        <div className="p-8 bg-card border-2 border-primary/5 rounded-xl shadow-sm space-y-4 hover:border-primary/20 transition-all group">
                            <div className="h-12 w-12 bg-blue-500/5 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-black font-display tracking-tight">{allAppointments.length}</p>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Activas</p>
                            </div>
                        </div>

                        <div className="p-8 bg-card border-2 border-primary/5 rounded-xl shadow-sm space-y-4 hover:border-primary/20 transition-all group">
                            <div className="h-12 w-12 bg-amber-500/5 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-black font-display tracking-tight">{hoursOccupied}h</p>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Ocupación hoy</p>
                            </div>
                        </div>
                    </div>

                    {/* Hoy */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-2xl font-display font-black tracking-tight">Agenda de Hoy</h2>
                            <span className="px-4 py-1.5 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest rounded-full">
                                {todayAppointments.length} citas
                            </span>
                        </div>

                        {todayAppointments.length > 0 ? (
                            <div className="grid gap-4">
                                {todayAppointments.map((appt) => (
                                    <AppointmentCard key={appt.id} appt={appt} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="Día despejado"
                                description="No tienes citas para hoy. ¡Disfruta el tiempo libre o comparte tu perfil!"
                                actionText="Ir a mi Perfil"
                                actionHref="/dashboard/perfil"
                                icon={CalendarOff}
                            />
                        )}
                    </section>

                    {/* Todas las Próximas */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-2xl font-display font-black tracking-tight">Próximas Reservas</h2>
                            <span className="px-4 py-1.5 bg-blue-500/5 text-blue-600 text-xs font-black uppercase tracking-widest rounded-full">
                                {upcomingAppointments.length} futuras
                            </span>
                        </div>

                        {upcomingAppointments.length > 0 ? (
                            <div className="grid gap-4">
                                {upcomingAppointments.map((appt) => (
                                    <AppointmentCard key={appt.id} appt={appt} showDate />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="No hay citas próximas"
                                description="No tienes citas próximas por ahora. ¡Disfruta el tiempo libre o comparte tu perfil!"
                                actionText="Ir a mi Perfil"
                                actionHref="/dashboard/perfil"
                                icon={CalendarOff}
                            />
                        )}
                    </section>
                </TabsContent>

                <TabsContent value="analytics" className="mt-0 focus-visible:ring-0">
                    <div className="space-y-2 mb-8">
                        <h2 className="text-3xl font-display font-black tracking-tight text-primary">Analíticas de Conversión</h2>
                        <p className="text-muted-foreground font-medium">Mide el impacto y crecimiento de tu servicios digitales.</p>
                    </div>

                    <AnalyticsDashboard data={{
                        dailyStats,
                        serviceStats,
                        conversionRate,
                        totalAppointments: allAppointments.length
                    }} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

