"use client"

import { useState } from "react"
import { leaveOrganization } from "@/app/actions/organization"
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
import { LogOut, Loader2, AlertTriangle } from "lucide-react"
import { sileo } from "sileo"
import { useRouter } from "next/navigation"

interface LeaveOrganizationProps {
    organizationId: string
    organizationName: string
}

export function LeaveOrganization({ organizationId, organizationName }: LeaveOrganizationProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    async function handleLeave() {
        setIsLoading(true)
        try {
            const result = await leaveOrganization(organizationId)
            if (result.success) {
                sileo.success({ title: `Has abandonado ${organizationName}` })
                setIsOpen(false)
                router.push("/dashboard")
                router.refresh()
            }
        } catch (error: any) {
            sileo.error({ title: "Error", description: error.message || "Error al abandonar la organización" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-9 px-4 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest gap-2 flex items-center"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Abandonar Organización
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-8">
                <DialogHeader className="space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-2xl font-display font-black tracking-tight uppercase text-foreground">
                        ¿Abandonar Organización?
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium leading-relaxed">
                        Estás a punto de dejar <span className="text-foreground font-bold">{organizationName}</span>.
                        Ya no tendrás acceso a la agenda de equipo ni a los recursos compartidos.
                        Podrás volver a unirte solo si recibes una nueva invitación.
                    </DialogDescription>
                </DialogHeader>
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
                        variant="destructive"
                        onClick={handleLeave}
                        className="rounded-2xl font-black text-[10px] uppercase tracking-widest bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 px-8"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Saliendo...
                            </>
                        ) : (
                            "Confirmar Salida"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
