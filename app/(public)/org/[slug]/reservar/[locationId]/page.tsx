import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
    User, 
    ArrowRight, 
    ChevronLeft,
    Sparkles,
    Briefcase
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface LocationBookingPageProps {
    params: Promise<{
        slug: string
        locationId: string
    }>
}

export default async function LocationBookingPage({ params }: LocationBookingPageProps) {
    const { slug, locationId } = await params

    const organization = await prisma.organization.findUnique({
        where: { slug },
        include: {
            locations: {
                where: { id: locationId }
            } as any,
            members: {
                include: {
                        user: {
                            include: {
                                profile: true
                            }
                        },
                    locationServices: {
                        where: { locationId }
                    } as any
                }
            }
        } as any
    }) as any

    if (!organization || organization.locations.length === 0) notFound()

    const location = organization.locations[0]
    
    // Filter members who have configured services for this specific location
    const availableMembers = organization.members.filter((member: any) => 
        member.locationServices && member.locationServices.length > 0
    )

    return (
        <div className="min-h-screen bg-background p-6 md:p-12 flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-12">
                <header className="flex flex-col items-center text-center space-y-4">
                    <div className="flex flex-col items-center">
                         <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                            <Briefcase className="h-8 w-8" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary/60 mb-1">
                            {location.name}
                        </h2>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground uppercase italic leading-none">
                            Elige tu Profesional
                        </h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                    {availableMembers.length === 0 ? (
                        <Card className="col-span-full border-none bg-muted/20 rounded-[3rem] py-16 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mb-2">
                                <User className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight">Personal no configurado</h3>
                                <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                                    Parece que no hay profesionales asignados con servicios activos para esta sede todavía. 
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 pt-4">
                                    Tip: Asegúrate de asignar servicios a tus colaboradores en la pestaña de Sedes del Dashboard.
                                </p>
                            </div>
                        </Card>
                    ) : (
                        availableMembers.map((member: any) => (
                            <Card key={member.id} className="relative group h-full overflow-hidden rounded-[2.5rem] bg-card border border-border/40 hover:border-primary/40 transition-all duration-500 shadow-none hover:shadow-2xl hover:shadow-primary/5 flex flex-col items-center text-center p-8">
                                <Link 
                                    href={member.user.profile?.username ? `/${member.user.profile.username}?locationId=${locationId}` : '#'}
                                    className="absolute inset-0 z-10"
                                />
                                <div className="relative h-24 w-24 mb-6">
                                    {member.user.image ? (
                                        <Image
                                            src={member.user.image}
                                            alt={member.user.name || ''}
                                            fill
                                            className="rounded-full object-cover border-2 border-primary/10 group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center text-2xl font-black text-primary border-2 border-primary/10 uppercase">
                                            {member.user.name?.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform duration-500">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-black font-display tracking-tight uppercase group-hover:text-primary transition-colors">
                                    {member.user.name}
                                </h3>
                                <p className="text-muted-foreground font-medium text-sm mt-1 mb-6">
                                    {member.user.profile?.bio?.substring(0, 60)}
                                    {(member.user.profile?.bio?.length || 0) > 60 ? '...' : ''}
                                </p>
                                
                                <Button variant="outline" className="mt-auto w-full rounded-2xl border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    Ver Agenda 
                                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                </Button>
                            </Card>
                        ))
                    )}
                </div>

                <div className="flex justify-center pt-8">
                    <Link href={`/org/${slug}/reservar`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-black uppercase tracking-widest text-xs">
                        <ChevronLeft className="h-4 w-4" />
                        Cambiar sede
                    </Link>
                </div>
            </div>
        </div>
    )
}
