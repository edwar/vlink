import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Title } from "@/components/title"

/**
 * Encabezado estándar de las páginas del dashboard:
 * título, descripción opcional, icono decorativo y acciones a la derecha.
 */
export function PageHeader({
    title,
    description,
    icon: Icon,
    actions,
    className,
}: {
    /** Texto del título, o un nodo propio (p. ej. un título editable) */
    title: ReactNode
    description?: ReactNode
    icon?: LucideIcon
    actions?: ReactNode
    className?: string
}) {
    return (
        <header className={cn("relative overflow-hidden py-6 sm:py-8", className)}>
            {/* El icono decorativo se omite cuando hay acciones para no quedar detrás de ellas */}
            {Icon && !actions && (
                <div aria-hidden className="pointer-events-none absolute top-0 right-0 p-4 sm:p-8 opacity-5 sm:opacity-10">
                    <Icon className="h-24 w-24 rotate-12 text-primary" />
                </div>
            )}

            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="space-y-2">
                    {typeof title === "string" ? <Title title={title} /> : title}
                    {description && (
                        <p className="max-w-2xl text-lg font-medium text-muted-foreground">{description}</p>
                    )}
                </div>
                {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
            </div>
        </header>
    )
}
