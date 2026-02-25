import { AvailabilityManagement } from "@/components/availability-management";

export default function DisponibilidadPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-display font-bold text-primary">Disponibilidad</h1>
                <p className="text-muted-foreground">Configura cuándo quieres que tus clientes puedan agendar citas contigo.</p>
            </header>

            <AvailabilityManagement />
        </div>
    );
}
