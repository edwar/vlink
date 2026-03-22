import { AvailabilityManagement } from "@/components/availability-management";
import { Title } from "@/components/title";
import { getEffectiveProfile } from "@/lib/permissions";
import { Clock } from "lucide-react";
import { DisponibilidadTour } from "@/components/tours/disponibilidad-tour";

export default async function DisponibilidadPage() {
    const profile = await getEffectiveProfile();

    return (
        <div className="space-y-6 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-8 px-4 sm:px-0">
            <header className="relative py-6 sm:py-8 rounded-3xl bg-surface/50 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 sm:opacity-10">
                    <Clock className="h-24 w-24 text-primary rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
                    <div className="space-y-2">
                        <Title title="Disponibilidad" />
                        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                            Define tus reglas de tiempo, <span className="text-foreground font-bold">{profile.displayName || profile.user.name}</span>. Configura horarios regulares, bloqueos específicos y excepciones para un control total.
                        </p>
                    </div>
                </div>
            </header>

            <div className="w-full">
                <AvailabilityManagement />
                <DisponibilidadTour />
            </div>
        </div>
    );
}
