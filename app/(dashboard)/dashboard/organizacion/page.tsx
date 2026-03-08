import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { getUserOrganizations } from "@/app/actions/organization"
import { InviteMember } from "@/components/invite-member"
import { CreateOrganization } from "@/components/create-organization"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Building2, UserCircle, Briefcase, Globe, IdCard, CalendarRange, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"
import { CopyLink } from "@/components/copy-link"
import { ToggleOrgVisibility } from "@/components/toggle-org-visibility"
import { RenameOrganization } from "@/components/rename-organization"
import { OrgQRCode } from "@/components/org-qr-code"
import { OrgBusinessCard } from "@/components/org-business-card"
import { LeaveOrganization } from "@/components/leave-organization"
import { CloseOrganization } from "@/components/close-organization"
import { TransferOwnership } from "@/components/transfer-ownership"
import { ChangeMemberRole } from "@/components/change-member-role"
import { RemoveMember } from "@/components/remove-member"

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

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/org/${organization.slug}`

    const planConfig = await prisma.planConfig.findUnique({
        where: { id: organization.subscriptionPlan }
    })
    const maxSeats = planConfig?.maxSeats ?? 0;

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
        orderBy: [
            { role: 'asc' },
            { createdAt: 'asc' }
        ]
    })
    const sortedMembers = [...members].sort((a, b) => {
        const roleOrder = { "OWNER": 0, "MANAGER": 1, "PROFESSIONAL": 2 };
        const aVal = roleOrder[a.role as keyof typeof roleOrder] ?? 99;
        const bVal = roleOrder[b.role as keyof typeof roleOrder] ?? 99;
        if (aVal !== bVal) return aVal - bVal;
        return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const currentUserMember = members.find(m => m.userId === session.user.id)
    const currentUserRole = currentUserMember?.role
    const isOwnerOrManager = currentUserRole === "OWNER" || currentUserRole === "MANAGER"

    const ROLE_LABELS: Record<string, string> = {
        OWNER: "Propietario",
        PROFESSIONAL: "Profesional",
        MANAGER: "Gestor"
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <header className="relative p-8 rounded-3xl bg-linear-to-br from-primary/10 via-background to-background border-2 border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
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
                    <div className="flex flex-col sm:flex-row gap-3">
                        {isOwnerOrManager && (
                            <a href="/dashboard/organizacion/planes" className="px-6 py-3 bg-primary/10 hover:bg-primary/20 transition-colors backdrop-blur border border-primary/20 rounded-2xl shadow-sm inline-flex flex-col gap-1 items-start justify-center group">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 group-hover:text-primary flex items-center gap-2">
                                    <Globe className="h-3 w-3" /> Cambiar Plan
                                </p>
                                <p className="text-sm font-black text-primary">
                                    {organization.subscriptionPlan === "FREE" ? "Gratuito" :
                                        organization.subscriptionPlan === "TEAM" ? "Equipos" : "Corporativo"}
                                </p>
                            </a>
                        )}

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
                </div>
            </header>

            {/* Row 1: QR Code & Invitaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative mt-8">

                {/* QR Code Column */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-6 w-1 bg-blue-500/40 rounded-full" />
                        <h2 className="text-2xl font-display font-black tracking-tight text-foreground">Marketing & QR</h2>
                    </div>
                    <div className="space-y-4 flex flex-col">
                        <p className="text-muted-foreground text-sm leading-relaxed px-2">
                            Descarga el QR base o compártelo al instante con tus clientes en redes.
                        </p>
                        <div className="p-1 rounded-4xl bg-linear-to-b from-primary/10 to-transparent">
                            <div className="bg-card/80 backdrop-blur-xl border border-primary/5 rounded-[1.8rem] p-4 sm:p-6 shadow-xl shadow-primary/5">
                                <OrgQRCode
                                    orgName={organization.name}
                                    orgSlug={organization.slug}
                                    appUrl={process.env.NEXT_PUBLIC_APP_URL || ""}
                                />
                            </div>
                        </div>

                        <div className="px-2 pt-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden relative flex items-center justify-center gap-3 bg-card border-none hover:bg-primary/10 text-foreground hover:text-primary shadow-xl shadow-primary/5 group">
                                        <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl group-hover:border-primary/40 transition-colors" />
                                        <IdCard className="h-5 w-5 relative z-10" />
                                        <span className="relative z-10">Tarjeta de Presentación</span>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden bg-background/95 backdrop-blur-3xl border-2 border-primary/10 sm:rounded-4xl p-6 sm:p-10 shadow-2xl flex flex-col">
                                    <DialogTitle className="text-2xl md:text-3xl font-display font-black tracking-tight uppercase text-primary mb-1">
                                        Tarjeta de Presentación
                                    </DialogTitle>
                                    <p className="text-muted-foreground text-sm font-medium mb-4 sm:mb-8 max-w-xl">
                                        Previsualiza y estampa tu identidad. Descarga en alta resolución (SVG) tu tarjeta de presentación oficial lista para imprimir.
                                    </p>
                                    <div className="w-full relative flex-1 min-h-0 flex flex-col items-center justify-center">
                                        <OrgBusinessCard
                                            organization={organization}
                                            publicUrl={publicUrl}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Lateral: Invitaciones */}
                <div className="lg:col-span-7 flex flex-col h-full">
                    <div className="flex items-center gap-3 px-2 pb-6">
                        <div className="h-6 w-1 bg-muted-foreground/30 rounded-full" />
                        <h2 className="text-2xl font-display font-black tracking-tight text-foreground">Crecer / Equipo</h2>
                    </div>
                    <div className="flex-1 flex flex-col space-y-4">
                        <p className="text-muted-foreground text-sm leading-relaxed px-2">
                            Invita nuevos profesionales a tu organización copiando el enlace mágico para escalar tu negocio.
                        </p>
                        <div className="px-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">
                                    Capstone ({organization.subscriptionPlan === "FREE" ? "1 Base" : organization.subscriptionPlan === "TEAM" ? "Hasta 5" : "Ilimitado"})
                                </span>
                            </div>
                        </div>
                        <div className="px-2 flex-1">
                            <InviteMember
                                organizationId={organization.id}
                                disabled={currentUserRole !== "OWNER" && currentUserRole !== "MANAGER"}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Mi Equipo */}
            <div className="pt-8 mt-8 border-t border-border/50 space-y-6">
                <div className="flex flex-col gap-4 items-start md:gap-0 md:flex-row md:items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-primary rounded-full" />
                        <h2 className="text-2xl font-display font-black tracking-tight text-foreground">Mi Equipo</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20 shadow-sm shadow-primary/5">
                            {members.length} {members.length === 1 ? 'Profesional' : 'Profesionales'}
                        </span>
                        <a
                            href="/dashboard/organizacion/agenda"
                            className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1.5"
                        >
                            <CalendarRange className="h-3 w-3" />
                            Agenda de Equipo
                        </a>
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

                <div className="grid grid-cols-1 gap-6">
                    {sortedMembers.map((member, index) => {
                        const isPlanActive = maxSeats === 0 || index < maxSeats;
                        return (
                            <div
                                key={member.id}
                                className={cn(
                                    "p-1 rounded-xl bg-linear-to-r transition-colors duration-500 h-full",
                                    isPlanActive
                                        ? "from-primary/5 to-transparent hover:from-primary/10"
                                        : "from-red-500/5 to-transparent hover:from-red-500/10 opacity-70 grayscale-[0.3]"
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Card className={cn(
                                    "h-full bg-card/10 backdrop-blur-xl border border-primary/5 rounded-xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden flex flex-col justify-center",
                                    !isPlanActive && "border-red-500/20"
                                )}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <CardContent className="p-3 sm:px-4 sm:py-3.5">
                                        <div className="flex flex-col 2xl:flex-row 2xl:items-center gap-5 sm:gap-6 relative">
                                            {/* Header: Avatar, Name, Email */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 group-hover:scale-105 transition-transform duration-500 relative">
                                                    <UserAvatar
                                                        image={member.user.image}
                                                        name={member.user.name ?? "Usuario"}
                                                        className="h-full w-full rounded-2xl shadow-lg border-2 border-background ring-4 ring-primary/5"
                                                    />
                                                    {member.role === "OWNER" && (
                                                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-background z-10">
                                                            <Shield className="h-2.5 w-2.5" />
                                                        </div>
                                                    )}
                                                    {!isPlanActive && (
                                                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-2 border-background z-10" title="Suspendido por límite de plan">
                                                            <AlertTriangle className="h-2.5 w-2.5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg sm:text-xl font-black font-display tracking-tight truncate text-foreground/90">
                                                        {member.user.name}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate flex items-center gap-1.5 mt-0.5">
                                                        <UserCircle className="h-3.5 w-3.5 opacity-50 shrink-0" />
                                                        <span className="truncate">{member.user.email}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Middle & Actions Section */}
                                            <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row 2xl:items-center justify-between flex-1 gap-4 pt-4 sm:pt-0 xl:pt-4 2xl:pt-0 border-t sm:border-t-0 xl:border-t 2xl:border-t-0 border-border/10">
                                                {/* Profile Link */}
                                                <div className="flex-1 min-w-0">
                                                    {member.user.profile?.username && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-2 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/50 min-w-0 hover:bg-muted/50 transition-colors">
                                                                <Briefcase className="h-3 w-3 text-primary shrink-0" />
                                                                <span className="text-[10px] font-black text-foreground/80 truncate">
                                                                    {process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '')}/{member.user.profile.username}
                                                                </span>
                                                            </div>
                                                            <CopyLink url={`${process.env.NEXT_PUBLIC_APP_URL}/${member.user.profile.username}`} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Role & Visibility */}
                                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                                    {/* Role badge / selector */}
                                                    {isOwnerOrManager && member.userId !== currentUserMember?.userId ? (
                                                        <ChangeMemberRole
                                                            organizationId={organization.id}
                                                            targetUserId={member.userId}
                                                            currentRole={member.role as "OWNER" | "MANAGER" | "PROFESSIONAL"}
                                                            memberName={member.user.name}
                                                        />
                                                    ) : (
                                                        <span className={cn(
                                                            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-xs",
                                                            member.role === "OWNER" ? "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/5" :
                                                                member.role === "MANAGER" ? "bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/5" :
                                                                    "bg-green-500/10 text-green-600 border-green-500/20 shadow-green-500/5"
                                                        )}>
                                                            {ROLE_LABELS[member.role]}
                                                        </span>
                                                    )}

                                                    {!isPlanActive && (
                                                        <span className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-xs bg-red-500/10 text-red-600 border-red-500/20 shadow-red-500/5">
                                                            Suspendido (Plan)
                                                        </span>
                                                    )}

                                                    {isPlanActive && (
                                                        <span className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5 hidden md:inline-flex">
                                                            Activo
                                                        </span>
                                                    )}

                                                    {(isOwnerOrManager && member.user.profile) || (currentUserRole === "OWNER" && member.userId !== currentUserMember?.userId && member.role !== "OWNER") ? (
                                                        <div className="pl-3 border-l border-border/10 flex items-center gap-1">
                                                            {isOwnerOrManager && member.user.profile && (
                                                                <ToggleOrgVisibility
                                                                    initialValue={member.user.profile.showOnOrgPage ?? true}
                                                                    targetUserId={member.userId}
                                                                    memberName={member.user.name}
                                                                />
                                                            )}
                                                            {currentUserRole === "OWNER" && member.userId !== currentUserMember?.userId && member.role !== "OWNER" && (
                                                                <RemoveMember
                                                                    organizationId={organization.id}
                                                                    targetUserId={member.userId}
                                                                    memberName={member.user.name}
                                                                />
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                {/* Row 3: Zona de Peligro */}
                <div className="pt-12 border-t border-red-500/10 flex flex-col items-center gap-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500/50">Zona de Peligro</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {currentUserRole !== "OWNER" && (
                            <LeaveOrganization
                                organizationId={organization.id}
                                organizationName={organization.name}
                            />
                        )}
                        {currentUserRole === "OWNER" && (
                            <>
                                <TransferOwnership
                                    organizationId={organization.id}
                                    organizationName={organization.name}
                                    members={members.map(m => ({
                                        id: m.id,
                                        userId: m.userId,
                                        role: m.role,
                                        user: {
                                            name: m.user.name,
                                            email: m.user.email,
                                            image: m.user.image
                                        }
                                    }))}
                                />
                                <CloseOrganization
                                    organizationId={organization.id}
                                    organizationName={organization.name}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
