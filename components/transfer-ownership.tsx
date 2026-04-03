"use client"

import { useState } from "react"
import { transferOwnership } from "@/app/actions/organization"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Crown, Loader2, ShieldCheck, UserCheck } from "lucide-react"
import { sileo } from "sileo"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Member {
    id: string
    userId: string
    role: string
    user: {
        name: string | null
        email: string
        image: string | null
    }
}

interface TransferOwnershipProps {
    organizationId: string
    organizationName: string
    members: Member[]
}

export function TransferOwnership({ organizationId, organizationName, members }: TransferOwnershipProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const router = useRouter()

    // Only show non-OWNER members as candidates
    const candidates = members.filter(m => m.role !== "OWNER")

    const selectedMember = candidates.find(m => m.userId === selectedUserId)

    async function handleTransfer() {
        if (!selectedUserId) return

        setIsLoading(true)
        try {
            const result = await transferOwnership(organizationId, selectedUserId)
            sileo.success({
                title: "Propiedad transferida",
                description: `${result.newOwnerName} ahora es el nuevo propietario de ${organizationName}.`
            })
            setIsOpen(false)
            router.refresh()
        } catch (error: any) {
            sileo.error({ title: "Error", description: error.message || "No se pudo transferir la propiedad" })
        } finally {
            setIsLoading(false)
        }
    }

    if (candidates.length === 0) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) setSelectedUserId(null)
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-9 px-4 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest gap-2 flex items-center"
                >
                    <Crown className="h-3.5 w-3.5" />
                    Transferir Propiedad
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] sm:rounded-4xl p-8">
                <DialogHeader className="space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
                        <Crown className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-2xl font-display font-black tracking-tight uppercase text-foreground">
                        Transferir Propiedad
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium leading-relaxed">
                        Elige quién será el nuevo propietario de <span className="text-foreground font-bold">{organizationName}</span>. Tú pasarás a ser <span className="text-foreground font-bold">Gestor</span>.
                    </DialogDescription>
                </DialogHeader>

                {/* Member Selector */}
                <div className="mt-6 space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {candidates.map((member) => (
                        <button
                            key={member.userId}
                            onClick={() => setSelectedUserId(member.userId)}
                            className={cn(
                                "w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left",
                                selectedUserId === member.userId
                                    ? "border-amber-500/40 bg-amber-500/5"
                                    : "border-border/50 hover:border-amber-500/20 hover:bg-amber-500/5"
                            )}
                        >
                            {/* Avatar */}
                            <div className="h-10 w-10 rounded-xl bg-muted shrink-0 overflow-hidden">
                                {member.user.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={member.user.image} alt={member.user.name ?? ""} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground font-black text-sm">
                                        {(member.user.name ?? "?")[0].toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-sm text-foreground truncate">{member.user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                            </div>

                            {/* Role badge */}
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0",
                                member.role === "MANAGER"
                                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                    : "bg-green-500/10 text-green-600 border-green-500/20"
                            )}>
                                {member.role === "MANAGER" ? "Gestor" : "Profesional"}
                            </span>

                            {selectedUserId === member.userId && (
                                <UserCheck className="h-4 w-4 text-amber-500 shrink-0" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Confirmation hint */}
                {selectedMember && (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
                        <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            <span className="text-foreground font-bold">{selectedMember.user.name}</span> pasará a ser el propietario de la organización. Esta acción puede revertirse desde la cuenta del nuevo propietario.
                        </p>
                    </div>
                )}

                <DialogFooter className="mt-8 gap-3 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        className="rounded-2xl font-black text-[10px] uppercase tracking-widest"
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleTransfer}
                        disabled={!selectedUserId || isLoading}
                        className="rounded-2xl font-black text-[10px] uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 px-8 disabled:opacity-30"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Transfiriendo...
                            </>
                        ) : (
                            "Confirmar Transferencia"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
