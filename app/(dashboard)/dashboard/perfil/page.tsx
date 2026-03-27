import { ProfileSettings } from "@/components/profile-settings";
import { Title } from "@/components/title";
import { getEffectiveProfile } from "@/lib/permissions";
import { UserCircle } from "lucide-react";
import { PerfilTour } from "@/components/tours/perfil-tour";

export default async function PerfilPage() {
    const profile = await getEffectiveProfile();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="relative py-8 rounded-3xl bg-surface/50 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <UserCircle className="h-24 w-24 text-primary rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <Title title="Mi Perfil" />
                        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                            Gestiona tu marca personal, <span className="text-foreground font-bold">{profile.displayName || profile.user.name}</span>. Personaliza tu biografía y sincroniza tus servicios con tu calendario de Google.
                        </p>
                    </div>
                </div>
            </header>

            <ProfileSettings />
            <PerfilTour />
        </div>
    );
}
