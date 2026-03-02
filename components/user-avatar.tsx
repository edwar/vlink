"use client"

import { useState } from "react"
import Image from "next/image"
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
            <div className={cn("bg-muted/50 flex items-center justify-center text-primary/40", className)}>
                <UserCircle className="h-2/3 w-2/3" />
            </div>
        )
    }

    return (
        <div className={cn("relative overflow-hidden", className)}>
            <Image
                src={image}
                alt={name || "Usuario"}
                fill
                sizes="128px"
                className="object-cover"
                onError={() => setError(true)}
                referrerPolicy="no-referrer"
            />
        </div>
    )
}
