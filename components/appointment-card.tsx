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
import { RescheduleDialog } from "@/components/reschedule-dialog"
import { AppointmentNotesDialog } from "@/components/appointment-notes-dialog"
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
        <div className="p-4 sm:p-5 bg-transparent border border-dashed border-border/60 rounded-4xl flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 hover:bg-primary/5 hover:border-primary/20 transition-all group overflow-hidden relative">
            {/* Top Right Date Badge (Mobile Context) */}
            {showDate && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 border-l-2 border-b-2 border-primary/5 rounded-bl-3xl flex flex-col items-center justify-center md:hidden">
                    <span className="text-sm font-black text-primary leading-none">
                        {format(new Date(appt.startTime), "d")}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 mt-1">
                        {format(new Date(appt.startTime), "MMM", { locale: es })}
                    </span>
                </div>
            )}

            <div className="flex items-center gap-2 sm:gap-6">
                <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center text-xl font-black text-primary shrink-0">
                    {appt.clientName.charAt(0)}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black tracking-tight leading-none truncate pr-16 md:pr-0">
                            {appt.clientName}
                        </h3>
                        {showDate && (
                            <span className="hidden md:inline-flex text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary px-2.5 py-1 rounded-xl border border-primary/10">
                                {format(new Date(appt.startTime), "d MMM", { locale: es })}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground/80">
                        <div className="flex items-center gap-1.5 font-bold">
                            <Clock className="h-3.5 w-3.5 text-primary/60" />
                            <span>{format(new Date(appt.startTime), "HH:mm")} - {format(new Date(appt.endTime), "HH:mm")}</span>
                        </div>
                        {appt.service && (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:block h-3 w-px bg-border" />
                                <div className="flex items-center gap-1.5 font-bold">
                                    <Briefcase className="h-3.5 w-3.5 text-primary/60" />
                                    <span className="truncate max-w-[120px] sm:max-w-none">{appt.service.name}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                        $ {(appt.service.price ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-border/50 md:mt-0">
                <Link
                    href={`https://wa.me/${appt.clientPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    className="h-12 flex-1 md:flex-none px-6 bg-transparent text-primary rounded-2xl flex items-center justify-center font-bold text-sm border-2 border-primary/20 hover:bg-primary/10 transition-all"
                >
                    WhatsApp
                </Link>

                {appt.status !== "CANCELLED" && (
                    <RescheduleDialog appt={{
                        id: appt.id,
                        clientName: appt.clientName,
                        startTime: appt.startTime,
                        profile: { username: appt.profile?.username ?? appt.profileId },
                        service: appt.service ?? null,
                    }} />
                )}

                <AppointmentNotesDialog
                    apptId={appt.id}
                    clientName={appt.clientName}
                    initialNotes={appt.notes ?? null}
                />

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="h-12 w-12 bg-red-500/5 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group/btn shrink-0 border border-red-500/10"
                            title="Cancelar cita"
                        >
                            <XCircle className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-lg max-w-md">
                        <DialogHeader className="pt-4">
                            <div className="h-16 w-16 bg-primary-foreground rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            <DialogTitle className="text-2xl font-display font-black tracking-tight text-center sm:text-left">
                                ¿Cancelar esta cita?
                            </DialogTitle>
                            <DialogDescription className="text-base text-center sm:text-left">
                                Estás a punto de cancelar la cita de <span className="font-bold text-foreground">{appt.clientName}</span> para el día <span className="font-bold text-foreground">{format(new Date(appt.startTime), "d 'de' MMMM", { locale: es })}</span>. Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex w-full gap-3 sm:flex-row pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 rounded-2xl border-border/50 font-bold h-12"
                                disabled={isPending}
                            >
                                Mantener cita
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleCancel}
                                className="flex-1 rounded-2xl font-bold h-12 shadow-[none]"
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
