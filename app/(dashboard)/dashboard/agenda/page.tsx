import { CalendarView } from "@/components/calendar-view";

export default function AgendaPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-display font-bold text-primary">Tu Agenda</h1>
                <p className="text-muted-foreground">Gestiona tus citas y disponibilidad con diferentes vistas: diaria, semanal y mensual.</p>
            </header>

            <CalendarView />
        </div>
    );
}
