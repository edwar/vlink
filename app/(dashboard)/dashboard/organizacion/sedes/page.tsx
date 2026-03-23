import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    MapPin,
    Plus,
    Settings2,
    Trash2,
    Building2,
    Phone,
    Users,
    ArrowRight,
    MapPinned,
    AlertCircle
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { LocationForm } from "@/components/location-form"
import { LocationMembersConfig } from "@/components/location-members-config"
import { LocationTeamList } from "@/components/location-team-list"
import { revalidatePath } from "next/cache"
import { deleteLocation, getMemberServicesByLocation } from "@/app/actions/locations"
import { sileo } from "sileo"

export default async function SedesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/login")

    const organization = await prisma.organization.findFirst({
        where: {
            members: {
                some: { userId: session.user.id }
            }
        },
        include: {
            locations: {
                orderBy: { createdAt: 'asc' }
            },
            members: {
                where: {
                    user: {
                        profile: {
                            showOnOrgPage: true
                        }
                    }
                },
                include: {
                    user: {
                        include: {
                            profile: {
                                include: {
                                    services: true
                                }
                            }
                        }
                    },
                    locationServices: {
                        where: { isActive: true }
                    }
                }
            }
        } as any
    }) as any

    if (!organization) redirect("/dashboard")
    
    const currentUserMember = organization.members.find((m: any) => m.userId === session.user.id);
    const currentUserRole = currentUserMember?.role || "PROFESSIONAL";
    const canManageAll = currentUserRole === "OWNER" || currentUserRole === "MANAGER";

    // Get plan config to check limits
    const planConfig = await prisma.planConfig.findUnique({
        where: { id: organization.subscriptionPlan as any }
    })

    const maxLocations = (planConfig as any)?.maxLocations ?? 1 // Default to 1 if not found
    const currentLocationsCount = organization.locations.length
    const canAddLocation = maxLocations === 0 || currentLocationsCount < maxLocations

    return (
        <div className="space-y-8 animate-in fade-in duration-700 py-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-display font-black tracking-tight text-foreground uppercase">Sedes y Sucursales</h1>
                    <p className="text-muted-foreground font-medium">Gestiona los puntos físicos donde prestas tus servicios.</p>
                </div>
                
                {canManageAll && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                disabled={!canAddLocation}
                                variant="vlink"
                                className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs flex items-center gap-2 group shadow-xl shadow-primary/20"
                            >
                                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                                Agregar Nueva Sede
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] border-none rounded-[2.5rem] p-0 overflow-hidden bg-card shadow-2xl">
                            <DialogHeader className="p-8 pb-0">
                                <DialogTitle className="text-3xl font-black font-display tracking-tight uppercase">Nueva Sede</DialogTitle>
                                <DialogDescription className="text-muted-foreground font-medium pt-2">
                                    Ingresa los detalles de tu nueva ubicación física.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-8">
                                <LocationForm organizationId={organization.id} />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Plan Limit Alert */}
            {!canAddLocation && maxLocations !== 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-4 flex items-start gap-4 animate-in slide-in-from-top duration-500">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Límite de Sedes Alcanzado</p>
                        <p className="text-sm text-amber-800/80 font-medium">
                            Tu plan actual ({organization.subscriptionPlan}) permite un máximo de {maxLocations} sedes.
                            Considera mejorar tu plan para agregar más ubicaciones.
                        </p>
                    </div>
                </div>
            )}

            <div id="tour-org-sedes" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organization.locations.length === 0 ? (
                    <Card className="col-span-full border-2 border-dashed border-border/40 bg-muted/5 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center space-y-4 shadow-none">
                        <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center text-muted-foreground">
                            <MapPinned className="h-10 w-10" />
                        </div>
                        <div className="max-w-md space-y-2">
                            <h3 className="text-2xl font-black font-display tracking-tight uppercase">No has creado sedes aun</h3>
                            <p className="text-muted-foreground font-medium">
                                Las sedes te permiten organizar mejor a tu equipo y sus horarios si trabajas en múltiples ubicaciones.
                            </p>
                        </div>
                    </Card>
                ) : (
                    (organization.locations as any[]).map((loc) => (
                        <Card key={loc.id} className="group overflow-hidden rounded-[2.5rem] bg-card border border-border/40 hover:border-primary/30 transition-all duration-500 shadow-none hover:shadow-2xl hover:shadow-primary/5">
                            <CardHeader className="p-6 pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-500">
                                        <Building2 className="h-7 w-7" />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {canManageAll && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted/50">
                                                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[500px] border-none rounded-[2.5rem] p-0 overflow-hidden bg-card">
                                                    <DialogHeader className="p-8 pb-0">
                                                        <DialogTitle className="text-3xl font-black font-display tracking-tight uppercase">Editar Sede</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="p-8">
                                                        <LocationForm
                                                            organizationId={organization.id}
                                                            initialData={{
                                                                id: loc.id,
                                                                name: loc.name,
                                                                address: loc.address,
                                                                city: loc.city,
                                                                phone: loc.phone
                                                            }}
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-black font-display tracking-tight uppercase group-hover:text-primary transition-colors duration-300">
                                    {loc.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1.5 font-medium">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    {loc.city ? `${loc.city}` : 'Ubicación'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-4 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/20">
                                        <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-foreground/80">
                                            {loc.phone || "No especificado"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/20">
                                        <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-foreground/80 truncate">
                                            {loc.address || "Sin dirección"}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-border/40">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Configuración de Equipo</h4>

                                    <LocationTeamList 
                                        members={(organization as any).members.filter((m: any) => canManageAll || m.userId === session.user.id)}
                                        locationId={loc.id}
                                        locationName={loc.name}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}


