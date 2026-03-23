import { Calendar as CalendarIcon, LucideIcon } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
    title: string
    description: string
    icon?: LucideIcon
    actionText?: string
    actionHref?: string
    className?: string
}

export function EmptyState({
    title,
    description,
    icon: Icon = CalendarIcon,
    actionText,
    actionHref,
    className
}: EmptyStateProps) {
    return (
        <div className={`p-4 bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 shadow-none rounded-2xl text-center space-y-4 ${className}`}>
            <div className="h-32 w-32 bg-primary/5 rounded-full mx-auto flex items-center justify-center text-primary/30">
                <Icon className="h-24 w-24 text-muted-foreground" />
            </div>
            <div className="space-y-2 max-w-xs mx-auto">
                <p className="font-bold text-lg">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {actionText && actionHref && (
                <div className="pt-2">
                    <Link
                        href={actionHref}
                        className="inline-flex items-center justify-center h-10 px-8 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 cursor-default"
                    >
                        {actionText}
                    </Link>
                </div>
            )}
        </div>
    )
}
