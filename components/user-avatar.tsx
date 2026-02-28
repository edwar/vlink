"use client"

import { useState } from "react"
import { UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
    image?: string | null
    name?: string | null
    className?: string
}

export function UserAvatar({ image, name, className }: UserAvatarProps) {
    const [error, setError] = useState(false)

    if (!image || error) {
        return (
            <div className={cn("h-full w-full rounded-2xl bg-muted/50 flex items-center justify-center text-primary/40", className)}>
                <UserCircle className="h-2/3 w-2/3" />
            </div>
        )
    }

    return (
        <img
            src={image}
            alt={name || "Usuario"}
            className={cn("h-full w-full rounded-2xl object-cover", className)}
            onError={() => setError(true)}
            referrerPolicy="no-referrer"
        />
    )
}
