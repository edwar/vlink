import { CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, Settings2, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPlanConfigs, updatePlanConfig } from "@/app/actions/admin"
import { PlanFeaturesEditor } from "./plan-features-editor"
import { AdminEmptyState } from "@/components/admin/admin-empty-state"

export default async function AdminPlans() {
    const plansInfo = await getPlanConfigs()

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-display font-black tracking-tight text-foreground uppercase">Planes y Precios</h1>
                    <p className="text-muted-foreground font-medium">Configuración de los niveles de suscripción del SaaS.</p>
                </div>
            </header>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
                {plansInfo.length === 0 ? (
                    <div className="lg:col-span-3">
                        <AdminEmptyState
                            title="No hay planes configurados"
                            description="No se encontraron configuraciones de planes de suscripción en el sistema."
                            icon={CreditCard}
                        />
                    </div>
                ) : (
                    plansInfo.map((p) => (
                        <Card key={p.id} className="border-none shadow-xl shadow-primary/5 bg-card flex flex-col pt-4">
                            <CardHeader className="text-center pb-2">
                                <div className={`h-16 w-16 mx-auto rounded-3xl flex items-center justify-center mb-4 ${p.id === 'FREE' ? 'bg-zinc-100 text-zinc-500' :
                                    p.id === 'TEAM' ? 'bg-blue-100 text-blue-500' : 'bg-primary/10 text-primary'
                                    }`}>
                                    <CreditCard className="h-8 w-8" />
                                </div>
                                <CardTitle className="text-2xl font-black font-display tracking-tight">{p.id}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-6 flex flex-col">
                                <form action={async (formData: FormData) => {
                                    "use server"
                                    const price = formData.get("price") as string
                                    const limit = formData.get("limit") as string
                                    const maxSeats = Number(formData.get("maxSeats"))
                                    const featuresString = formData.get("features") as string
                                    const features = featuresString.split(',').map(f => f.trim()).filter(Boolean)

                                    await updatePlanConfig(p.id, {
                                        price,
                                        limit,
                                        maxSeats,
                                        features
                                    })
                                }} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Precio Visible</label>
                                        <input
                                            name="price"
                                            defaultValue={p.price}
                                            className="w-full bg-muted/40 border-none rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Límite Visible</label>
                                        <input
                                            name="limit"
                                            defaultValue={p.limit}
                                            className="w-full bg-muted/40 border-none rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Límite Técnico (Max Miembros, 0 = Ilimitado)</label>
                                        <input
                                            name="maxSeats"
                                            type="number"
                                            defaultValue={p.maxSeats}
                                            className="w-full bg-muted/40 border-none rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <PlanFeaturesEditor initialFeatures={p.features} />

                                    <div className="pt-6 border-t border-border/50">
                                        <Button variant="vlink" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                            <Save className="h-4 w-4" /> Guardar Plan
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Card className="bg-amber-500/5 border-2 border-dashed border-amber-500/20 rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="h-20 w-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                        <AlertTriangle className="h-10 w-10" />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-black font-display tracking-tight">Zona de Peligro Administrativo</h3>
                        <p className="text-muted-foreground font-medium">
                            Los cambios realizados aquí afectan directamente el comportamiento de la facturación de Mercado Pago. No agregues planes nuevos sin verificar primero la configuración del SDK.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
