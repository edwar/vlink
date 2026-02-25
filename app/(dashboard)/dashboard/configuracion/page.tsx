import { ConfigurationSettings } from "@/components/configuration-settings";

export default function ConfiguracionPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-display font-bold text-primary">Configuración</h1>
                <p className="text-muted-foreground">Administra tu nombre y los servicios que ofreces.</p>
            </header>

            <ConfigurationSettings />
        </div>
    );
}
