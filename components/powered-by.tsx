import Link from "next/link"
import { Logo } from "@/components/logo"

/** Marca discreta en el pie de las páginas públicas. Se oculta con un pago manual (ver /admin). */
export function PoweredBy() {
    return (
        <div className="flex justify-center px-4 py-8">
            <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/30 hover:text-foreground"
            >
                <Logo className="h-4 w-4" />
                Agenda creada con <span className="font-semibold text-foreground">VLink</span>
            </Link>
        </div>
    )
}
