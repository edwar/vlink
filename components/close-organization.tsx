"use client"

import { useState } from "react"
import { deleteOrganization } from "@/app/actions/organization"
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
import { Input } from "@/components/ui/input"
import { Trash2, Loader2, TriangleAlert } from "lucide-react"
import { sileo } from "sileo"
import { useRouter } from "next/navigation"

interface CloseOrganizationProps {
    organizationId: string
    organizationName: string
}

export function CloseOrganization({ organizationId, organizationName }: CloseOrganizationProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [confirmText, setConfirmText] = useState("")
    const router = useRouter()

    const isConfirmed = confirmText === organizationName

    async function handleDelete() {
        if (!isConfirmed) return

        setIsLoading(true)
        try {
            await deleteOrganization(organizationId)
            sileo.success({ title: "Organización cerrada", description: "La organización ha sido eliminada permanentemente." })
            setIsOpen(false)
            router.push("/dashboard")
            router.refresh()
        } catch (error: any) {
            sileo.error({ title: "No se pudo cerrar", description: error.message || "Error al eliminar la organización" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) setConfirmText("")
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-9 px-4 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest gap-2 flex items-center"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Cerrar Organización
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px] bg-background/95 backdrop-blur-3xl border-2 border-red-500/10 sm:rounded-4xl p-8">
                <DialogHeader className="space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                        <TriangleAlert className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-2xl font-display font-black tracking-tight uppercase text-foreground">
                        Cerrar Organización
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium leading-relaxed">
                        Esta acción es <span className="text-red-500 font-bold">permanente e irreversible</span>. Se eliminarán todos los datos de la organización: invitaciones, membresías y configuración de plan.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/15">
                        <p className="text-xs font-black uppercase tracking-widest text-red-500/70 mb-1">
                            ¿Qué se eliminará?
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1 font-medium">
                            <li>• La organización <span className="text-foreground font-bold">{organizationName}</span></li>
                            <li>• Todos los registros de membresía</li>
                            <li>• Todas las invitaciones pendientes</li>
                            <li>• La configuración del plan</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                            Escribe <span className="text-foreground font-black">{organizationName}</span> para confirmar
                        </label>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={organizationName}
                            className="rounded-xl border-2 focus:border-red-500/40"
                            disabled={isLoading}
                        />
                    </div>
                </div>

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
                        onClick={handleDelete}
                        disabled={!isConfirmed || isLoading}
                        className="rounded-2xl font-black text-[10px] uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 px-8 disabled:opacity-30"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            "Eliminar Permanentemente"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
