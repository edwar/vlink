"use client"

import { useState } from "react"
import { removeMember } from "@/app/actions/organization"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Loader2, UserMinus, TriangleAlert } from "lucide-react"
import { sileo } from "sileo"

interface RemoveMemberProps {
    organizationId: string
    targetUserId: string
    memberName: string | null
}

export function RemoveMember({ organizationId, targetUserId, memberName }: RemoveMemberProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    async function handleRemove() {
        setIsLoading(true)
        try {
            await removeMember(organizationId, targetUserId)
            sileo.success({
                title: "Miembro eliminado",
                description: `${memberName ?? "El miembro"} ha sido removido de la organización.`
            })
            setIsOpen(false)
        } catch (error: any) {
            sileo.error({ title: "Error", description: error.message || "No se pudo eliminar el miembro" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                    title={`Eliminar a ${memberName ?? "este miembro"}`}
                >
                    <UserMinus className="h-3.5 w-3.5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                side="top"
                className="w-72 p-4 rounded-2xl border-2 border-red-500/15 bg-background/95 backdrop-blur-3xl shadow-xl"
            >
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                            <TriangleAlert className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-foreground">
                                ¿Eliminar a {memberName ?? "este miembro"}?
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                Perderá el acceso a la organización inmediatamente.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading}
                            className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-8"
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleRemove}
                            disabled={isLoading}
                            className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-8 bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20"
                        >
                            {isLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                "Eliminar"
                            )}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
