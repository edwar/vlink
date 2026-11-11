import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { BadgeCheck, ArrowRight } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { isBrandingRemoved } from "@/lib/branding"

/** Explica la opción de retirar "Agenda creada con VLink" y muestra el estado actual. */
export function BrandingInfoCard({ removedUntil, scope }: { removedUntil: Date | null; scope: "organización" | "perfil" }) {
    const active = isBrandingRemoved(removedUntil)
    return (
        <section className="relative flex flex-col gap-4 rounded-3xl border border-border/40 bg-card/50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BadgeCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">Página sin marca VLink</h3>
                        {active ? (
                            <StatusBadge tone="success" dot>Activa hasta el {format(removedUntil!, "d 'de' MMMM 'de' yyyy", { locale: es })}</StatusBadge>
                        ) : (
                            <StatusBadge tone="neutral">No activa</StatusBadge>
                        )}
                    </div>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        {active
                            ? `Las páginas públicas de tu ${scope} no muestran "Agenda creada con VLink". Para renovarla antes del vencimiento, escríbenos.`
                            : `Tus clientes ven un pequeño "Agenda creada con VLink" al pie de tus páginas públicas. Si prefieres una página 100% con tu marca, escríbenos y te contamos cómo retirarla.`}
                    </p>
                </div>
            </div>
            <Link
                href="/soporte"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
                {active ? "Renovar" : "Solicitar"} <ArrowRight className="h-4 w-4" />
            </Link>
        </section>
    )
}
