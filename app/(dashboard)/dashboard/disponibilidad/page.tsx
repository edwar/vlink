import { AvailabilityManagement } from "@/components/availability-management";
import { PageHeader } from "@/components/page-header";
import { getEffectiveProfile } from "@/lib/permissions";
import { Clock } from "lucide-react";
import { DisponibilidadTour } from "@/components/tours/disponibilidad-tour";

export default async function DisponibilidadPage() {
    const profile = await getEffectiveProfile();

    return (
        <div className="space-y-6 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-2 px-4 sm:px-0">
            <PageHeader
                title="Disponibilidad"
                icon={Clock}
                description={<>Define tus reglas de tiempo, <span className="text-foreground font-bold">{profile.displayName || profile.user.name}</span>. Configura horarios regulares, bloqueos específicos y excepciones para un control total.</>}
            />

            <div className="w-full">
                <AvailabilityManagement />
                <DisponibilidadTour />
            </div>
        </div>
    );
}
