"use client"

import { useState, useEffect } from "react"
import { Clock, Plus, Trash2, Loader2, Save, CheckCircle2, CalendarOff, Calendar as CalendarIcon, MapPinned } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Checkbox } from "./ui/checkbox"
import { getAvailability, updateAvailability, addSpecialBlock, deleteAvailability } from "@/app/actions/availability"
import { cn, getBogotaISO } from "@/lib/utils"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { sileo } from "sileo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
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

function parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

export function AvailabilityManagement() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [specialBlocks, setSpecialBlocks] = useState<any[]>([])
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [locations, setLocations] = useState<{ id: string, name: string }[]>([])
    const [newBlock, setNewBlock] = useState({ date: "", start: "09:00", end: "17:00", locationId: "" })
    const [selectedLocationId, setSelectedLocationId] = useState<string>("")
    const [allRecurringData, setAllRecurringData] = useState<Map<string, typeof recurringDays>>(new Map())
    const [recurringDays, setRecurringDays] = useState<{ dayId: number, start: string, end: string, active: boolean, lunchStart: string, lunchEnd: string, lunchActive: boolean, locationId: string }[]>([
        { dayId: 1, start: "09:00", end: "17:00", active: true, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: true, locationId: "" },
        { dayId: 2, start: "09:00", end: "17:00", active: true, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: true, locationId: "" },
        { dayId: 3, start: "09:00", end: "17:00", active: true, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: true, locationId: "" },
        { dayId: 4, start: "09:00", end: "17:00", active: true, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: true, locationId: "" },
        { dayId: 5, start: "09:00", end: "17:00", active: true, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: true, locationId: "" },
        { dayId: 6, start: "09:00", end: "17:00", active: false, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: false, locationId: "" },
        { dayId: 0, start: "09:00", end: "17:00", active: false, lunchStart: "13:00", lunchEnd: "14:00", lunchActive: false, locationId: "" },
    ])

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch locations first
                const { getOrganizationLocations } = await import("@/app/actions/locations")
                const organizations = await (await import("@/app/actions/organization")).getUserOrganizations()
                if (organizations[0]) {
                    const locs = await getOrganizationLocations(organizations[0].id)
                    setLocations(locs)
                    if (locs.length > 0) {
                        setNewBlock(prev => ({ ...prev, locationId: locs[0].id }))
                    }
                }

                const dataMap = new Map<string, typeof recurringDays>()
                const data = await getAvailability()

                if (data && data.length > 0) {
                    const recurringData = data.filter((d: any) => d.specificDate === null)

                    // Group data by locationId
                    const locIds = Array.from(new Set(recurringData.map((d: any) => d.locationId || ""))) as string[]

                    locIds.forEach(locId => {
                        const dayData = DAYS.map(day => {
                            const workingRecord = recurringData.find((d: any) => d.dayOfWeek === day.id && d.locationId === (locId || null) && !d.isBlocked)
                            const lunchRecord = recurringData.find((d: any) => d.dayOfWeek === day.id && d.locationId === (locId || null) && d.isBlocked)

                            return {
                                dayId: day.id,
                                start: workingRecord?.startTime || "09:00",
                                end: workingRecord?.endTime || "17:00",
                                active: !!workingRecord,
                                lunchStart: lunchRecord?.startTime || "13:00",
                                lunchEnd: lunchRecord?.endTime || "14:00",
                                lunchActive: !!lunchRecord,
                                locationId: locId
                            }
                        })
                        dataMap.set(locId, dayData)
                    })

                    setAllRecurringData(dataMap)

                    // Determine which location to show first
                    const firstLocId = locations[0]?.id || (locIds.length > 0 ? locIds[0] : "")
                    setSelectedLocationId(firstLocId)

                    const currentDays = dataMap.get(firstLocId)
                    if (currentDays) {
                        setRecurringDays(currentDays)
                    }

                    // Set special blocks
                    setSpecialBlocks(data.filter((d: any) => d.specificDate !== null))
                } else if (locations.length > 0) {
                    setSelectedLocationId(locations[0].id)
                    setNewBlock(prev => ({ ...prev, locationId: locations[0].id }))
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

            // Merge all data from the map (other locations) with current state (current location)
            const allSchedules = new Map(allRecurringData)
            allSchedules.set(selectedLocationId, recurringDays)

            Array.from(allSchedules.values()).forEach(schedule => {
                schedule.forEach(d => {
                    if (d.active) {
                        payload.push({
                            dayOfWeek: d.dayId,
                            startTime: d.start,
                            endTime: d.end,
                            isBlocked: false,
                            locationId: d.locationId || null
                        })

                        if (d.lunchActive) {
                            payload.push({
                                dayOfWeek: d.dayId,
                                startTime: d.lunchStart,
                                endTime: d.lunchEnd,
                                isBlocked: true,
                                locationId: d.locationId || null
                            })
                        }
                    }
                })
            })

            const result = await updateAvailability(payload)
            
            if (result && !result.success) {
                sileo.error({
                    title: "Error al guardar",
                    description: result.error || "No se pudo actualizar la disponibilidad.",
                })
                return
            }

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
        } catch (error: any) {
            console.error("Error saving availability:", error)
            const message = error instanceof Error ? error.message : "No se pudieron actualizar tus horarios. Intenta de nuevo."
            sileo.error({
                title: "Error de configuración",
                description: message
            })
        } finally {
            setSaving(false)
        }
    }

    const switchLocation = (newLocId: string) => {
        // Save current state to map
        setAllRecurringData(prev => {
            const next = new Map(prev)
            next.set(selectedLocationId, recurringDays)
            return next
        })

        // Load new state from map or default
        setSelectedLocationId(newLocId)
        const loadedData = allRecurringData.get(newLocId)
        if (loadedData) {
            setRecurringDays(loadedData)
        } else {
            // Default blank schedule for new/empty location
            setRecurringDays(DAYS.map(day => ({
                dayId: day.id,
                start: "09:00",
                end: "17:00",
                active: false,
                lunchStart: "13:00",
                lunchEnd: "14:00",
                lunchActive: false,
                locationId: newLocId
            })))
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
            const result = await addSpecialBlock({
                specificDate: new Date(`${newBlock.date}T00:00:00-05:00`),
                startTime: newBlock.start,
                endTime: newBlock.end,
                isBlocked: true,
                locationId: newBlock.locationId || null
            } as any)

            if (result && !result.success) {
                sileo.error({
                    title: "Error al añadir",
                    description: result.error || "No se pudo registrar el bloqueo especial."
                })
                return
            }

            const data = await getAvailability()
            setSpecialBlocks(data.filter((d: any) => d.specificDate !== null))
            setShowBlockModal(false)
            setNewBlock({ date: "", start: "09:00", end: "17:00", locationId: locations[0]?.id || "" })
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
            const result = await deleteAvailability(id)

            if (result && !result.success) {
                sileo.error({
                    title: "Error al eliminar",
                    description: result.error || "No se pudo eliminar el bloqueo."
                })
                return
            }

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
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section id="tour-weekly-schedule" className="relative space-y-8">
                <div id="tour-weekly-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                <div className="flex flex-col w-full">
                    <h3 className="text-2xl font-black font-display tracking-tight">Horario Semanal</h3>
                    <p className="text-muted-foreground font-medium mt-1">Define tus horas de trabajo recurrentes para que tus clientes puedan agendar.</p>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-muted/20 p-6 rounded-[2.5rem] border border-border/40">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                        <MapPinned className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 flex-1">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sede Actual</p>
                        <p className="text-sm font-medium text-foreground/70 leading-relaxed max-w-md">
                            Estás configurando el horario recurrente para esta ubicación específica.
                        </p>
                    </div>
                    <div className="w-full md:w-80">
                        <Select
                            value={selectedLocationId || "none"}
                            onValueChange={(value) => switchLocation(value === "none" ? "" : value)}
                        >
                            <SelectTrigger className="w-full h-14 rounded-2xl bg-background border-border/40 px-6 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer hover:border-primary/30 transition-all text-foreground">
                                <SelectValue placeholder="Seleccionar Sede" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="rounded-2xl border-border/40 shadow-2xl">
                                <SelectItem value="none" className="font-black py-3 rounded-xl">Sin Sede (Ubicación General)</SelectItem>

                                {locations.map(loc => (
                                    <SelectItem key={loc.id} value={loc.id} className="font-black py-3 rounded-xl">
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Conflict Warning */}
                {(() => {
                    const daysWithConflicts: { dayId: number, dayName: string }[] = []

                    // Solo validamos si hay una sede seleccionada
                    if (!selectedLocationId) return null;

                    // Con estas dos líneas unimos lo que está en memoria (otras sedes) 
                    // con lo que estamos viendo ahora (sede actual) para validar todo.
                    const allSchedules = new Map(allRecurringData)
                    allSchedules.set(selectedLocationId, recurringDays)

                    DAYS.forEach(day => {
                        const slots: { locId: string, start: number, end: number }[] = []
                        allSchedules.forEach((schedule, locId) => {
                            const d = schedule.find(s => s.dayId === day.id)
                            if (d?.active) {
                                slots.push({ locId, start: parseTimeToMinutes(d.start), end: parseTimeToMinutes(d.end) })
                            }
                        })

                        // Detectamos solapamiento entre cualquier par de sedes en el mismo día
                        for (let i = 0; i < slots.length; i++) {
                            for (let j = i + 1; j < slots.length; j++) {
                                const a = slots[i], b = slots[j]
                                if (a.start < b.end && a.end > b.start) {
                                    if (!daysWithConflicts.some(c => c.dayId === day.id)) {
                                        daysWithConflicts.push({ dayId: day.id, dayName: day.name })
                                    }
                                }
                            }
                        }
                    })

                    if (daysWithConflicts.length === 0) return null

                    return (
                        <div className="flex flex-col gap-3 bg-red-500/10 border border-red-500/20 p-6 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-3 text-red-600">
                                <div className="h-10 w-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-black uppercase text-xs tracking-widest">Conflicto de Sedes Detectado</h4>
                                    <p className="text-sm font-medium opacity-80 leading-tight">Tienes horarios que se cruzan en diferentes ubicaciones el mismo día.</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {daysWithConflicts.map(c => (
                                    <span key={c.dayId} className="px-4 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-500/20">
                                        {c.dayName}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[11px] font-bold text-red-500/60 mt-3 px-1 italic">
                                * No puedes estar en dos lugares al mismo tiempo. Ajusta los horarios antes de guardar.
                            </p>
                        </div>
                    )
                })()}

                {selectedLocationId ? (
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
                                        "bg-linear-to-br from-primary/5 via-transparent to-transparent group relative flex flex-col xl:flex-row xl:items-center justify-between w-full px-2 py-6 sm:py-7 rounded-4xl transition-all duration-300 gap-6 xl:gap-8 overflow-hidden",
                                        active
                                            ? "border border-border/40 shadow-none"
                                            : "border border-dashed border-border/30 opacity-60 hover:opacity-100"
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
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/40 rounded-[3rem] bg-muted/5 animate-in fade-in zoom-in duration-500">
                        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
                            <MapPinned className="h-10 w-10" />
                        </div>
                        <h4 className="text-xl font-black font-display tracking-tight text-foreground">Selecciona una sede</h4>
                        <p className="text-muted-foreground font-medium mt-2 text-center max-w-xs">
                            Para configurar tu disponibilidad, primero debes elegir la ubicación donde trabajas.
                        </p>
                    </div>
                )}
            </section>

            <section id="tour-special-blocks" className="relative space-y-4">
                <div id="tour-special-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between px-2">
                    <div>
                        <h3 className="text-2xl font-black font-display tracking-tight">Bloqueos Especiales</h3>
                        <p className="text-muted-foreground font-medium mt-1">Días específicos que no estarás disponible (vacaciones, citas, etc.)</p>
                    </div>
                    <Button
                        onClick={() => setShowBlockModal(true)}
                        className="w-full md:w-auto px-8 rounded-full font-black active:scale-95 text-[11px] uppercase tracking-widest border border-border/40 hover:bg-primary/90 transition-all shadow-none"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Añadir Bloqueo Especial
                    </Button>
                </div>

                {specialBlocks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {specialBlocks.map((block) => (
                            <div key={block.id} className="group relative flex items-center justify-between p-6 border border-border/40 rounded-4xl animate-in zoom-in-95 duration-300 hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="bg-red-500/10 text-red-500 rounded-2xl h-14 w-14 flex items-center justify-center shrink-0">
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-black text-lg tracking-tighter leading-none capitalize">
                                            {format(new Date(`${getBogotaISO(new Date(block.specificDate))}T12:00:00`), "EEEE, d 'de' MMMM", { locale: es })}
                                        </p>
                                        <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest mt-2 bg-muted/20 w-fit px-2 py-0.5 rounded-md">
                                            {block.startTime} — {block.endTime}
                                            {block.location && <span className="ml-2 border-l border-muted-foreground/20 pl-2">@{block.location.name}</span>}
                                        </p>
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
                    <div className="py-4 rounded-[3rem] border border-dashed border-border/40 bg-muted/5">
                        <EmptyState
                            title="Sin bloqueos especiales"
                            description="Tus vacaciones y descansos específicos aparecerán en este lugar."
                            icon={CalendarOff}
                        />
                    </div>
                )}
            </section>

            <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
                <DialogContent className="bg-muted border-2 border-border sm:max-w-md rounded-lg p-8 overflow-hidden">
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
                        <div className="space-y-3">
                            <label htmlFor="block-location" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Sede (Opcional)</label>
                            <Select
                                value={newBlock.locationId}
                                onValueChange={(value) => setNewBlock(prev => ({ ...prev, locationId: value }))}
                            >
                                <SelectTrigger className="w-full bg-muted/20 border-border/40 focus:bg-background rounded-2xl h-14 px-6 font-bold text-lg transition-all text-left">
                                    <SelectValue placeholder="Seleccionar Sede" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                                    {locations.map(loc => (
                                        <SelectItem key={loc.id} value={loc.id} className="font-bold py-3 rounded-xl">
                                            {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                    <DialogFooter className="mt-10 flex md:flex-row-reverse md:flex-row gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowBlockModal(false)}
                            className="flex-1 rounded-2xl font-black uppercase text-[11px] tracking-widest border border-border/40"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddBlock}
                            disabled={!newBlock.date || saving}
                            className="flex-1 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-none brightness-110 active:scale-95 transition-all"
                        >
                            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : "Registrar Bloqueo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Global Save Button - Centered at the bottom */}
            <div className="flex flex-col items-center justify-center pt-10 sticky bottom-10 z-50 pointer-events-none">
                <div className="relative w-fit group/save pointer-events-auto">
                    <div id="tour-save-anchor" className="absolute -inset-4 pointer-events-none rounded-[3rem] bg-primary/10 blur-xl opacity-0 group-hover/save:opacity-100 transition-opacity" />
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        id="tour-save-availability"
                        className={cn(
                            "group/btn relative px-12 h-20 rounded-[2rem] font-black text-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-700 overflow-hidden border-2",
                            success
                                ? "bg-secondary text-secondary-foreground border-secondary/20 scale-105 shadow-secondary/40"
                                : "bg-primary text-primary-foreground border-primary/20 hover:scale-110 active:scale-95 hover:shadow-primary/40"
                        )}
                    >
                        {/* Background animation for saving state */}
                        {saving && (
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
                        )}
                        
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                {saving ? (
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                ) : success ? (
                                    <CheckCircle2 className="h-8 w-8 animate-in zoom-in duration-500" />
                                ) : (
                                    <Save className="h-8 w-8 group-hover/btn:rotate-12 transition-transform duration-500" />
                                )}
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="uppercase tracking-[0.2em] text-[10px] font-black opacity-60">
                                    {saving ? "Sincronizando..." : success ? "Éxito" : "Control Maestro"}
                                </span>
                                <span className="text-xl">
                                    {saving ? "Salvando cambios..." : success ? "Horario Actualizado" : "Guardar Disponibilidad Profesional"}
                                </span>
                            </div>
                        </div>
                    </Button>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 animate-pulse">
                    Pulsa para aplicar tus nuevos horarios
                </p>
            </div>
        </div >
    )
}
