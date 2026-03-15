import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getUserOrganizations } from "@/app/actions/organization"
import { testSetPlan } from "@/app/actions/billing"
import { getPublicPlanConfigs } from "@/app/actions/admin"
import { PricingPlans } from "@/components/pricing-plans"
import { CreditCard, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function BillingPage({
    searchParams
}: {
    searchParams: Promise<{ success?: string, plan?: string, orgId?: string }>
}) {
    const params = await searchParams;
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/login")

    const organizations = await getUserOrganizations()
    const organization = organizations[0]

    // Si no tiene organización, le mandamos al dash de org para que cree una
    if (!organization) {
        redirect("/dashboard/organizacion")
    }

    const planInfo = await getPublicPlanConfigs()

    // Auto-update plan if coming back from successful payment (DEMO/LOCAL fallthrough)
    let justSubscribed = false;
    if (params.success === "true" && params.plan && params.orgId === organization.id) {
        const planToSet = params.plan.toUpperCase() as any;
        if (["TEAM", "CORPORATE"].includes(planToSet)) {
            await testSetPlan(organization.id, planToSet);
            organization.subscriptionPlan = planToSet;
            justSubscribed = true;
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <Link
                href="/dashboard/organizacion"
                className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Volver a Organización
            </Link>

            {justSubscribed && (
                <div className="p-6 bg-green-500/10 border-2 border-green-500/20 rounded-3xl flex items-center gap-4 animate-in zoom-in-95 fade-in duration-500">
                    <div className="h-12 w-12 rounded-2xl bg-green-500 flex items-center justify-center text-white shrink-0">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-green-700">¡Pago Exitoso!</h3>
                        <p className="text-green-600/80 font-medium text-sm">Tu organización ha sido actualizada al plan {params.plan}. Ya puedes invitar a más colaboradores.</p>
                    </div>
                </div>
            )}

            {organization.billingStatus === "OVERDUE" && (
                <div className="p-6 bg-amber-500/10 border-2 border-amber-500/20 rounded-3xl flex items-center gap-4 animate-in zoom-in-95 fade-in duration-500">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-amber-700">Periodo de Gracia Activo</h3>
                        <p className="text-amber-600/80 font-medium text-sm">
                            Hemos tenido un problema con tu pago recurrente. Tienes hasta el <strong>{organization.gracePeriodEnd?.toLocaleDateString('es-CO')}</strong> para regularizar tu situación antes de que la organización sea degradada al plan BASIC.
                        </p>
                    </div>
                </div>
            )}

            <header className="relative p-8 px-4 sm:px-8 rounded-3xl bg-linear-to-br from-primary/10 via-background to-background border-2 border-primary/5 shadow-none overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CreditCard className="h-24 w-24 text-primary -rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            <CreditCard className="h-3 w-3" />
                            Suscripciones
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-primary uppercase">
                            Facturación
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                            Escala VLink de acuerdo a las necesidades de tu organización. Administra tu suscripción de Mercado Pago de forma segura.
                        </p>
                    </div>
                </div>
            </header>

            <section>
                <PricingPlans
                    organizationId={organization.id}
                    currentPlan={organization.subscriptionPlan}
                    isAdmin={organization.profiles.find(m => m.userId === session.user.id)?.user.role === "ADMIN"}
                    initialPlans={planInfo}
                    mpSubscriptionId={organization.mpSubscriptionId}
                />
            </section>
        </div>
    )
}
