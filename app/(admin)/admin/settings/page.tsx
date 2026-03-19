import { getSystemConfig } from "@/app/actions/admin"
import { Megaphone, Save, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateSystemConfig } from "@/app/actions/admin"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function AdminSettings() {
    const config = await getSystemConfig()

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-display font-black tracking-tight text-foreground uppercase">Configuración Global</h1>
                <p className="text-muted-foreground font-medium">Control maestro de la plataforma y comunicaciones globales.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Modo Mantenimiento */}
                <Card className="bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 shadow-none bg-card rounded-2xl">
                    <CardHeader className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black font-display tracking-tight">Modo Mantenimiento</CardTitle>
                                <CardDescription className="font-medium">Detiene todos los agendamientos públicos.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-6">
                        <div className="p-4 bg-muted/40 rounded-2xl flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold">Estado Actual</p>
                                <p className={`text-xs font-black uppercase tracking-widest ${config.maintenanceMode ? 'text-red-500' : 'text-green-500'}`}>
                                    {config.maintenanceMode ? 'Activado (Modo Lectura)' : 'Desactivado (Operativo)'}
                                </p>
                            </div>
                            <form action={async () => {
                                "use server"
                                await updateSystemConfig({ maintenanceMode: !config.maintenanceMode })
                            }}>
                                <Button
                                    variant={config.maintenanceMode ? "default" : "destructive"}
                                    className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6"
                                >
                                    {config.maintenanceMode ? 'Desactivar' : 'Activar'}
                                </Button>
                            </form>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium italic">
                            * Nota: Los administradores aún podrán acceder al dashboard, pero los enlaces públicos mostrarán una pantalla de mantenimiento.
                        </p>
                    </CardContent>
                </Card>

                {/* Comunicaciones Globales (Banners) */}
                <Card className="bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 shadow-none bg-card rounded-2xl">
                    <CardHeader className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                <Megaphone className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black font-display tracking-tight">Anuncios del Sistema</CardTitle>
                                <CardDescription className="font-medium">Mensajes visibles para todos los profesionales en su dashboard.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <form action={async (formData: FormData) => {
                            "use server"
                            const title = formData.get("title") as string
                            const body = formData.get("body") as string
                            const type = formData.get("type") as string
                            await updateSystemConfig({
                                announcementTitle: title,
                                announcementBody: body,
                                announcementType: type
                            })
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Título del Anuncio</label>
                                <input
                                    name="title"
                                    defaultValue={config.announcementTitle || ''}
                                    className="w-full bg-muted/40 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="Ej: Mantenimiento programado para el domingo"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cuerpo del Mensaje</label>
                                <textarea
                                    name="body"
                                    defaultValue={config.announcementBody || ''}
                                    className="w-full bg-muted/40 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                                    placeholder="Detalles del anuncio..."
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="space-y-2 flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo</label>
                                    <Select name="type" defaultValue={config.announcementType}>
                                        <SelectTrigger className="w-full bg-muted/40 border-none rounded-xl h-12 px-4 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all">
                                            <SelectValue placeholder="Tipo" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="rounded-2xl border-2 border-primary/10 bg-card/95 backdrop-blur-xl">
                                            <SelectItem value="INFO" className="rounded-xl focus:bg-primary/10 focus:text-primary">Información</SelectItem>
                                            <SelectItem value="SUCCESS" className="rounded-xl focus:bg-primary/10 focus:text-primary">Novedad</SelectItem>
                                            <SelectItem value="WARNING" className="rounded-xl focus:bg-primary/10 focus:text-primary">Advertencia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="pt-4">
                                    <Button className="font-black uppercase tracking-widest text-[10px] px-8 flex items-center gap-2">
                                        <Save className="h-4 w-4" /> Guardar
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Wompi Marketplace Settings */}
                <Card className="bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 shadow-none bg-card rounded-2xl">
                    <CardHeader className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black font-display tracking-tight">Wompi Marketplace</CardTitle>
                                <CardDescription className="font-medium">Habilita la creación de subcuentas para profesionales.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-6">
                        <div className="p-4 bg-muted/40 rounded-2xl flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold">Estado del Rol</p>
                                <p className={`text-xs font-black uppercase tracking-widest ${config.wompiMarketplaceEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {config.wompiMarketplaceEnabled ? 'Activado (Rol Maestra Activo)' : 'Desactivado (Rol Pendiente)'}
                                </p>
                            </div>
                            <form action={async () => {
                                "use server"
                                await updateSystemConfig({ wompiMarketplaceEnabled: !config.wompiMarketplaceEnabled })
                            }}>
                                <Button
                                    variant={config.wompiMarketplaceEnabled ? "outline" : "default"}
                                    className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6"
                                >
                                    {config.wompiMarketplaceEnabled ? 'Inhabilitar' : 'Habilitar'}
                                </Button>
                            </form>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                            ⚠️ NOTA: Solo activa esto una vez que Wompi haya confirmado que tu cuenta es "Maestra". Si se activa antes, las solicitudes de creación de subcuentas fallarán.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
