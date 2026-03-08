"use client"

import { useState } from "react"
import { updateMemberRole } from "@/app/actions/organization"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { sileo } from "sileo"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

type MemberRole = "OWNER" | "MANAGER" | "PROFESSIONAL"

interface ChangeMemberRoleProps {
    organizationId: string
    targetUserId: string
    currentRole: MemberRole
    memberName: string | null
}

const ROLE_CONFIG: Record<MemberRole, { label: string; className: string }> = {
    OWNER: {
        label: "Propietario",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20"
    },
    MANAGER: {
        label: "Gestor",
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    },
    PROFESSIONAL: {
        label: "Profesional",
        className: "bg-green-500/10 text-green-600 border-green-500/20"
    }
}

export function ChangeMemberRole({ organizationId, targetUserId, currentRole, memberName }: ChangeMemberRoleProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [optimisticRole, setOptimisticRole] = useState<MemberRole>(currentRole)

    // OWNERs are shown as a static badge (cannot be changed here)
    if (currentRole === "OWNER") {
        return (
            <span className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                Propietario
            </span>
        )
    }

    async function handleRoleChange(newRole: string) {
        if (newRole === optimisticRole) return
        const role = newRole as "MANAGER" | "PROFESSIONAL"

        const previousRole = optimisticRole
        setOptimisticRole(role) // Optimistic update
        setIsLoading(true)

        try {
            await updateMemberRole(organizationId, targetUserId, role)
            sileo.success({
                title: "Rol actualizado",
                description: `${memberName ?? "El miembro"} ahora es ${ROLE_CONFIG[role].label}.`
            })
        } catch (error: any) {
            setOptimisticRole(previousRole) // Revert on failure
            sileo.error({ title: "Error", description: error.message || "No se pudo actualizar el rol" })
        } finally {
            setIsLoading(false)
        }
    }

    const config = ROLE_CONFIG[optimisticRole]

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/60 backdrop-blur-sm rounded-lg">
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                </div>
            )}
            <Select value={optimisticRole} onValueChange={handleRoleChange} disabled={isLoading}>
                <SelectTrigger
                    size="sm"
                    className={cn(
                        "h-auto px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border rounded-lg shadow-xs w-auto gap-2 min-w-[110px]",
                        config.className
                    )}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end" className="rounded-xl border-2 shadow-xl">
                    <SelectItem value="MANAGER" className="text-[11px] font-black uppercase tracking-widest text-blue-600 focus:bg-blue-500/10 focus:text-blue-600">
                        Gestor
                    </SelectItem>
                    <SelectItem value="PROFESSIONAL" className="text-[11px] font-black uppercase tracking-widest text-green-600 focus:bg-green-500/10 focus:text-green-600">
                        Profesional
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
