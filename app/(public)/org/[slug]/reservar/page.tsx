import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    MapPin,
    Building2,
    ArrowRight,
    ChevronLeft
} from "lucide-react"
import Link from "next/link"

interface OrgBookingPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function OrgBookingPage({ params }: OrgBookingPageProps) {
    const { slug } = await params

    const organization = await prisma.organization.findUnique({
        where: { slug },
        include: {
            locations: {
                where: { isActive: true }
            }
        } as any
    }) as any

    if (!organization) notFound()

    const locations = organization.locations || []

    if (locations.length === 1) {
        redirect(`/org/${slug}/reservar/${locations[0].id}`)
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-12 flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-12">
                <header className="flex flex-col items-center text-center space-y-4">
                    <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-2 shadow-xl shadow-primary/5">
                        <Building2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground uppercase italic">
                            {organization.name}
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg">
                            Selecciona una sede para continuar con tu reserva
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                    {locations.length === 0 ? (
                        <Card className="col-span-full border-none bg-muted/20 rounded-[3rem] py-16 flex flex-col items-center justify-center text-center space-y-4">
                            <MapPin className="h-12 w-12 text-muted-foreground/30" />
                            <div className="space-y-1">
                                <h3 className="text-xl font-black uppercase tracking-tight">Cerrado Temporalmente</h3>
                                <p className="text-muted-foreground font-medium">No hay sedes activas disponibles en este momento.</p>
                            </div>
                        </Card>
                    ) : (
                        locations.map((loc: any) => (
                            <Link
                                key={loc.id}
                                href={`/org/${slug}/reservar/${loc.id}`}
                                className="group block"
                            >
                                <Card className="h-full overflow-hidden rounded-[2.5rem] bg-card border border-border/40 hover:border-primary/40 transition-all duration-500 shadow-none hover:shadow-2xl hover:shadow-primary/5 flex flex-col">
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                <MapPin className="h-7 w-7" />
                                            </div>
                                            <div className="h-10 w-10 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 group-hover:translate-x-1 transition-all">
                                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                        </div>
                                        <CardTitle className="text-2xl font-black font-display tracking-tight uppercase group-hover:text-primary transition-colors">
                                            {loc.name}
                                        </CardTitle>
                                        <CardDescription className="text-muted-foreground font-medium text-base pt-1">
                                            {loc.city || 'Ubicación'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 mt-auto">
                                        <div className="flex flex-col gap-2">
                                            {loc.address && (
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/10 p-2 rounded-xl border border-border/20">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span className="truncate">{loc.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>

                <div className="flex justify-center pt-8">
                    <Link href={`/org/${organization.slug}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-black uppercase tracking-widest text-xs">
                        <ChevronLeft className="h-4 w-4" />
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}
