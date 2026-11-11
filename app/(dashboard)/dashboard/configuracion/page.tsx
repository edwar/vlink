import { ConfigurationSettings } from "@/components/configuration-settings";
import { PageHeader } from "@/components/page-header";
import { getEffectiveProfile } from "@/lib/permissions";
import { Hammer } from "lucide-react";
import { ConfiguracionTour } from "@/components/tours/configuracion-tour";

export default async function ConfiguracionPage() {
    const profile = await getEffectiveProfile();

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Configuración"
                icon={Hammer}
                description={<>Estructura tu oferta comercial, <span className="text-foreground font-bold">{profile.displayName || profile.user.name}</span>. Define tus honorarios, duraciones y activa los servicios que tus clientes podrán contratar.</>}
            />

            <ConfigurationSettings />
            <ConfiguracionTour />
        </div>
    );
}
