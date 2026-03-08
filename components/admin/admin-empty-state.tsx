import { LucideIcon } from "lucide-react"

interface AdminEmptyStateProps {
    title: string
    description: string
    icon: LucideIcon
    action?: React.ReactNode
}

export function AdminEmptyState({
    title,
    description,
    icon: Icon,
    action,
}: AdminEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-lg animate-in fade-in-50">
            <div className="flex items-center justify-center w-40 h-40 rounded-full bg-muted mb-4">
                <Icon className="w-32 h-32 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-6xl tracking-tight font-display font-black">{title}</h3>
            <p className="mb-4 text-2xl text-muted-foreground max-w-sm font-display">
                {description}
            </p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    )
}
