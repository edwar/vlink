import { ConfigurationSettings } from "@/components/configuration-settings";

export default function ConfiguracionPage() {
    return (
        <div className="space-y-4">
            <header className="space-y-2">
                <h1 className="text-4xl font-display font-black tracking-tight text-primary">Configuración</h1>
                <p className="text-lg text-muted-foreground font-medium">Administra tu identidad comercial y los servicios que ofreces.</p>
            </header>

            <ConfigurationSettings />
        </div>
    );
}
