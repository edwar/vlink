import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getUserOrganizations } from "@/app/actions/organization"
import { ConsolidatedAgenda } from "@/components/consolidated-agenda"
import { CalendarRange, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Title } from "@/components/title"

export default async function ConsolidatedAgendaPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/login")

    const organizations = await getUserOrganizations()
    const organization = organizations[0]

    if (!organization) redirect("/dashboard/organizacion")

    // Solo accesible por DUEÑOS o MANAGER en planes TEAM/CORPORATE
    // Pero permitimos verlo si es dueño para invitar a subir de plan si fuera necesario

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pt-10">
            <Link
                href="/dashboard/organizacion"
                className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Volver a Organización
            </Link>

            <header className="relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CalendarRange className="h-24 w-24 text-primary rotate-12" />
                </div>

                <div className="relative z-10 space-y-2">
                    <Title title="Disponibilidad Consolidada" />
                    <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                        Visualiza de un vistazo los huecos libres de todos tus profesionales para coordinar citas de último minuto.
                    </p>
                </div>
            </header>

            {organization.subscriptionPlan === "BASIC" ? (
                <div className="p-12 bg-amber-500/5 border-2 border-dashed border-amber-500/20 rounded-lg flex flex-col items-center text-center gap-6">
                    <div className="h-20 w-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600">
                        <CalendarRange className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black font-display tracking-tight">Función de Plan Equipos</h3>
                        <p className="text-muted-foreground max-w-md mx-auto font-medium">
                            La vista consolidada de agenda está disponible para organizaciones con múltiples profesionales. Sube de plan para ver la disponibilidad de todo tu equipo en una sola pantalla.
                        </p>
                    </div>
                    <Link href="/dashboard/organizacion/planes">
                        <button className="px-8 h-12 bg-amber-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-none hover:scale-105 active:scale-95 transition-all">
                            Ver Planes
                        </button>
                    </Link>
                </div>
            ) : (
                <ConsolidatedAgenda
                    orgSlug={organization.slug}
                    locations={organization.locations}
                />
            )}
        </div>
    )
}
