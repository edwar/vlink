import { CalendarView } from "@/components/calendar-view";
import { Title } from "@/components/title";
import { getEffectiveProfile } from "@/lib/permissions";
import { CalendarIcon } from "lucide-react";
import { AgendaTour } from "@/components/tours/agenda-tour";
import { DashboardRealtimeUpdater } from "@/components/dashboard-realtime-updater"

export default async function AgendaPage() {
    const profile = await getEffectiveProfile();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <header className="relative py-6 sm:py-8 rounded-3xl bg-surface/50 border border-border/40 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 sm:opacity-10">
                    <CalendarIcon className="h-24 w-24 text-primary rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            <CalendarIcon className="h-3 w-3" />
                            Gestión de Tiempo
                        </div>
                        <Title title="Agenda Profesional" />
                        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                            Organiza tus compromisos, <span className="text-foreground font-bold">{profile.displayName || profile.user.name}</span>. Visualiza y gestiona tu disponibilidad diaria, semanal o mensual con facilidad.
                        </p>
                    </div>
                </div>
            </header>

            <div className="w-full">
                <CalendarView profileId={profile.id} />
                <AgendaTour />
                <DashboardRealtimeUpdater profileId={profile.id} />
            </div>
        </div>
    );
}
