import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { getUserOrganizations } from "@/app/actions/organization"
import { InviteMember } from "@/components/invite-member"
import { CreateOrganization } from "@/components/create-organization"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Building2, UserCircle, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function OrganizacionPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return null

    const organizations = await getUserOrganizations()

    // For now, let's assume the user is only in ONE organization or NONE.
    // If they have none, we should show a way to create one.
    const organization = organizations[0]

    if (!organization) {
        return (
            <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-2xl mx-auto">
                <header className="text-center space-y-2">
                    <h1 className="text-4xl font-display font-black tracking-tight text-primary uppercase">Equipo y Organización</h1>
                    <p className="text-muted-foreground font-medium">Gestiona tu equipo y sus agendas centralizadas.</p>
                </header>

                <CreateOrganization />
            </div>
        )
    }

    // Fetch members of the organization
    const members = await prisma.member.findMany({
        where: { organizationId: organization.id },
        include: {
            user: {
                include: {
                    profile: true
                }
            }
        },
        orderBy: { role: 'asc' }
    })

    const currentUserRole = members.find(m => m.userId === session.user.id)?.role

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-2xl">
                            <Building2 className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-4xl font-display font-black tracking-tight text-primary uppercase">{organization.name}</h1>
                    </div>
                    <p className="text-muted-foreground font-medium pl-1">
                        Gestionando equipo y agendas compartidas.
                    </p>
                </div>
                <div className="px-4 py-2 bg-muted/50 rounded-xl border border-border inline-flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">Tu Rol: {currentUserRole}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Miembros / Mi Equipo */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-2xl font-display font-black tracking-tight flex items-center gap-3">
                            <Users className="h-6 w-6 text-primary" />
                            Mi Equipo
                        </h2>
                        <span className="px-4 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                            {members.length} Miembros
                        </span>
                    </div>

                    <div className="grid gap-4">
                        {members.map((member) => (
                            <Card key={member.id} className="border-2 hover:border-primary/20 transition-all overflow-hidden group">
                                <CardContent className="p-0">
                                    <div className="flex items-center p-5 gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/5 transition-colors">
                                            {member.user.image ? (
                                                <img src={member.user.image} alt={member.user.name} className="h-full w-full rounded-2xl object-cover" />
                                            ) : (
                                                <UserCircle className="h-8 w-8" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-lg font-black font-display tracking-tight truncate">{member.user.name}</h3>
                                                {member.role === "OWNER" && <Shield className="h-3.5 w-3.5 text-amber-500" />}
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium truncate">{member.user.email}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                member.role === "OWNER" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                                    member.role === "MANAGER" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                        "bg-green-500/10 text-green-600 border-green-500/20"
                                            )}>
                                                {member.role}
                                            </span>
                                            {member.user.profile?.username && (
                                                <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <Briefcase className="h-3 w-3" />
                                                    vlink.app/{member.user.profile.username}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Lateral: Invitaciones */}
                <div className="space-y-6">
                    {(currentUserRole === "OWNER" || currentUserRole === "ADMIN") && (
                        <InviteMember organizationId={organization.id} />
                    )}
                </div>
            </div>
        </div>
    )
}
