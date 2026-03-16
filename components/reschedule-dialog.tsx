"use client"

import { useState } from "react"
import { Calendar, Clock, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { format, addDays, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getAvailableSlots } from "@/app/actions/booking"
import { rescheduleAppointmentAction } from "@/app/actions/reschedule-appointment"
import { sileo } from "sileo"

interface RescheduleDialogProps {
    appt: {
        id: string
        clientName: string
        startTime: string | Date
        profile: { username: string }
        service?: { durationMinutes: number } | null
    }
}

const DAYS_AHEAD = 14

function buildDateRange(): Date[] {
    const today = new Date()
    return Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i + 1))
}

export function RescheduleDialog({ appt }: RescheduleDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [slots, setSlots] = useState<string[]>([])
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [saving, setSaving] = useState(false)

    const dateRange = buildDateRange()
    const durationMinutes = appt.service?.durationMinutes ?? 30

    const handleDateSelect = async (date: Date) => {
        setSelectedDate(date)
        setSelectedSlot(null)
        setSlots([])
        setLoadingSlots(true)
        try {
            const available = await getAvailableSlots(appt.profile.username, date, durationMinutes)
            setSlots(available)
        } catch {
            sileo.error({ title: "Error", description: "No se pudo cargar la disponibilidad." })
        } finally {
            setLoadingSlots(false)
        }
    }

    const handleConfirm = async () => {
        if (!selectedDate || !selectedSlot) return
        setSaving(true)
        try {
            const isoDate = selectedDate.toISOString().split("T")[0]
            const result = await rescheduleAppointmentAction(appt.id, isoDate, selectedSlot)
            if (result.success) {
                sileo.success({
                    title: "Cita reprogramada",
                    description: `La cita de ${appt.clientName} fue movida al ${format(selectedDate, "d 'de' MMMM", { locale: es })} a las ${selectedSlot}.`
                })
                setIsOpen(false)
            } else {
                sileo.error({ title: "Error", description: result.error ?? "No se pudo reprogramar la cita." })
            }
        } finally {
            setSaving(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setSelectedDate(null)
            setSlots([])
            setSelectedSlot(null)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    className="h-12 w-12 bg-blue-500/5 text-blue-500 rounded-2xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shrink-0 border border-blue-500/10"
                    title="Reprogramar cita"
                    aria-label="Reprogramar cita"
                >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>

            <DialogContent className="rounded-lg max-w-md">
                <DialogHeader className="pt-4">
                    <div className="h-16 w-16 bg-primary-foreground rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                        <RotateCcw className="h-8 w-8" />
                    </div>
                    <DialogTitle className="text-2xl font-display font-black tracking-tight text-center">
                        Reprogramar cita
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground text-center">
                        Selecciona nueva fecha y hora para <span className="font-bold text-foreground">{appt.clientName}</span>
                    </p>
                </DialogHeader>

                <div className="flex flex-col w-full gap-4 pb-2 overflow-hidden">
                    {/* Date selector */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" /> Nueva fecha
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                            {dateRange.map((date) => {
                                const isSelected = selectedDate && isSameDay(date, selectedDate)
                                return (
                                    <button
                                        key={date.toISOString()}
                                        onClick={() => handleDateSelect(date)}
                                        className={`snap-start shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95
                                            ${isSelected
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                                : "bg-card border-primary/10 hover:border-primary/30"
                                            }`}
                                    >
                                        <span className="text-[9px] uppercase tracking-widest opacity-70">
                                            {format(date, "EEE", { locale: es })}
                                        </span>
                                        <span className="text-xl font-black leading-tight">
                                            {format(date, "d")}
                                        </span>
                                        <span className="text-[9px] uppercase tracking-widest opacity-70">
                                            {format(date, "MMM", { locale: es })}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Time slot selector */}
                    {selectedDate && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Clock className="h-3 w-3" /> Horario disponible
                            </p>
                            {loadingSlots ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="h-10 bg-muted animate-pulse rounded-xl" />
                                    ))}
                                </div>
                            ) : slots.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-2xl">
                                    Sin disponibilidad para este día
                                </p>
                            ) : (
                                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`h-10 rounded-xl text-sm font-bold border-2 transition-all active:scale-95
                                                ${selectedSlot === slot
                                                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                                    : "bg-card border-primary/10 hover:border-primary/30"
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Confirm button */}
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedDate || !selectedSlot || saving}
                        className="w-full h-12 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20"
                    >
                        {saving ? "Reprogramando..." : "Confirmar reprogramación"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
