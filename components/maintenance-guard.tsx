import { getPublicSystemConfig } from "@/app/actions/admin"
import { Construction, Hammer } from "lucide-react"
import { Logo } from "@/components/logo"

export async function MaintenanceGuard({ children }: { children: React.ReactNode }) {
    const config = await getPublicSystemConfig()

    if (config?.maintenanceMode) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10" />

                <div className="space-y-8 max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="h-24 w-24 bg-amber-500/10 rounded-[2.5rem] mx-auto flex items-center justify-center border-2 border-amber-500/20 shadow-xl shadow-amber-500/10 rotate-3">
                        <Construction className="h-12 w-12 text-amber-600 animate-pulse" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">Mantenimiento</h1>
                        <p className="text-muted-foreground font-medium text-lg">
                            Estamos realizando mejoras en nuestra infraestructura para darte un servicio de mayor calidad.
                        </p>
                    </div>

                    <div className="p-4 bg-muted/40 rounded-2xl border-2 border-dashed border-border flex items-center gap-4 text-left">
                        <Hammer className="h-5 w-5 text-primary shrink-0" />
                        <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                            Los agendamientos públicos se encuentran pausados temporalmente. Volveremos muy pronto.
                        </p>
                    </div>

                    <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-center gap-2 grayscale">
                            <span className="text-sm font-display font-black tracking-tighter">VLINK <span className="text-primary italic">CORE</span></span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
