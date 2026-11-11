import { ProfileSettings } from "@/components/profile-settings";
import { PageHeader } from "@/components/page-header";
import { BrandingInfoCard } from "@/components/branding-info-card";
import { getEffectiveProfile } from "@/lib/permissions";
import { UserCircle } from "lucide-react";
import { PerfilTour } from "@/components/tours/perfil-tour";

export default async function PerfilPage() {
    const profile = await getEffectiveProfile();

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Mi Perfil"
                icon={UserCircle}
                description={<>Gestiona tu marca personal, <span className="text-foreground font-bold">{profile.displayName || profile.user.name}</span>. Personaliza tu biografía y sincroniza tus servicios con tu calendario de Google.</>}
            />

            <ProfileSettings />
            {!profile.organizationId && (
                <BrandingInfoCard removedUntil={profile.brandingRemovedUntil} scope="perfil" />
            )}
            <PerfilTour />
        </div>
    );
}
