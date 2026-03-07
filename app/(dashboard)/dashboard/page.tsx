import prisma from "@/lib/prisma"
import { startOfDay, endOfDay, format, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, CheckCircle2, CalendarOff, TrendingUp, Users, Download } from "lucide-react"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { subDays, eachDayOfInterval, format as formatDateFns } from "date-fns"
import { getEffectiveProfile } from "@/lib/permissions"
import { AppointmentCard } from "@/components/appointment-card"
import { EmptyState } from "@/components/empty-state"
import { Title } from "@/components/title"

export default async function DashboardPage() {
    const profile = await getEffectiveProfile()
    const today = new Date()

    // Get all appointments for this profile (including cancelled for conversion rate)
    const allAppointmentsWithCancelled = await prisma.appointment.findMany({
        where: {
            profileId: profile.id,
        },
        include: {
            service: true,
            profile: { select: { username: true } }
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header section with profile overview */}
            <header className="relative p-8 rounded-3xl bg-linear-to-br from-primary/10 via-background to-background border-2 border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CalendarIcon className="h-24 w-24 text-primary rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Sistema Activo
                        </div>
                        <Title title="Panel de Control" />
                        <p className="text-muted-foreground font-medium text-lg max-w-xl">
                            Hola <span className="text-foreground font-bold">{profile.displayName || profile.user.name}</span>, gestiona tus servicios y actividad. Hoy es <span className="text-primary font-bold italic decoration-primary/30">{format(today, "EEEE, d 'de' MMMM", { locale: es })}</span>.
                        </p>
                    </div>
                </div>
            </header>

            <Tabs defaultValue="agenda" className="space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
                    <TabsList className="w-full sm:w-auto bg-muted/40 p-1.5 rounded-2xl h-auto border-2 border-primary/5 backdrop-blur-sm shadow-inner">
                        <TabsTrigger value="agenda" className="flex-1 sm:flex-none rounded-xl px-4 sm:px-10 py-3 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg active:scale-95 transition-all">
                            Mi Agenda
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex-1 sm:flex-none rounded-xl px-4 sm:px-10 py-3 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg active:scale-95 transition-all">
                            Estadísticas
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4 sm:gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 w-fit bg-card/40 px-6 py-2 rounded-full border border-primary/5 backdrop-blur overflow-x-auto custom-scrollbar">
                            <span className="flex items-center gap-2 shrink-0"><div className="h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50" /> {totalAppointmentsToday} Hoy</span>
                            <div className="h-3 w-px bg-border/50 shrink-0" />
                            <span className="flex items-center gap-2 shrink-0"><div className="h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" /> {allAppointments.length} Activas</span>
                            <div className="h-3 w-px bg-border/50 shrink-0" />
                            <a
                                href="/api/export/appointments"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 shrink-0 text-primary/70 hover:text-primary transition-colors cursor-pointer"
                                title="Exportar historial a CSV"
                            >
                                <div className="p-1 rounded bg-primary/10">
                                    <Download className="h-3 w-3" />
                                </div>
                                CSV
                            </a>
                        </div>
                    </div>
                </div>

                <TabsContent value="agenda" className="space-y-16 mt-0 focus-visible:ring-0">
                    {/* Bento Grid Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-6">
                        <div className="md:col-span-3 xl:col-span-4 p-6 sm:p-8 bg-card/60 backdrop-blur-xl border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 space-y-6 flex flex-col justify-between hover:border-primary/40 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                            <div className="h-14 w-14 bg-linear-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                                <CalendarIcon className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl sm:text-4xl font-black font-display tracking-tight leading-none">{totalAppointmentsToday}</p>
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Citas agendadas para hoy</p>
                            </div>
                        </div>

                        <div className="md:col-span-3 xl:col-span-4 p-6 sm:p-8 bg-card/60 backdrop-blur-xl border border-blue-500/10 rounded-3xl shadow-xl shadow-blue-500/5 space-y-6 flex flex-col justify-between hover:border-blue-500/40 transition-all group overflow-hidden relative">
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700" />
                            <div className="h-14 w-14 bg-linear-to-br from-blue-500 to-blue-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:-rotate-12 transition-transform">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl sm:text-4xl font-black font-display tracking-tight leading-none">{allAppointments.length}</p>
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Reservas totales activas</p>
                            </div>
                        </div>

                        <div className="md:col-span-6 xl:col-span-4 p-6 sm:p-8 bg-card/60 backdrop-blur-xl border border-amber-500/10 rounded-3xl shadow-xl shadow-amber-500/5 space-y-6 flex flex-col justify-between hover:border-amber-500/40 transition-all group overflow-hidden relative">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-10 -mb-10 group-hover:scale-150 transition-transform duration-700" />
                            <div className="h-14 w-14 bg-linear-to-br from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:rotate-12 transition-transform">
                                <Clock className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl sm:text-4xl font-black font-display tracking-tight leading-none">{hoursOccupied}h</p>
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Horas de servicio ocupadas hoy</p>
                            </div>
                        </div>
                    </div>

                    {/* Today Context with a more distinctive separation */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent h-64 -mx-10 blur-3xl opacity-20 pointer-events-none" />

                        <div className="space-y-12">
                            {/* Hoy */}
                            <section className="space-y-8 relative">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-display font-black tracking-tight flex items-center gap-3">
                                            <div className="h-8 w-1.5 bg-primary rounded-full" />
                                            Agenda de Hoy
                                        </h2>
                                        <p className="text-muted-foreground font-medium text-sm">Estas son tus citas confirmadas para la jornada actual.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-5 py-2 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-xl border border-primary/10 shadow-sm shadow-primary/5">
                                            {todayAppointments.length} bloqueos
                                        </span>
                                    </div>
                                </div>

                                {todayAppointments.length > 0 ? (
                                    <div className="grid gap-6">
                                        {todayAppointments.map((appt) => (
                                            <AppointmentCard key={appt.id} appt={appt} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Día libre"
                                        description="No tienes citas agendadas para hoy. Un buen momento para organizar tus servicios o descansar."
                                        actionText="Configurar Disponibilidad"
                                        actionHref="/dashboard/disponibilidad"
                                        icon={CalendarOff}
                                    />
                                )}
                            </section>

                            {/* Todas las Próximas */}
                            <section className="space-y-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-display font-black tracking-tight flex items-center gap-3">
                                            <div className="h-8 w-1.5 bg-blue-500 rounded-full" />
                                            Próximas Reservas
                                        </h2>
                                        <p className="text-muted-foreground font-medium text-sm">Vista a futuro de los compromisos ya confirmados en tu calendario.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-5 py-2 bg-blue-500/10 text-blue-600 text-xs font-black uppercase tracking-widest rounded-xl border border-blue-500/10 shadow-sm shadow-blue-500/5">
                                            {upcomingAppointments.length} por venir
                                        </span>
                                    </div>
                                </div>

                                {upcomingAppointments.length > 0 ? (
                                    <div className="grid gap-6">
                                        {upcomingAppointments.map((appt) => (
                                            <AppointmentCard key={appt.id} appt={appt} showDate />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Sin futuras citas"
                                        description="No hay reservas en el horizonte cercano. ¡Prueba compartiendo tu link público!"
                                        actionText="Ir a mi Perfil"
                                        actionHref="/dashboard/perfil"
                                        icon={CalendarOff}
                                    />
                                )}
                            </section>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-0 focus-visible:ring-0">
                    <div className="p-10 rounded-[2.5rem] bg-linear-to-br from-primary/5 via-card to-card border-2 border-primary/5 shadow-2xl shadow-primary/5">
                        <div className="space-y-2 mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 mb-2">
                                <Users className="h-3 w-3" />
                                Insights de Negocio
                            </div>
                            <h2 className="text-4xl font-display font-black tracking-tight text-primary">Rendimiento Comercial</h2>
                            <p className="text-muted-foreground font-medium text-lg">Mide el impacto y crecimiento de tu servicios digitales con datos precisos.</p>
                        </div>

                        <AnalyticsDashboard data={{
                            dailyStats,
                            serviceStats,
                            conversionRate,
                            totalAppointments: allAppointments.length
                        }} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

