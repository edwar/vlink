"use client"

import { useState } from "react"
import { XCircle, Clock, Briefcase, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cancelAppointmentAction } from "@/app/actions/cancel-appointment"
import { sileo } from "sileo"

export function AppointmentCard({ appt, showDate = false }: { appt: any, showDate?: boolean }) {
    const [isPending, setIsPending] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const handleCancel = async () => {
        setIsPending(true)
        try {
            const result = await cancelAppointmentAction(appt.id)
            if (result.success) {
                sileo.success({
                    title: "Cita cancelada",
                    description: "La cita ha sido marcada como cancelada correctamente."
                })
                setIsOpen(false)
            } else {
                sileo.error({
                    title: "Error al cancelar",
                    description: result.error || "No se pudo cancelar la cita en este momento."
                })
            }
        } catch (error) {
            sileo.error({
                title: "Error de conexión",
                description: "Hubo un problema de red al intentar cancelar la cita."
            })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="p-6 bg-card border-2 border-primary/5 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
            <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center text-xl font-black text-primary border-2 border-background shadow-sm shrink-0">
                    {appt.clientName.charAt(0)}
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black tracking-tight leading-none">{appt.clientName}</h3>
                        {showDate && (
                            <span className="text-[10px] font-black uppercase tracking-tighter bg-primary/5 text-primary px-2 py-0.5 rounded">
                                {format(new Date(appt.startTime), "d MMM", { locale: es })}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(appt.startTime), "HH:mm")} - {format(new Date(appt.endTime), "HH:mm")}</span>
                        </div>
                        {appt.service && (
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1 font-medium">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{appt.service.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        $ {(appt.service.price ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href={`https://wa.me/${appt.clientPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    className="h-12 flex-1 md:flex-none px-6 bg-transparent text-primary rounded-2xl flex items-center justify-center font-bold text-sm border border-border shadow-lg hover:shadow-accent hover:scale-[1.02] active:scale-[0.98] transition-all cursor-default"
                >
                    WhatsApp
                </Link>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <button
                            className="h-12 w-12 bg-red-500/5 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group/btn shrink-0"
                            title="Cancelar cita"
                        >
                            <XCircle className="h-5 w-5" />
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader className="pt-4">
                            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto sm:mx-0">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            <DialogTitle className="text-2xl font-display font-black tracking-tight text-center sm:text-left">
                                ¿Cancelar esta cita?
                            </DialogTitle>
                            <DialogDescription className="text-base text-center sm:text-left">
                                Estás a punto de cancelar la cita de <span className="font-bold text-foreground">{appt.clientName}</span> para el día <span className="font-bold text-foreground">{format(new Date(appt.startTime), "d 'de' MMMM", { locale: es })}</span>. Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex w-full gap-3 sm:flex-row">
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl border-2 font-bold h-12"
                                disabled={isPending}
                            >
                                Mantener cita
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleCancel}
                                className="rounded-xl font-bold h-12 shadow-lg shadow-red-500/20"
                                disabled={isPending}
                            >
                                {isPending ? "Cancelando..." : "Sí, cancelar cita"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
