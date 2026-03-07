import { cn } from "@/lib/utils";

export function Title({ title, className }: { title: string, className?: string }) {
    return (
        <h1 className={cn("text-4xl lg:text-5xl font-display font-black tracking-tight text-primary", className)}>
            {title}
        </h1>
    )
}