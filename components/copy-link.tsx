"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CopyLinkProps {
    url: string
}

export function CopyLink({ url }: CopyLinkProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Error al copiar el enlace:", err)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
            onClick={handleCopy}
        >
            {copied ? (
                <Check className="h-3.5 w-3.5" />
            ) : (
                <Copy className="h-3.5 w-3.5" />
            )}
        </Button>
    )
}
