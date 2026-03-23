"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "./button"

interface BackButtonProps {
    className?: string
    label?: string
    children?: React.ReactNode
}

export function BackButton({ className, label = "Volver", children }: BackButtonProps) {
    const router = useRouter()

    return (
        <Button
            onClick={() => router.back()}
            className={`group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all mb-4 px-4 py-2 hover:bg-transparent rounded-xl border border-transparent ${className}`}
            variant="ghost"
        >
            {children || (
                <>
                    <ChevronLeft className="h-4 w-4" />
                    {label}
                </>
            )}
        </Button>
    )
}

