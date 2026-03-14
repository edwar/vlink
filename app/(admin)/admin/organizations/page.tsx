import { getAllOrganizations } from "@/app/actions/admin"
import { Building2, UserCircle, ShieldCheck, Mail, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { SupportOrganizationButton } from "@/components/support-organization-button"
import { AdminEmptyState } from "@/components/admin/admin-empty-state"

export default async function AdminOrganizations() {
    const session = await auth.api.getSession({ headers: await headers() })
    const orgs = await getAllOrganizations()

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-display font-black tracking-tight text-foreground uppercase">Organizaciones</h1>
                <p className="text-muted-foreground font-medium">Gestiona y monitorea todas las entidades registradas en VLink.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {orgs.length === 0 ? (
                    <AdminEmptyState
                        title="No hay organizaciones"
                        description="Actualmente no hay organizaciones registradas en la plataforma."
                        icon={Building2}
                    />
                ) : (
                    orgs.map((org) => (
                        <Card key={org.id} className="border border-border/40 shadow-none bg-card rounded-2xl overflow-hidden group hover:border-primary/30 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                            <Building2 className="h-7 w-7" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-xl font-black font-display tracking-tight text-foreground group-hover:text-primary transition-colors">{org.name}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">slug: {org.slug}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${org.subscriptionPlan === "FREE" ? "bg-zinc-500/10 text-zinc-600 border-zinc-500/20" :
                                                    org.subscriptionPlan === "TEAM" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                        "bg-primary/10 text-primary border-primary/20"
                                                    }`}>
                                                    {org.subscriptionPlan}
                                                </span>
                                                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                                                    <UserCircle className="h-3.5 w-3.5 opacity-50" />
                                                    {org._count.members} Miembros / {org._count.profiles} Perfiles
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 text-right shrink-0">
                                        <div className="hidden sm:block">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Creado el</p>
                                            <p className="text-sm font-bold text-foreground">
                                                {format(new Date(org.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <SupportOrganizationButton
                                                organizationId={org.id}
                                                organizationName={org.name}
                                                isAlreadyMember={org.members.some(m => m.userId === session?.user?.id)}
                                            />
                                            <Link
                                                href={`/org/${org.slug}`}
                                                target="_blank"
                                                className="h-10 w-10 sm:h-12 sm:w-12 border border-border/30 bg-muted/20 text-muted-foreground rounded-2xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
                                                title="Ver página pública"
                                            >
                                                <ArrowRight className="h-5 w-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
