"use client"

import { useState } from "react"
import { XCircle, CheckCircle2, Calendar, Clock, Briefcase, AlertTriangle, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { clientCancelAppointment } from "@/app/actions/client-cancel"

interface CancelPageClientProps {
    token: string
    appointment: {
        id: string
        clientName: string
        status: string
        startTime: string
        endTime: string
        serviceName: string | null
        professionalName: string
        professionalUsername: string
    }
}

export function CancelPageClient({ appointment, token }: CancelPageClientProps) {
    const [state, setState] = useState<"idle" | "confirming" | "loading" | "done" | "error">("idle")
    const [errorMsg, setErrorMsg] = useState("")

    const startTime = new Date(appointment.startTime)
    const twoHoursBefore = new Date(startTime.getTime() - 2 * 60 * 60 * 1000)
    const isPastCutoff = new Date() > twoHoursBefore
    const isAlreadyCancelled = appointment.status === "CANCELLED"

    const handleCancel = async () => {
        setState("loading")
        const result = await clientCancelAppointment(token)
        if (result.success) {
            setState("done")
        } else {
            setErrorMsg(result.error ?? "Error desconocido")
            setState("error")
        }
    }

    // --- Success state ---
    if (state === "done") {
        return (
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">Cita cancelada</h1>
                <p className="text-muted-foreground">Tu cita ha sido cancelada exitosamente. El profesional ha sido notificado.</p>
                <Link
                    href={`/${appointment.professionalUsername}`}
                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:opacity-90 transition-all"
                >
                    Agendar nueva cita
                </Link>
            </div>
        )
    }

    // --- Error state ---
    if (state === "error") {
        return (
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">No se pudo cancelar</h1>
                <p className="text-muted-foreground">{errorMsg}</p>
                <Link
                    href={`/${appointment.professionalUsername}`}
                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-card border-2 border-primary/10 text-foreground rounded-2xl font-bold text-sm hover:border-primary/30 transition-all"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al perfil
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Appointment card */}
            <div className="bg-card border-2 border-primary/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center text-lg font-black text-primary border-2 border-background shadow-sm">
                        {appointment.clientName.charAt(0)}
                    </div>
                    <div>
                        <p className="font-black text-lg leading-tight">{appointment.clientName}</p>
                        <p className="text-sm text-muted-foreground font-medium">con {appointment.professionalName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold">
                        <Calendar className="h-4 w-4 text-primary/60 shrink-0" />
                        {format(startTime, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-bold">
                        <Clock className="h-4 w-4 text-primary/60 shrink-0" />
                        {format(startTime, "HH:mm")} — {format(new Date(appointment.endTime), "HH:mm")}
                    </div>
                    {appointment.serviceName && (
                        <div className="flex items-center gap-2 text-muted-foreground font-bold">
                            <Briefcase className="h-4 w-4 text-primary/60 shrink-0" />
                            {appointment.serviceName}
                        </div>
                    )}
                </div>
            </div>

            {/* Already cancelled */}
            {isAlreadyCancelled && (
                <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-amber-800 dark:text-amber-300 font-medium">Esta cita ya fue cancelada anteriormente.</p>
                </div>
            )}

            {/* Past cutoff warning */}
            {!isAlreadyCancelled && isPastCutoff && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-800 dark:text-red-300 font-medium">
                        Ya no puedes cancelar en línea (menos de 2 horas para la cita). Contacta al profesional directamente.
                    </p>
                </div>
            )}

            {/* Actions */}
            {!isAlreadyCancelled && !isPastCutoff && (
                <>
                    {state === "idle" && (
                        <button
                            onClick={() => setState("confirming")}
                            className="w-full h-13 py-3.5 bg-red-500/5 text-red-600 font-bold text-sm rounded-2xl border-2 border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-[0.98]"
                        >
                            Cancelar mi cita
                        </button>
                    )}

                    {state === "confirming" && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                            <p className="text-sm text-center text-muted-foreground font-medium">
                                ¿Confirmas la cancelación? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setState("idle")}
                                    className="flex-1 h-12 bg-card border-2 border-primary/10 font-bold text-sm rounded-2xl hover:border-primary/30 transition-all"
                                >
                                    Mantener cita
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 h-12 bg-red-500 text-white font-bold text-sm rounded-2xl hover:bg-red-600 transition-all active:scale-[0.98] shadow-lg shadow-red-500/20"
                                >
                                    Sí, cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <Link
                href={`/${appointment.professionalUsername}`}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al perfil de {appointment.professionalName}
            </Link>
        </div>
    )
}
