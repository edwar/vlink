import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { getUserOrganizations } from "@/app/actions/organization"
import { InviteMember } from "@/components/invite-member"
import { CreateOrganization } from "@/components/create-organization"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Building2, UserCircle, Briefcase, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"
import { CopyLink } from "@/components/copy-link"
import { ToggleOrgVisibility } from "@/components/toggle-org-visibility"
import { RenameOrganization } from "@/components/rename-organization"
import { OrgQRCode } from "@/components/org-qr-code"
import { OrgBusinessCard } from "@/components/org-business-card"

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

    const currentUserMember = members.find(m => m.userId === session.user.id)
    const currentUserRole = currentUserMember?.role
    const isOwnerOrManager = currentUserRole === "OWNER" || currentUserRole === "MANAGER"

    const ROLE_LABELS: Record<string, string> = {
        OWNER: "Propietario",
        ADMIN: "Administrador",
        PROFESSIONAL: "Profesional",
        MANAGER: "Gestor"
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <header className="relative p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background border-2 border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Building2 className="h-24 w-24 text-primary rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            <Building2 className="h-3 w-3" />
                            Gestión Corporativa
                        </div>
                        {isOwnerOrManager ? (
                            <RenameOrganization
                                organizationId={organization.id}
                                currentName={organization.name}
                            />
                        ) : (
                            <h1 className="text-5xl font-display font-black tracking-tighter text-primary uppercase">
                                {organization.name}
                            </h1>
                        )}
                        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                            Administra tu equipo de profesionales, coordina agendas compartidas y escala tu negocio centralizadamente.
                        </p>
                    </div>
                    <div className="px-6 py-3 bg-card/60 backdrop-blur border border-primary/10 rounded-2xl shadow-sm inline-flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tu Rol</p>
                            <p className="text-sm font-black text-foreground">{currentUserRole ? ROLE_LABELS[currentUserRole] : "Miembro"}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Section: Marketing and Resources */}
            <div className="space-y-10 relative">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-8 w-1 bg-blue-500/40 rounded-full" />
                    <h2 className="text-3xl font-display font-black tracking-tight text-foreground">Marketing & Recursos</h2>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                    {/* QR Code Column */}
                    <div className="xl:col-span-4 lg:col-span-5 space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">QR Inteligente</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Descarga el QR base o compártelo al instante con tus clientes en redes sociales.
                            </p>
                        </div>
                        <div className="p-1 rounded-[2rem] bg-linear-to-b from-primary/10 to-transparent">
                            <div className="bg-card/80 backdrop-blur-xl border border-primary/5 rounded-[1.8rem] p-6 shadow-xl shadow-primary/5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Código QR</p>
                                        <p className="text-sm font-black text-foreground">Página pública</p>
                                    </div>
                                </div>
                                <OrgQRCode
                                    orgName={organization.name}
                                    orgSlug={organization.slug}
                                    appUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Card Column */}
                    <div className="xl:col-span-8 lg:col-span-7 space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Tarjeta de Presentación</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                                Previsualiza y descarga en alta resolución (SVG) tu tarjeta de presentación oficial lista para enviar a la imprenta.
                            </p>
                        </div>
                        <OrgBusinessCard
                            orgName={organization.name}
                            orgSlug={organization.slug}
                            appUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-16 pt-12 mt-12 border-t-2 border-border/50">
                {/* Miembros / Mi Equipo */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="flex flex-col gap-4 items-start md:gap-0 md:flex-row md:items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1 bg-primary rounded-full" />
                            <h2 className="text-3xl font-display font-black tracking-tight">Mi Equipo</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20 shadow-sm shadow-primary/5">
                                {members.length} Profesionales
                            </span>
                            <a
                                href={`/org/${organization.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-1.5 bg-accent text-foreground text-[10px] font-black uppercase tracking-widest rounded-full border border-border hover:border-primary/30 hover:text-primary transition-colors flex items-center gap-1.5"
                            >
                                <Globe className="h-3 w-3" />
                                Ver página pública
                            </a>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {members.map((member) => (
                            <div key={member.id} className="p-1 rounded-xl bg-linear-to-r from-primary/5 to-transparent hover:from-primary/10 transition-colors duration-500">
                                <Card className="bg-card/60 backdrop-blur-xl border border-primary/5 rounded-xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <CardContent className="p-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center px-6 py-6 gap-2 sm:gap-3 relative">
                                            <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 transition-all group-hover:scale-105 duration-500">
                                                <UserAvatar
                                                    image={member.user.image}
                                                    name={member.user.name}
                                                    className="h-full w-full rounded-2xl shadow-lg border-2 border-background ring-4 ring-primary/5 group-hover:ring-primary/10"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight truncate text-foreground/90">{member.user.name}</h3>
                                                    {member.role === "OWNER" && (
                                                        <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner">
                                                            <Shield className="h-3.5 w-3.5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
                                                    <p className="text-sm text-muted-foreground font-bold truncate flex items-center gap-2">
                                                        <UserCircle className="h-3.5 w-3.5 opacity-50 shrink-0" />
                                                        <span className="truncate">{member.user.email}</span>
                                                    </p>
                                                    {member.user.profile?.username && (
                                                        <div className="flex items-center gap-2 max-w-full overflow-hidden">
                                                            <div className="hidden sm:block h-3 w-px bg-border/50 shrink-0" />
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <p className="text-[10px] font-black text-primary flex items-center gap-1.5 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10 min-w-0">
                                                                    <Briefcase className="h-3 w-3 shrink-0" />
                                                                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                                                                        {process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '')}/{member.user.profile.username}
                                                                    </span>
                                                                </p>
                                                                <CopyLink url={`${process.env.NEXT_PUBLIC_APP_URL}/${member.user.profile.username}`} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Visibility toggle + Role badge */}
                                            <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 absolute -top-1 -right-2 lg:relative lg:top-0 lg:right-0">
                                                <span className={cn(
                                                    "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                    member.role === "OWNER" ? "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/5" :
                                                        member.role === "MANAGER" ? "bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/5" :
                                                            "bg-green-500/10 text-green-600 border-green-500/20 shadow-green-500/5"
                                                )}>
                                                    {ROLE_LABELS[member.role]}
                                                </span>
                                                {/* OWNER and MANAGER can toggle visibility of any member */}
                                                {isOwnerOrManager && member.user.profile && (
                                                    <ToggleOrgVisibility
                                                        initialValue={member.user.profile.showOnOrgPage ?? true}
                                                        targetUserId={member.userId}
                                                        memberName={member.user.name}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lateral: Invitaciones */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-8 w-1 bg-muted-foreground/30 rounded-full" />
                        <h2 className="text-3xl font-display font-black tracking-tight text-muted-foreground">Crecer / Equipo</h2>
                    </div>

                    <InviteMember
                        organizationId={organization.id}
                        disabled={currentUserRole !== "OWNER"}
                    />
                </div>
            </div>
        </div>
    )
}
