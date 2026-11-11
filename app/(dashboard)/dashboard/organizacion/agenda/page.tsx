import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getUserOrganizations } from "@/app/actions/organization"
import { ConsolidatedAgenda } from "@/components/consolidated-agenda"
import { CalendarRange, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header";

export default async function ConsolidatedAgendaPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/login")

    const organizations = await getUserOrganizations()
    const organization = organizations[0]

    if (!organization) redirect("/dashboard/organizacion")

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pt-10">
            <Link
                href="/dashboard/organizacion"
                className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Volver a Organización
            </Link>

            <PageHeader
                title="Disponibilidad Consolidada"
                icon={CalendarRange}
                description={<>Visualiza de un vistazo los huecos libres de todos tus profesionales para coordinar citas de último minuto.</>}
            />

            <ConsolidatedAgenda
                orgSlug={organization.slug}
                locations={organization.locations}
            />
        </div>
    )
}
