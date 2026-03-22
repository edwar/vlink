import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { getUserOrganizations } from "@/app/actions/organization"
import { InviteMember } from "@/components/invite-member"
import { CreateOrganization } from "@/components/create-organization"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Building2, UserCircle, Briefcase, Globe, IdCard, CalendarRange, AlertTriangle, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"
import { CopyLink } from "@/components/copy-link"
import { ToggleOrgVisibility } from "@/components/toggle-org-visibility"
import { RenameOrganization } from "@/components/rename-organization"
import { OrgQRCode } from "@/components/org-qr-code"
import { OrgBusinessCard } from "@/components/org-business-card"
import { OrganizacionTour } from "@/components/tours/organizacion-tour"
import { LeaveOrganization } from "@/components/leave-organization"
import { CloseOrganization } from "@/components/close-organization"
import { TransferOwnership } from "@/components/transfer-ownership"
import { ChangeMemberRole } from "@/components/change-member-role"
import { RemoveMember } from "@/components/remove-member"
import { Button } from "@/components/ui/button"
import { WompiIntegration } from "@/components/wompi-integration"
import { OrganizationContact } from "@/components/organization-contact"

import { PaginationControls } from "@/components/pagination-controls"

export default async function OrganizacionPage(props: {
    searchParams: Promise<{ page?: string }>
}) {
    const searchParams = await props.searchParams
    const page = Number(searchParams.page) || 1
    const limit = 5
    const skip = (page - 1) * limit
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

    const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
    const isWompiMarketplaceEnabled = config?.wompiMarketplaceEnabled ?? false;
 
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/org/${organization.slug}`

    const planConfig = await prisma.planConfig.findUnique({
        where: { id: organization.subscriptionPlan }
    })
    const maxSeats = planConfig?.maxSeats ?? 0;

    // Fetch members of the organization with pagination
    const totalMembers = await prisma.member.count({
        where: {
            organizationId: organization.id,
            OR: [
                { user: { role: { not: "ADMIN" } } },
                { role: "OWNER" }
            ]
        }
    })
    const totalPagesMembers = Math.ceil(totalMembers / limit)

    const members = await prisma.member.findMany({
        where: {
            organizationId: organization.id,
            OR: [
                { user: { role: { not: "ADMIN" } } },
                { role: "OWNER" }
            ]
        },
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
        ],
        skip,
        take: limit
    })
    const sortedMembers = members; // Already sorted by database

    const currentUserMember = members.find((m: typeof members[0]) => m.userId === session.user.id)
    const currentUserRole = currentUserMember?.role
    const isOwnerOrManager = currentUserRole === "OWNER" || currentUserRole === "MANAGER"

    const ROLE_LABELS: Record<string, string> = {
        OWNER: "Propietario",
        PROFESSIONAL: "Profesional",
        MANAGER: "Gestor"
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <header className="relative py-8 rounded-3xl bg-surface/50 border border-border/40 overflow-hidden">
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
                            <a id="tour-org-plan" href="/dashboard/organizacion/planes" className="px-6 py-3 bg-primary/10 hover:bg-primary/20 transition-colors backdrop-blur border border-primary/20 rounded-2xl shadow-none inline-flex flex-col gap-1 items-start justify-center group">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 group-hover:text-primary flex items-center gap-2">
                                    <Globe className="h-3 w-3" /> Cambiar Plan
                                </p>
                                <p className="text-sm font-black text-primary">
                                    {organization.subscriptionPlan === "BASIC" ? "Básico" :
                                        organization.subscriptionPlan === "TEAM" ? "Equipos" : "Corporativo"}
                                </p>
                            </a>
                        )}

                        <div className="px-6 py-3 bg-card/60 backdrop-blur border border-primary/10 rounded-2xl shadow-none inline-flex items-center gap-3">
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
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-blue-500/40 rounded-full" />
                        <h2 className="text-2xl font-display font-black tracking-tight text-foreground">Marketing & QR</h2>
                    </div>
                    <div id="tour-org-qr" className="relative space-y-4 flex flex-col h-full bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 rounded-[2.5rem] p-8 overflow-hidden">
                        <div id="tour-org-qr-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed relative z-10">
                            Descarga el QR base o compártelo al instante con tus clientes en redes.
                        </p>
                        <div className="relative z-10 pt-4">
                            <OrgQRCode
                                orgName={organization.name}
                                orgSlug={organization.slug}
                                appUrl={process.env.NEXT_PUBLIC_APP_URL || ""}
                            />
                        </div>

                        <div className="px-2 pt-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full text-xs font-black overflow-hidden relative group border hover:bg-primary/10 hover:border-primary/30 text-foreground hover:text-primary shadow-none h-14 rounded-2xl"
                                    >
                                        <IdCard className="h-5 w-5 relative z-10 mr-2" />
                                        <span className="relative z-10 uppercase tracking-widest">Tarjeta de Presentación</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden border-border/40 sm:rounded-3xl p-6 sm:p-10 shadow-none flex flex-col">
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
                    <div className="flex items-center gap-3 pb-6">
                        <div className="h-6 w-1 bg-muted-foreground/30 rounded-full" />
                        <h2 className="text-2xl font-display font-black tracking-tight text-foreground">Crecer / Equipo</h2>
                    </div>
                    <div id="tour-org-invite" className="relative flex-1 flex flex-col space-y-4 bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 rounded-[2.5rem] p-8 overflow-hidden h-full">
                        <div id="tour-org-invite-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed relative z-10">
                            Invita nuevos profesionales a tu organización copiando el enlace mágico para escalar tu negocio.
                        </p>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">
                                    Capstone ({organization.subscriptionPlan === "BASIC" ? "1 Base" : organization.subscriptionPlan === "TEAM" ? "Hasta 5" : "Ilimitado"})
                                </span>
                            </div>
                        </div>
                        <div className="relative z-10 flex-1">
                            <InviteMember
                                organizationId={organization.id}
                                disabled={currentUserRole !== "OWNER" && currentUserRole !== "MANAGER"}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 1.5: Pagos, Comunicación & Sedes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative mt-8">
                {/* Cobros y Pagos */}
                <div id="tour-org-payments" className="relative flex flex-col space-y-6 bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 rounded-[2.5rem] p-8 overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-emerald-500/40 rounded-full" />
                        <h2 className="text-xl font-display font-black tracking-tight text-foreground uppercase">Pagos & Cobros</h2>
                    </div>
                    <div id="tour-org-payments-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                    <WompiIntegration
                        organizationId={organization.id}
                        initialSubaccountId={(organization as any).wompiSubaccountId}
                        disabled={currentUserRole !== "OWNER" && currentUserRole !== "MANAGER"}
                        isMarketplaceEnabled={isWompiMarketplaceEnabled}
                    />
                </div>

                {/* Infraestructura & Sedes */}
                <div className="relative flex flex-col space-y-6 bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 rounded-[2.5rem] p-8 overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-purple-500/40 rounded-full" />
                        <h2 className="text-xl font-display font-black tracking-tight text-foreground uppercase">Infraestructura</h2>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed relative z-10 flex-1">
                        Gestiona tus sedes físicas y asocia disponibilidad a cada ubicación.
                    </p>
                    <Button asChild variant="vlink" size="lg" className="w-full mt-auto h-14 rounded-2xl">
                        <a href="/dashboard/organizacion/sedes">
                            <MapPin className="h-5 w-5 mr-2" />
                            <span className="uppercase tracking-widest text-xs font-black">Gestionar Sedes</span>
                        </a>
                    </Button>
                </div>

                {/* Comunicación & Soporte */}
                <div id="tour-org-contact" className="relative flex flex-col space-y-6 bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 rounded-[2.5rem] p-8 overflow-hidden md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-orange-500/40 rounded-full" />
                        <h2 className="text-xl font-display font-black tracking-tight text-foreground uppercase">Soporte</h2>
                    </div>
                    <div id="tour-org-contact-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                    <OrganizationContact
                        organizationId={organization.id}
                        initialPhone={(organization as any).phone}
                        initialWhatsapp={(organization as any).whatsapp}
                        disabled={currentUserRole !== "OWNER" && currentUserRole !== "MANAGER"}
                    />
                </div>
            </div>

            {/* Row 2: Mi Equipo */}
            <div className="pt-20 mt-20 border-t border-border/50 space-y-6">
                <div className="flex flex-col gap-4 items-start md:gap-0 md:flex-row md:items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-primary rounded-full" />
                        <h2 className="text-2xl font-display font-black tracking-tight text-foreground">Mi Equipo</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-muted/30 text-foreground text-[10px] font-black uppercase tracking-widest rounded-full border border-border/40 shadow-none">
                            {sortedMembers.length} {sortedMembers.length === 1 ? 'Profesional' : 'Profesionales'}
                        </span>
                        <a
                            id="tour-team-agenda"
                            href="/dashboard/organizacion/agenda"
                            className="px-4 py-1.5 bg-muted/30 text-foreground text-[10px] font-black uppercase tracking-widest rounded-full border border-border/40 hover:bg-muted/50 transition-colors flex items-center gap-1.5"
                        >
                            <CalendarRange className="h-3 w-3 opacity-50" />
                            Agenda de Equipo
                        </a>
                        <a
                            id="tour-org-public-page"
                            href={`/org/${organization.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-1.5 bg-muted/30 text-foreground text-[10px] font-black uppercase tracking-widest rounded-full border border-border/40 hover:bg-muted/50 transition-colors flex items-center gap-1.5"
                        >
                            <Globe className="h-3 w-3 opacity-50" />
                            Ver página pública
                        </a>
                    </div>
                </div>

                <div id="tour-team-members" className="relative grid grid-cols-1 gap-6">
                    <div id="tour-team-members-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                    {sortedMembers.map((member: typeof members[0], index: number) => {
                        // For seat calculation, we would ideally need the absolute index across pages,
                        // but let's stick to simple active display if you're in the list.
                        // Ideally, we'd check if (skip + index) < maxSeats.
                        const absoluteIndex = skip + index;
                        const isPlanActive = maxSeats === 0 || absoluteIndex < maxSeats;
                        return (
                            <div
                                key={member.id}
                                className={cn(
                                    "bg-linear-to-br from-primary/5 via-transparent to-transparent group relative bg-card border border-border/50 rounded-[2.5rem] hover:border-border/80 transition-all flex flex-col xl:flex-row xl:items-center justify-between p-4 sm:p-5 sm:px-6 gap-6",
                                    !isPlanActive && "opacity-70 grayscale-[0.3] border-red-500/20"
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Header: Avatar, Name, Email */}
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 group-hover:scale-105 transition-transform duration-500 relative">
                                        <UserAvatar
                                            image={member.user.image}
                                            name={member.user.name ?? "Usuario"}
                                            className="h-full w-full rounded-[1.2rem] shadow-none border border-border/50"
                                        />
                                        {member.role === "OWNER" && (
                                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-none border-2 border-background z-10">
                                                <Shield className="h-2.5 w-2.5" />
                                            </div>
                                        )}
                                        {!isPlanActive && (
                                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-none border-2 border-background z-10" title="Suspendido por límite de plan">
                                                <AlertTriangle className="h-2.5 w-2.5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-lg font-black font-display tracking-tight truncate text-foreground/90">
                                            {member.user.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-medium truncate flex items-center gap-1.5">
                                            <UserCircle className="h-3.5 w-3.5 opacity-50 shrink-0" />
                                            <span className="truncate">{member.user.email}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Middle & Actions Section */}
                                <div className="flex flex-col sm:flex-row xl:items-center justify-between flex-1 gap-4">
                                    {/* Profile Link */}
                                    <div className="flex-1 min-w-0 xl:flex xl:justify-center">
                                        {member.user.profile?.username && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50 min-w-0">
                                                    <Briefcase className="h-3.5 w-3.5 text-foreground/60 shrink-0" />
                                                    <span className="text-[11px] font-black text-foreground/70 truncate">
                                                        {process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '')}/{member.user.profile.username}
                                                    </span>
                                                </div>
                                                <CopyLink url={`${process.env.NEXT_PUBLIC_APP_URL}/${member.user.profile.username}`} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Role & Visibility */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
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
                                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                member.role === "OWNER" ? "bg-amber-500/5 text-amber-600 border-amber-500/20" :
                                                    member.role === "MANAGER" ? "bg-blue-500/5 text-blue-600 border-blue-500/20" :
                                                        "bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                                            )}>
                                                {ROLE_LABELS[member.role]}
                                            </span>
                                        )}

                                        {!isPlanActive && (
                                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-red-500/5 text-red-600 border-red-500/20">
                                                Suspendido
                                            </span>
                                        )}

                                        {isPlanActive && (
                                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-500/5 text-emerald-600 border-emerald-500/20 hidden md:inline-flex">
                                                Activo
                                            </span>
                                        )}

                                        {(isOwnerOrManager && member.user.profile) || (currentUserRole === "OWNER" && member.userId !== currentUserMember?.userId && member.role !== "OWNER") ? (
                                            <div className="flex items-center gap-3">
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
                        );
                    })}
                </div>

                <PaginationControls totalPages={totalPagesMembers} currentPage={page} />

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
                                    members={members.map((m: typeof members[0]) => ({
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
            <OrganizacionTour />
        </div>
    )
}
