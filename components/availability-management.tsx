"use client"

import { useState, useEffect } from "react"
import { Clock, Plus, Trash2, Loader2, Save, CheckCircle2, CalendarOff, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Checkbox } from "./ui/checkbox"
import { getAvailability, updateAvailability } from "@/app/actions/availability"
import { cn } from "@/lib/utils"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { sileo } from "sileo"
import { LoadingState } from "./loading-state"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { EmptyState } from "@/components/empty-state"

const DAYS = [
    { name: "Lunes", id: 1 },
    { name: "Martes", id: 2 },
    { name: "Miércoles", id: 3 },
    { name: "Jueves", id: 4 },
    { name: "Viernes", id: 5 },
    { name: "Sábado", id: 6 },
    { name: "Domingo", id: 0 },
]

export function AvailabilityManagement() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [specialBlocks, setSpecialBlocks] = useState<any[]>([])
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [newBlock, setNewBlock] = useState({ date: "", start: "09:00", end: "17:00" })
    const [recurringDays, setRecurringDays] = useState<{ dayId: number, start: string, end: string, active: boolean, lunchStart: string, lunchEnd: string, lunchActive: boolean }[]>([
        { dayId: 1, start: "09:00", end: "17:00", active: true, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: true },
        { dayId: 2, start: "09:00", end: "17:00", active: true, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: true },
        { dayId: 3, start: "09:00", end: "17:00", active: true, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: true },
        { dayId: 4, start: "09:00", end: "17:00", active: true, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: true },
        { dayId: 5, start: "09:00", end: "17:00", active: true, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: true },
        { dayId: 6, start: "09:00", end: "17:00", active: false, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: false },
        { dayId: 0, start: "09:00", end: "17:00", active: false, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: false },
    ])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAvailability()
                if (data && data.length > 0) {
                    // Map database data to our state
                    const newDays = DAYS.map(day => {
                        const workingRecord = data.find((d: any) => d.dayOfWeek === day.id && d.specificDate === null && !d.isBlocked)
                        const lunchRecord = data.find((d: any) => d.dayOfWeek === day.id && d.specificDate === null && d.isBlocked)

                        return {
                            dayId: day.id,
                            start: workingRecord?.startTime || "09:00",
                            end: workingRecord?.endTime || "17:00",
                            active: !!workingRecord,
                            lunchStart: lunchRecord?.startTime || "13:00",
                            lunchEnd: lunchRecord?.endTime || "14:00",
                            lunchActive: !!lunchRecord
                        }
                    })
                    setRecurringDays(newDays)

                    // Set special blocks
                    setSpecialBlocks(data.filter((d: any) => d.specificDate !== null))
                }
            } catch (error) {
                console.error("Error fetching availability:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        setSuccess(false)
        try {
            const payload: any[] = []

            recurringDays.forEach(d => {
                if (d.active) {
                    payload.push({
                        dayOfWeek: d.dayId,
                        startTime: d.start,
                        endTime: d.end,
                        isBlocked: false
                    })

                    if (d.lunchActive) {
                        payload.push({
                            dayOfWeek: d.dayId,
                            startTime: d.lunchStart,
                            endTime: d.lunchEnd,
                            isBlocked: true
                        })
                    }
                }
            })

            await updateAvailability(payload)
            sileo.success({
                title: "Configuración guardada",
                description: "Tus horarios han sido actualizados exitosamente.",
                styles: {
                    title: "text-green-600! font-bold!",
                    badge: "text-green-600!"
                }
            })
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            console.error("Error saving availability:", error)
            sileo.error({
                title: "Error al guardar",
                description: "No se pudieron actualizar tus horarios. Intenta de nuevo."
            })
        } finally {
            setSaving(false)
        }
    }

    const toggleDay = (dayId: number) => {
        setRecurringDays(prev => prev.map(d =>
            d.dayId === dayId ? { ...d, active: !d.active } : d
        ))
    }

    const updateTime = (dayId: number, field: 'start' | 'end' | 'lunchStart' | 'lunchEnd', value: string) => {
        setRecurringDays(prev => prev.map(d =>
            d.dayId === dayId ? { ...d, [field]: value } : d
        ))
    }

    const toggleLunch = (dayId: number) => {
        setRecurringDays(prev => prev.map(d =>
            d.dayId === dayId ? { ...d, lunchActive: !d.lunchActive } : d
        ))
    }

    const handleAddBlock = async () => {
        if (!newBlock.date) return
        setSaving(true)
        try {
            const { addSpecialBlock } = await import("@/app/actions/availability")
            await addSpecialBlock({
                specificDate: new Date(newBlock.date),
                startTime: newBlock.start,
                endTime: newBlock.end,
                isBlocked: true
            })
            const data = await getAvailability()
            setSpecialBlocks(data.filter((d: any) => d.specificDate !== null))
            setShowBlockModal(false)
            setNewBlock({ date: "", start: "09:00", end: "17:00" })
            sileo.success({
                title: "Bloqueo añadido",
                description: "El día de indisponibilidad ha sido registrado."
            })
        } catch (error) {
            console.error("Error adding special block:", error)
            sileo.error({
                title: "Error al añadir",
                description: "No se pudo registrar el bloqueo especial."
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteBlock = async (id: string) => {
        setSaving(true)
        try {
            // We haven't created a specific delete action, but we could use a general update or just add a delete action.
            // For now, let's assume we need to add it to availability.ts or use updateAvailability if it handled deletions.
            // Actually, better to add a simple deleteSpecialBlock action.
            const { deleteAvailability } = await import("@/app/actions/availability")
            await deleteAvailability(id)
            const data = await getAvailability()
            setSpecialBlocks(data.filter((d: any) => d.specificDate !== null))
            sileo.success({
                title: "Bloqueo eliminado",
                description: "El horario vuelve a estar disponible."
            })
        } catch (error) {
            console.error("Error deleting special block:", error)
            sileo.error({
                title: "Error al eliminar",
                description: "No se pudo eliminar el bloqueo especial."
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <LoadingState message="Cargando tu configuración..." fullPage={false} />
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section id="tour-weekly-schedule" className="relative space-y-8">
                <div id="tour-weekly-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                <div className="px-2">
                    <h3 className="text-2xl font-black font-display tracking-tight">Horario Semanal</h3>
                    <p className="text-muted-foreground font-medium mt-1">Define tus horas de trabajo recurrentes para que tus clientes puedan agendar.</p>
                </div>

                <div className="grid gap-4">
                    {DAYS.map((day) => {
                        const dayState = recurringDays.find(d => d.dayId === day.id)
                        const active = dayState?.active || false
                        const start = dayState?.start || "09:00"
                        const end = dayState?.end || "17:00"

                        return (
                            <div
                                key={day.id}
                                className={cn(
                                    "group relative flex flex-col xl:flex-row xl:items-center justify-between w-full p-6 sm:p-7 rounded-4xl transition-all duration-300 gap-6 xl:gap-8 overflow-hidden",
                                    active
                                        ? "bg-surface border border-border/40 shadow-none"
                                        : "bg-muted/5 border border-dashed border-border/30 opacity-60 hover:opacity-100"
                                )}
                            >
                                {/* Day Selector Section */}
                                <div className="flex items-center justify-between xl:justify-start gap-6 xl:min-w-[180px] select-none">
                                    <div
                                        className="flex items-center gap-5 cursor-pointer"
                                        onClick={() => toggleDay(day.id)}
                                    >
                                        <div className={cn(
                                            "h-14 w-14 flex items-center justify-center transition-all duration-500 ring-offset-background",
                                            active 
                                                ? "bg-primary text-primary-foreground rounded-2xl shadow-none scale-100" 
                                                : "bg-muted/40 text-muted-foreground/30 rounded-2xl grayscale scale-95 hover:scale-100"
                                        )}>
                                            {active ? <CheckCircle2 className="h-7 w-7 animate-in zoom-in duration-300" /> : <Clock className="h-7 w-7 opacity-40" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "font-black text-2xl tracking-tighter transition-colors leading-none",
                                                active ? "text-foreground" : "text-muted-foreground/40"
                                            )}>
                                                {day.name}
                                            </span>
                                            {active ? (
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                                    Abierto
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest mt-1.5">Descanso</span>
                                            )}
                                        </div>
                                    </div>

                                    {!active && (
                                        <div className="xl:hidden px-4 py-1.5 bg-muted/20 border border-muted-foreground/10 rounded-full">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                                Inactivo
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Controls Section */}
                                <div className="flex-1 w-full flex items-center">
                                    {active ? (
                                        <div className="flex flex-col xl:flex-row xl:items-center justify-between w-full gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                            {/* Hours Selection */}
                                            <div className="flex items-center gap-3 bg-muted/20 p-2 rounded-2xl w-full xl:w-fit border border-border/30">
                                                <div className="flex-1 xl:w-32 relative">
                                                    <Input
                                                        type="time"
                                                        value={start}
                                                        onChange={(e) => updateTime(day.id, 'start', e.target.value)}
                                                        className="w-full bg-background border-none h-12 text-sm font-black rounded-xl text-center shadow-none focus-visible:ring-0 focus-visible:bg-muted/30 transition-all cursor-pointer"
                                                    />
                                                </div>
                                                <div className="px-1">
                                                    <span className="text-[11px] font-black tracking-widest text-muted-foreground/40 uppercase">hasta</span>
                                                </div>
                                                <div className="flex-1 xl:w-32 relative">
                                                    <Input
                                                        type="time"
                                                        value={end}
                                                        onChange={(e) => updateTime(day.id, 'end', e.target.value)}
                                                        className="w-full bg-background border-none h-12 text-sm font-black rounded-xl text-center shadow-none focus-visible:ring-0 focus-visible:bg-muted/30 transition-all cursor-pointer"
                                                    />
                                                </div>
                                            </div>

                                            {/* Lunch Settings */}
                                            <div className="flex flex-col xl:flex-row xl:items-center gap-6 xl:pl-8 xl:border-l-2 xl:border-border/40">
                                                <div
                                                    className="flex items-center gap-4 cursor-pointer group/lunch shrink-0 py-2"
                                                    onClick={() => toggleLunch(day.id)}
                                                >
                                                    <div className={cn(
                                                        "h-8 w-14 rounded-full transition-all flex items-center p-1 relative",
                                                        dayState?.lunchActive ? "bg-primary" : "bg-muted-foreground/20"
                                                    )}>
                                                        <div className={cn(
                                                            "h-6 w-6 rounded-full bg-white shadow-none transition-transform duration-300 ease-in-out",
                                                            dayState?.lunchActive ? "translate-x-6" : "translate-x-0"
                                                        )} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={cn(
                                                            "text-[11px] font-black uppercase tracking-widest transition-colors",
                                                            dayState?.lunchActive ? "text-primary" : "text-muted-foreground/50"
                                                        )}>
                                                            Horario de Almuerzo
                                                        </span>
                                                        <span className="text-[10px] font-medium text-muted-foreground/40">Bloquea este tiempo</span>
                                                    </div>
                                                </div>

                                                {dayState?.lunchActive && (
                                                    <div className="flex items-center gap-3 animate-in slide-in-from-right-4 fade-in duration-500 w-full xl:w-fit bg-muted/20 p-2 rounded-2xl border border-border/30">
                                                        <Input
                                                            type="time"
                                                            value={dayState?.lunchStart}
                                                            onChange={(e) => updateTime(day.id, 'lunchStart', e.target.value)}
                                                            className="flex-1 xl:w-28 bg-background border-none h-11 text-xs font-black rounded-xl text-center shadow-none transition-all"
                                                        />
                                                        <span className="text-[10px] font-black text-muted-foreground/30 uppercase shrink-0">a</span>
                                                        <Input
                                                            type="time"
                                                            value={dayState?.lunchEnd}
                                                            onChange={(e) => updateTime(day.id, 'lunchEnd', e.target.value)}
                                                            className="flex-1 xl:w-28 bg-background border-none h-11 text-xs font-black rounded-xl text-center shadow-none transition-all"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="hidden xl:flex items-center justify-end w-full group-hover:px-4 transition-all duration-500">
                                            <div className="h-px flex-1 bg-linear-to-r from-transparent via-border/50 to-transparent" />
                                            <div className="ml-8 flex items-center gap-2 px-5 py-2.5 rounded-full border border-dashed border-border/60 bg-muted/5">
                                                <CalendarOff className="h-3 w-3 text-muted-foreground/30" />
                                                <span className="text-[11px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                                                    Día de Descanso
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            <section id="tour-special-blocks" className="relative space-y-8 pb-32">
                <div id="tour-special-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between px-2">
                    <div>
                        <h3 className="text-2xl font-black font-display tracking-tight">Bloqueos Especiales</h3>
                        <p className="text-muted-foreground font-medium mt-1">Días específicos que no estarás disponible (vacaciones, citas, etc.)</p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setShowBlockModal(true)}
                        className="w-full md:w-auto h-14 px-8 rounded-full font-black active:scale-95 text-[11px] uppercase tracking-widest bg-surface border border-border/40 hover:bg-muted/10 transition-all shadow-none"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Añadir Bloqueo Especial
                    </Button>
                </div>

                {specialBlocks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {specialBlocks.map((block) => (
                            <div key={block.id} className="group relative flex items-center justify-between p-6 bg-surface border border-border/40 rounded-4xl animate-in zoom-in-95 duration-300 hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="bg-red-500/10 text-red-500 rounded-2xl h-14 w-14 flex items-center justify-center shrink-0">
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-black text-lg tracking-tighter leading-none capitalize">{format(new Date(block.specificDate), "EEEE, d 'de' MMMM", { locale: es })}</p>
                                        <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest mt-2 bg-muted/20 w-fit px-2 py-0.5 rounded-md">{block.startTime} — {block.endTime}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteBlock(block.id)}
                                    className="text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full h-10 w-10 shrink-0"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 rounded-[3rem] border border-dashed border-border/40 bg-muted/5">
                        <EmptyState
                            title="Sin bloqueos especiales"
                            description="Tus vacaciones y descansos específicos aparecerán en este lugar."
                            icon={CalendarOff}
                        />
                    </div>
                )}
            </section>

            <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none overflow-hidden">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-3xl font-black font-display tracking-tighter">Nuevo Bloqueo</DialogTitle>
                        <p className="text-muted-foreground font-medium">Define una fecha y hora específica para tu descanso.</p>
                    </DialogHeader>
                    <div className="space-y-8 py-2">
                        <div className="space-y-3">
                            <label htmlFor="block-date" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Fecha del bloqueo</label>
                            <Input
                                id="block-date"
                                type="date"
                                value={newBlock.date}
                                onChange={(e) => setNewBlock(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full bg-muted/20 border-border/40 focus:bg-background rounded-2xl h-14 px-6 font-bold text-lg transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label htmlFor="block-start" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Desde las</label>
                                <Input
                                    id="block-start"
                                    type="time"
                                    value={newBlock.start}
                                    onChange={(e) => setNewBlock(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full bg-muted/20 border-border/40 focus:bg-background rounded-2xl h-14 px-4 font-bold text-lg text-center transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="block-end" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Hasta las</label>
                                <Input
                                    id="block-end"
                                    type="time"
                                    value={newBlock.end}
                                    onChange={(e) => setNewBlock(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full bg-muted/20 border-border/40 focus:bg-background rounded-2xl h-14 px-4 font-bold text-lg text-center transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-10 flex flex-row gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowBlockModal(false)}
                            className="flex-1 rounded-2xl font-black uppercase text-[11px] tracking-widest h-14 border border-border/40"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddBlock}
                            disabled={!newBlock.date || saving}
                            className="flex-1 rounded-2xl font-black uppercase text-[11px] tracking-widest h-14 shadow-none brightness-110 active:scale-95 transition-all"
                        >
                            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : "Registrar Bloqueo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="fixed md:sticky bottom-0 md:bottom-10 left-0 right-0 p-4 md:p-0 z-40 flex justify-center md:justify-end pointer-events-none">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    id="tour-save-availability"
                    className={cn(
                        "pointer-events-auto w-full md:w-auto h-16 px-12 rounded-full font-black text-[11px] uppercase tracking-widest duration-500 hover:scale-[1.05] transition-all active:scale-95 overflow-hidden shadow-none",
                        success
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-primary text-primary-foreground"
                    )}
                >
                    <div className="flex items-center gap-4 relative">
                        {saving ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : success ? (
                            <CheckCircle2 className="h-6 w-6 animate-in zoom-in duration-300" />
                        ) : (
                            <Save className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                        )}
                        <span className="animate-in fade-in slide-in-from-right-3 duration-300">
                            {saving ? "Salvando cambios..." : success ? "¡Configuración lista!" : "Guardar Disponibilidad Profesional"}
                        </span>
                    </div>
                </Button>
            </div>
        </div >
    )
}
