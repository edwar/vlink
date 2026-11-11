"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addMonths, addYears, format } from "date-fns"
import { es } from "date-fns/locale"
import { BadgeCheck, Loader2 } from "lucide-react"
import { sileo } from "sileo"
import { setBrandingRemoval } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { StatusBadge } from "@/components/ui/status-badge"

/**
 * Interruptor manual de la marca "Agenda creada con VLink".
 * Se usa después de recibir un pago por transferencia: se fija hasta cuándo
 * queda oculta la marca, y al vencer vuelve a mostrarse sola.
 */
export function BrandingControl({
    target,
    removedUntil,
}: {
    target: { type: "organization" | "profile"; id: string }
    removedUntil: Date | string | null
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [customDate, setCustomDate] = useState("")

    const until = removedUntil ? new Date(removedUntil) : null
    const active = !!until && until > new Date()
    // Si ya hay un periodo vigente, las extensiones se suman a partir de su vencimiento
    const base = active ? until! : new Date()

    async function apply(next: Date | null) {
        setLoading(true)
        try {
            await setBrandingRemoval(target, next ? next.toISOString() : null)
            sileo.success({
                title: next ? "Marca retirada" : "Marca restaurada",
                description: next
                    ? `Sin "Agenda creada con VLink" hasta el ${format(next, "d 'de' MMMM 'de' yyyy", { locale: es })}.`
                    : `Se vuelve a mostrar "Agenda creada con VLink".`,
            })
            setOpen(false)
            setCustomDate("")
            router.refresh()
        } catch (error: any) {
            sileo.error({ title: "Error", description: error.message || "No se pudo actualizar la marca" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button" className="rounded-full focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none">
                    {active ? (
                        <StatusBadge tone="success" dot>
                            Sin marca hasta {format(until!, "d MMM yyyy", { locale: es })}
                        </StatusBadge>
                    ) : (
                        <StatusBadge tone="neutral">Con marca VLink</StatusBadge>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-4">
                <div className="space-y-1">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BadgeCheck className="h-4 w-4 text-primary" />
                        Marca &quot;Agenda creada con VLink&quot;
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Retírala tras confirmar el pago por transferencia. Al vencer la fecha vuelve a mostrarse sola.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" disabled={loading} onClick={() => apply(addMonths(base, 1))}>
                        +1 mes
                    </Button>
                    <Button size="sm" variant="outline" disabled={loading} onClick={() => apply(addYears(base, 1))}>
                        +1 año
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        aria-label="Sin marca hasta"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="h-9 rounded-lg"
                    />
                    <Button
                        size="sm"
                        disabled={loading || !customDate}
                        onClick={() => apply(new Date(`${customDate}T23:59:59-05:00`))}
                    >
                        Fijar
                    </Button>
                </div>

                {active && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={loading}
                        onClick={() => apply(null)}
                    >
                        Restaurar marca ahora
                    </Button>
                )}

                {loading && (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Guardando…
                    </p>
                )}
            </PopoverContent>
        </Popover>
    )
}
