import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { startOfDay, endOfDay, format, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, CheckCircle2, CalendarOff } from "lucide-react"
import { AppointmentCard } from "@/components/appointment-card"
import { EmptyState } from "@/components/empty-state"

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return null

    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id }
    })

    if (!profile) return null

    const today = new Date()

    // Get all non-cancelled appointments for this profile
    const allAppointments = await prisma.appointment.findMany({
        where: {
            profileId: profile.id,
            status: { not: "CANCELLED" }
        },
        include: {
            service: true
        },
        orderBy: {
            startTime: 'asc'
        }
    })

    const todayAppointments = allAppointments.filter(appt =>
        appt.startTime >= startOfDay(today) && appt.startTime <= endOfDay(today)
    )

    const upcomingAppointments = allAppointments.filter(appt =>
        isAfter(appt.startTime, today) && !todayAppointments.includes(appt)
    )

    // Calculate stats
    const totalAppointmentsToday = todayAppointments.length
    const totalMinutes = todayAppointments.reduce((acc, appt) => {
        const duration = (appt.endTime.getTime() - appt.startTime.getTime()) / (1000 * 60)
        return acc + duration
    }, 0)
    const hoursOccupied = Math.round((totalMinutes / 60) * 10) / 10

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <header className="space-y-1">
                <h1 className="text-4xl font-display font-black tracking-tight text-primary">
                    Panel de Control
                </h1>
                <p className="text-muted-foreground font-medium">
                    Gestiona tus citas y actividad reciente. Hoy es {format(today, "EEEE, d 'de' MMMM", { locale: es })}.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-card border-2 border-primary/5 rounded-[2rem] shadow-sm space-y-4 hover:border-primary/20 transition-all group">
                    <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <CalendarIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black font-display tracking-tight">{totalAppointmentsToday}</p>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Citas hoy</p>
                    </div>
                </div>

                <div className="p-8 bg-card border-2 border-primary/5 rounded-[2rem] shadow-sm space-y-4 hover:border-primary/20 transition-all group">
                    <div className="h-12 w-12 bg-blue-500/5 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black font-display tracking-tight">{allAppointments.length}</p>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Activas</p>
                    </div>
                </div>

                <div className="p-8 bg-card border-2 border-primary/5 rounded-[2rem] shadow-sm space-y-4 hover:border-primary/20 transition-all group">
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
                ) : upcomingAppointments.length === 0 && todayAppointments.length === 0 ? null : (
                    <p className="text-center py-8 text-muted-foreground text-sm font-medium italic">
                        No hay más citas próximas por ahora.
                    </p>
                )}
            </section>
        </div>
    );
}

