import { Coffee } from "lucide-react"
import { cn } from "@/lib/utils"

export const DONATION_URL = process.env.NEXT_PUBLIC_DONATION_URL

/** Enlace discreto para invitar un café al desarrollador. No se muestra si no hay URL configurada. */
export function SupportVLinkLink({ className }: { className?: string }) {
    if (!DONATION_URL) return null
    return (
        <a
            href={DONATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group flex items-center gap-x-3 rounded-sm p-2.5 sm:p-3 text-sm font-bold leading-6 text-muted-foreground transition-all duration-300 hover:bg-amber-500/10 hover:text-amber-600",
                className
            )}
        >
            <Coffee className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 transition-transform duration-300 group-hover:-rotate-12" aria-hidden="true" />
            Invítame un café
        </a>
    )
}
