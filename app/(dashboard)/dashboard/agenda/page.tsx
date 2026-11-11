import { CalendarView } from "@/components/calendar-view";
import { PageHeader } from "@/components/page-header";
import { getEffectiveProfile } from "@/lib/permissions";
import { CalendarIcon } from "lucide-react";
import { AgendaTour } from "@/components/tours/agenda-tour";
import { DashboardRealtimeUpdater } from "@/components/dashboard-realtime-updater"

export default async function AgendaPage() {
    const profile = await getEffectiveProfile();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <PageHeader
                title="Agenda Profesional"
                icon={CalendarIcon}
                description={<>Organiza tus compromisos, <span className="text-foreground font-bold">{profile.displayName || profile.user.name}</span>. Visualiza y gestiona tu disponibilidad diaria, semanal o mensual con facilidad.</>}
            />

            <div className="w-full">
                <CalendarView profileId={profile.id} organizationId={profile.organizationId || ""} />
                <AgendaTour />
                <DashboardRealtimeUpdater profileId={profile.id} />
            </div>
        </div>
    );
}
