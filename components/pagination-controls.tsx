"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface PaginationControlsProps {
    totalPages: number
    currentPage: number
    baseUrl?: string
    maxVisiblePages?: number
}

export function PaginationControls({ totalPages, currentPage, baseUrl, maxVisiblePages = 5 }: PaginationControlsProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    if (totalPages <= 1) return null

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", pageNumber.toString())
        return `${baseUrl || pathname}?${params.toString()}`
    }

    const renderPageNumbers = () => {
        const pages = []

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (currentPage > 3) {
                pages.push("ellipsis-start")
            }

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push("ellipsis-end")
            }

            // Always show last page
            if (!pages.includes(totalPages)) {
                pages.push(totalPages)
            }
        }

        return pages.map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
                return (
                    <div key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                )
            }

            const isPageActive = currentPage === page
            return (
                <Link
                    key={page}
                    href={createPageURL(page as number)}
                    className={cn(
                        "flex h-9 min-w-9 items-center justify-center rounded-xl text-sm font-black transition-all",
                        isPageActive
                            ? "bg-primary text-primary-foreground shadow-sm scale-110"
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                >
                    {page}
                </Link>
            )
        })
    }

    return (
        <nav className="flex items-center justify-center gap-2 pt-8" aria-label="Navegación de páginas">
            <Button
                variant="outline"
                size="icon"
                asChild
                disabled={currentPage <= 1}
                className={cn(
                    "h-9 w-9 rounded-xl border-border/40 bg-surface/50 shadow-none transition-all",
                    currentPage <= 1 && "pointer-events-none opacity-50"
                )}
            >
                <Link href={createPageURL(currentPage - 1)} aria-label="Página anterior">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
            </Button>

            <div className="flex items-center gap-1">
                {renderPageNumbers()}
            </div>

            <Button
                variant="outline"
                size="icon"
                asChild
                disabled={currentPage >= totalPages}
                className={cn(
                    "h-9 w-9 rounded-xl border-border/40 bg-surface/50 shadow-none transition-all",
                    currentPage >= totalPages && "pointer-events-none opacity-50"
                )}
            >
                <Link href={createPageURL(currentPage + 1)} aria-label="Siguiente página">
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </Button>
        </nav>
    )
}
