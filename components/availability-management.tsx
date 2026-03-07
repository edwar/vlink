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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold font-display">Horario Semanal</h3>
                    <p className="text-sm text-muted-foreground mt-1">Define tus horas de trabajo recurrentes para que tus clientes puedan agendar.</p>
                </div>

                <div className="grid gap-3">
                    {DAYS.map((day) => {
                        const dayState = recurringDays.find(d => d.dayId === day.id)
                        const active = dayState?.active || false
                        const start = dayState?.start || "09:00"
                        const end = dayState?.end || "17:00"

                        return (
                            <div
                                key={day.id}
                                className={cn(
                                    "group relative flex flex-col xl:flex-row xl:items-center justify-between w-full p-4 sm:p-5 rounded-4xl border transition-all duration-300 gap-5 xl:gap-8 overflow-hidden",
                                    active
                                        ? "bg-card border-primary/20 shadow-sm"
                                        : "bg-muted/5 border-transparent opacity-60 hover:opacity-100 hover:bg-muted/10 transition-all"
                                )}
                            >
                                {/* Day Selector Section */}
                                <div className="flex items-center justify-between xl:justify-start gap-4 xl:min-w-[140px] select-none">
                                    <div
                                        className="flex items-center gap-4 cursor-pointer"
                                        onClick={() => toggleDay(day.id)}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                            active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 rotate-0" : "bg-muted text-muted-foreground -rotate-12"
                                        )}>
                                            <Checkbox
                                                checked={active}
                                                onCheckedChange={() => toggleDay(day.id)}
                                                className="hidden"
                                            />
                                            {active ? <CheckCircle2 className="h-6 w-6 animate-in zoom-in duration-300" /> : <Clock className="h-6 w-6 opacity-30" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "font-black text-xl tracking-tight transition-colors leading-none",
                                                active ? "text-foreground" : "text-muted-foreground/30"
                                            )}>
                                                {day.name}
                                            </span>
                                            {!active && (
                                                <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-tighter mt-1">Descanso</span>
                                            )}
                                        </div>
                                    </div>

                                    {!active && (
                                        <div className="xl:hidden flex items-center gap-2 px-3 py-1 bg-muted/20 border border-muted-foreground/10 rounded-full animate-in fade-in zoom-in duration-500">
                                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                                Cerrado
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Controls Section */}
                                <div className="flex-1 w-full flex items-center">
                                    {active ? (
                                        <div className="flex flex-col xl:flex-row xl:items-center justify-between w-full gap-5 animate-in fade-in slide-in-from-left-4 duration-500">
                                            {/* Hours Selection */}
                                            <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-2xl w-full xl:w-fit group-hover:bg-muted-foreground/5 transition-colors">
                                                <div className="flex-1 xl:w-28">
                                                    <Input
                                                        type="time"
                                                        value={start}
                                                        onChange={(e) => updateTime(day.id, 'start', e.target.value)}
                                                        className="w-full bg-background border-none h-11 text-sm font-black rounded-xl text-center shadow-xs focus-visible:ring-primary/20 appearance-none"
                                                    />
                                                </div>
                                                <div className="w-6 flex justify-center">
                                                    <span className="text-xs font-black text-muted-foreground/30 uppercase">a</span>
                                                </div>
                                                <div className="flex-1 xl:w-28">
                                                    <Input
                                                        type="time"
                                                        value={end}
                                                        onChange={(e) => updateTime(day.id, 'end', e.target.value)}
                                                        className="w-full bg-background border-none h-11 text-sm font-black rounded-xl text-center shadow-xs focus-visible:ring-primary/20 appearance-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Lunch Settings */}
                                            <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:pl-10 xl:border-l-2 xl:border-primary/10">
                                                <div
                                                    className="flex items-center gap-3 cursor-pointer group/lunch shrink-0 touch-none py-1"
                                                    onClick={() => toggleLunch(day.id)}
                                                >
                                                    <div className={cn(
                                                        "h-6 w-6 rounded-lg border-2 transition-all flex items-center justify-center",
                                                        dayState?.lunchActive ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20" : "border-muted-foreground/20"
                                                    )}>
                                                        {dayState?.lunchActive && <CheckCircle2 className="h-4 w-4 stroke-4" />}
                                                    </div>
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest transition-colors",
                                                        dayState?.lunchActive ? "text-primary" : "text-muted-foreground/40"
                                                    )}>
                                                        Almuerzo
                                                    </span>
                                                </div>

                                                {dayState?.lunchActive && (
                                                    <div className="flex items-center gap-2 animate-in slide-in-from-right-2 fade-in duration-300 w-full xl:w-fit">
                                                        <Input
                                                            type="time"
                                                            value={dayState?.lunchStart}
                                                            onChange={(e) => updateTime(day.id, 'lunchStart', e.target.value)}
                                                            className="flex-1 xl:w-24 bg-primary/5 border-none h-10 text-xs font-black rounded-xl text-center shadow-xs focus-visible:ring-primary/10"
                                                        />
                                                        <span className="text-[10px] font-black text-primary/30 uppercase shrink-0 px-1">a</span>
                                                        <Input
                                                            type="time"
                                                            value={dayState?.lunchEnd}
                                                            onChange={(e) => updateTime(day.id, 'lunchEnd', e.target.value)}
                                                            className="flex-1 xl:w-24 bg-primary/5 border-none h-10 text-xs font-black rounded-xl text-center shadow-xs focus-visible:ring-primary/10"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="hidden xl:flex items-center justify-end w-full group-hover:px-4 transition-all duration-500">
                                            <div className="h-px flex-1 bg-linear-to-r from-transparent via-muted-foreground/10 to-transparent" />
                                            <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] ml-4 bg-muted/10 px-4 py-1.5 rounded-full border border-dashed border-muted-foreground/10">
                                                Día Cerrado
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            <section className="space-y-6 pb-20">
                <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold font-display">Bloqueos Especiales</h3>
                        <p className="text-sm text-muted-foreground mt-1">Días específicos que no estarás disponible (vacaciones, citas, etc.)</p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setShowBlockModal(true)}
                        className="w-full md:w-auto h-12 rounded-xl font-bold active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Añadir Bloqueo
                    </Button>
                </div>

                {specialBlocks.length > 0 ? (
                    <div className="grid gap-3">
                        {specialBlocks.map((block) => (
                            <div key={block.id} className="flex items-center justify-between p-4 bg-card border rounded-2xl shadow-sm animate-in slide-in-from-left-4 duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="bg-red-50 text-red-600 p-2 rounded-xl">
                                        <CalendarIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{format(new Date(block.specificDate), "EEEE, d 'de' MMMM", { locale: es })}</p>
                                        <p className="text-sm text-muted-foreground">{block.startTime} a {block.endTime}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteBlock(block.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No tienes bloqueos configurados."
                        description="Los bloqueos son días específicos en los que no estarás disponible para citas."
                        icon={CalendarOff}
                    />
                )}
            </section>

            <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold font-display">Nuevo Bloqueo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div>
                            <label htmlFor="block-date" className="block text-sm font-bold mb-2">Fecha</label>
                            <Input
                                id="block-date"
                                type="date"
                                value={newBlock.date}
                                onChange={(e) => setNewBlock(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full bg-muted/30 focus:border-primary rounded-xl px-4 py-3 outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="block-start" className="block text-sm font-bold mb-2">Desde</label>
                                <Input
                                    id="block-start"
                                    type="time"
                                    value={newBlock.start}
                                    onChange={(e) => setNewBlock(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full bg-muted/30 focus:border-primary rounded-xl px-4 py-3 outline-none transition-all [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="block-end" className="block text-sm font-bold mb-2">Hasta</label>
                                <Input
                                    id="block-end"
                                    type="time"
                                    value={newBlock.end}
                                    onChange={(e) => setNewBlock(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full bg-muted/30 focus:border-primary rounded-xl px-4 py-3 outline-none transition-all [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex w-full gap-3 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setShowBlockModal(false)}
                            className="flex-1 rounded-xl border-2 font-bold h-12"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddBlock}
                            disabled={!newBlock.date || saving}
                            className="flex-1 rounded-xl font-bold h-12 shadow-lg"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : "Añadir"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="fixed md:sticky bottom-0 md:bottom-10 left-0 right-0 p-4 md:p-0 bg-linear-to-t from-background via-background/90 to-transparent md:from-transparent md:to-transparent z-30 flex justify-center md:justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                        "w-full md:w-auto h-12 px-10 rounded-2xl font-bold text-sm tracking-tight duration-500 hover:scale-[1.02] transition-all active:scale-95 overflow-hidden shadow-xl",
                        success
                            ? "bg-secondary text-secondary-foreground ring-4 ring-secondary/20 hover:bg-secondary/90 shadow-secondary/20"
                            : "bg-primary text-primary-foreground hover:shadow-primary/30 hover:-translate-y-0.5"
                    )}
                >
                    <div className="flex items-center gap-3 relative">
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : success ? (
                            <CheckCircle2 className="h-5 w-5 animate-in zoom-in duration-300 fill-secondary-foreground/10" />
                        ) : (
                            <Save className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                        )}
                        <span className="animate-in fade-in slide-in-from-right-2 duration-300 flex items-center">
                            {saving ? "Guardando..." : success ? "¡Guardado con éxito!" : "Guardar cambios"}
                        </span>
                    </div>
                </Button>
            </div>
        </div >
    )
}
