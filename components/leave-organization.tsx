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
                <Button size="sm"
                    variant="ghost"
                    className="px-4 text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all font-bold text-2xs uppercase tracking-widest gap-2 flex items-center"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Abandonar Organización
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-8">
                <DialogHeader className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <DialogTitle>
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
                        className="font-black text-2xs uppercase tracking-widest"
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleLeave}
                        className="font-black text-2xs uppercase tracking-widest bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 px-8"
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
