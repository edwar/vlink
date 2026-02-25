"use client"

import { useState, useEffect } from "react"
import { Clock, Plus, Trash2, Loader2, Save, CheckCircle2, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Checkbox } from "./ui/checkbox"
import { getAvailability, updateAvailability } from "@/app/actions/availability"
import { cn } from "@/lib/utils"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { sileo } from "sileo"

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
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Cargando tu configuración...</p>
            </div>
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
                                    "flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300",
                                    active
                                        ? "bg-card border-primary/20 shadow-sm"
                                        : "bg-muted/30 border-transparent grayscale-[0.5] opacity-80"
                                )}
                            >
                                <div className="flex items-center justify-between sm:justify-start gap-4 mb-4 sm:mb-0">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <Checkbox
                                            checked={active}
                                            onCheckedChange={() => toggleDay(day.id)}
                                            aria-label={`Activar ${day.name}`}
                                        />
                                        <span className={cn(
                                            "font-semibold text-base sm:text-lg sm:min-w-[100px] transition-colors",
                                            active ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {day.name}
                                        </span>
                                    </div>
                                    {!active && (
                                        <div className="sm:hidden flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-lg">
                                            <span className="text-[10px] text-muted-foreground font-medium italic">Cerrado</span>
                                        </div>
                                    )}
                                </div>

                                {active && (
                                    <div className="flex flex-col gap-4 animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="relative group flex-1 sm:flex-initial">
                                                <Input
                                                    type="time"
                                                    value={start}
                                                    onChange={(e) => updateTime(day.id, 'start', e.target.value)}
                                                    className="w-full bg-background border-2 border-muted/50 rounded-xl px-3 sm:px-4 py-2 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                />
                                            </div>
                                            <span className="text-muted-foreground font-bold">a</span>
                                            <div className="relative group flex-1 sm:flex-initial">
                                                <Input
                                                    type="time"
                                                    value={end}
                                                    onChange={(e) => updateTime(day.id, 'end', e.target.value)}
                                                    className="w-full bg-background border-2 border-muted/50 rounded-xl px-3 sm:px-4 py-2 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-muted-foreground/10">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={dayState?.lunchActive}
                                                    onCheckedChange={() => toggleLunch(day.id)}
                                                    className="size-4 rounded"
                                                    id={`lunch-${day.id}`}
                                                />
                                                <label htmlFor={`lunch-${day.id}`} className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider cursor-pointer">
                                                    ¿Hora de Almuerzo?
                                                </label>
                                            </div>

                                            {dayState?.lunchActive && (
                                                <div className="flex items-center justify-between sm:justify-start gap-3 px-2 py-0 rounded-xl animate-in slide-in-from-left-2 duration-200">
                                                    <Input
                                                        type="time"
                                                        value={dayState.lunchStart}
                                                        onChange={(e) => updateTime(day.id, 'lunchStart', e.target.value)}
                                                        className="bg-transparent border-none px-4 text-xs font-bold outline-none focus:text-primary transition-colors text-center w-full [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                    />
                                                    <span className="text-primary/40 text-[10px] font-bold">a</span>
                                                    <Input
                                                        type="time"
                                                        value={dayState.lunchEnd}
                                                        onChange={(e) => updateTime(day.id, 'lunchEnd', e.target.value)}
                                                        className="bg-transparent border-none px-4 text-xs font-bold outline-none focus:text-primary transition-colors text-center w-full [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {!active && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl">
                                        <Clock className="h-4 w-4 text-muted-foreground/50" />
                                        <span className="text-sm text-muted-foreground font-medium italic">No disponible para citas</span>
                                    </div>
                                )}
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
                        className="w-full md:w-auto rounded-xl font-bold active:scale-95"
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
                    <div className="bg-muted/20 border-2 border-dashed border-muted rounded-3xl p-12 text-center group hover:border-primary/30 transition-colors">
                        <div className="bg-background w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            <CalendarIcon className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">No tienes bloqueos configurados.</p>
                    </div>
                )}
            </section>

            {showBlockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-card border w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
                        <h4 className="text-2xl font-bold font-display mb-6">Nuevo Bloqueo</h4>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Fecha</label>
                                <Input
                                    type="date"
                                    value={newBlock.date}
                                    onChange={(e) => setNewBlock(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full bg-muted/30 border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Desde</label>
                                    <Input
                                        type="time"
                                        value={newBlock.start}
                                        onChange={(e) => setNewBlock(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full bg-muted/30 border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none transition-all [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Hasta</label>
                                    <Input
                                        type="time"
                                        value={newBlock.end}
                                        onChange={(e) => setNewBlock(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full bg-muted/30 border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none transition-all [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowBlockModal(false)}
                                    className="flex-1 rounded-2xl text-muted-foreground font-bold"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleAddBlock}
                                    disabled={!newBlock.date || saving}
                                    className="flex-1 rounded-2xl shadow-lg shadow-primary/20 font-bold"
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : "Añadir"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed sm:sticky bottom-0 sm:bottom-6 left-0 right-0 p-4 sm:p-0 bg-background/80 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t sm:border-t-0 z-20 flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                        "w-full sm:w-auto px-10 h-14 rounded-2xl font-bold text-lg transition-all duration-500 active:scale-95 overflow-hidden",
                        success
                            ? "bg-secondary text-secondary-foreground shadow-primary/30 shadow-2xs ring-4 ring-secondary/20 hover:bg-secondary/90"
                            : "bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/40 hover:shadow-md hover:-translate-y-0.5"
                    )}
                >
                    <div className="flex items-center gap-3 relative">
                        {saving ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : success ? (
                            <CheckCircle2 className="h-5 w-5 animate-in zoom-in duration-300 fill-secondary-foreground/10" />
                        ) : (
                            <Save className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        )}
                        <span className="animate-in fade-in slide-in-from-right-2 duration-300 flex items-center">
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </span>
                    </div>
                </Button>
            </div>
        </div>
    )
}
