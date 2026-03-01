import { ConfigurationSettings } from "@/components/configuration-settings";
import { Title } from "@/components/title";
import { getEffectiveProfile } from "@/lib/permissions";
import { Hammer } from "lucide-react";

export default async function ConfiguracionPage() {
    const profile = await getEffectiveProfile();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <header className="relative p-8 rounded-3xl bg-linear-to-br from-primary/10 via-background to-background border-2 border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Hammer className="h-24 w-24 text-primary rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            <Hammer className="h-3 w-3" />
                            Ingeniería de Servicios
                        </div>
                        <Title title="Configuración" />
                        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                            Estructura tu oferta comercial, <span className="text-foreground font-bold">{profile.displayName || profile.user.name}</span>. Define tus honorarios, duraciones y activa los servicios que tus clientes podrán contratar.
                        </p>
                    </div>
                </div>
            </header>

            <ConfigurationSettings />
        </div>
    );
}
