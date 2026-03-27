import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Building2, MapPin, ArrowRight, User, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface OrgPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function OrgPublicPage({ params }: OrgPageProps) {
    const { slug } = await params

    const organization = await prisma.organization.findUnique({
        where: { slug },
        include: {
            locations: {
                where: { isActive: true }
            },
            members: {
                include: {
                    user: {
                        include: {
                            profile: true
                        }
                    }
                }
            }
        } as any
    }) as any

    if (!organization) notFound()

    const locations = organization.locations || []
    const members = (organization.members || []).filter((member: any) => {
        // Only show members who are set to be visible on the organization page
        // Default to true if the profile or setting doesn't exist yet
        return member.user.profile?.showOnOrgPage !== false;
    })

    return (
        <div className="min-h-screen bg-background p-6 md:p-12 flex flex-col items-center">
            <div className="w-full max-w-5xl space-y-16">
                <header className="flex flex-col items-center text-center space-y-6">
                    <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-2 shadow-2xl shadow-primary/10">
                        <Building2 className="h-12 w-12" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight text-foreground uppercase italic leading-none">
                            {organization.name}
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                            Bienvenido a nuestra plataforma de agendamiento. Elige una sede o un profesional para comenzar.
                        </p>
                    </div>
                </header>

                <div className="space-y-10">
                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                        <h2 className="text-2xl font-black font-display tracking-tight uppercase italic flex items-center gap-2">
                            <MapPin className="h-6 w-6 text-primary" />
                            Nuestras Sedes
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {locations.length === 0 ? (
                            <p className="text-muted-foreground italic col-span-full text-center py-10 bg-muted/10 rounded-3xl border border-dashed">No hay sedes públicas listadas todavía.</p>
                        ) : (
                            locations.map((loc: any) => (
                                <Link key={loc.id} href={`/org/${slug}/reservar/${loc.id}`} className="group">
                                    <Card className="h-full rounded-[2rem] bg-card border border-border/40 hover:border-primary/30 transition-all duration-500 shadow-none hover:shadow-2xl hover:shadow-primary/5 p-6 space-y-4">
                                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black font-display tracking-tight uppercase group-hover:text-primary transition-colors">{loc.name}</h3>
                                            <p className="text-muted-foreground font-medium text-sm">{loc.address}, {loc.city}</p>
                                        </div>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                        <h2 className="text-2xl font-black font-display tracking-tight uppercase italic flex items-center gap-2">
                            <User className="h-6 w-6 text-primary" />
                            Nuestro Equipo
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {members.map((member: any) => (
                            <Link key={member.id} href={member.user.profile?.username ? `/${member.user.profile.username}` : '#'} className="group flex flex-col items-center text-center space-y-4">
                                <div className="relative h-24 w-24">
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
                                </div>
                                <div>
                                    <h3 className="font-black font-display tracking-tight uppercase text-sm group-hover:text-primary transition-colors">
                                        {member.user.profile?.displayName || member.user.name}
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{member.role}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
