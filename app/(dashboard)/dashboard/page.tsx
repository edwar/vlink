export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-display font-bold text-primary">Bienvenida de nuevo</h1>
                <p className="text-muted-foreground">Aquí tienes un resumen de tu agenda para hoy.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-card border rounded-xl space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Citas hoy</span>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="p-6 bg-card border rounded-xl space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Nuevas solicitudes</span>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="p-6 bg-card border rounded-xl space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Horas ocupadas</span>
                    <p className="text-3xl font-bold">0h</p>
                </div>
            </div>

            <div className="p-6 bg-card border rounded-xl min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-2">
                    <p className="text-muted-foreground italic">Empieza a configurar tu disponibilidad para recibir citas.</p>
                </div>
            </div>
        </div>
    );
}
