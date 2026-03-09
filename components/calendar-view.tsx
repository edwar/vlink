"use client"

import { useState, useEffect } from "react"
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addMonths,
    endOfWeek,
    isToday,
    subDays,
    subWeeks,
    addWeeks,
    subMonths,
    getDay,
    isBefore,
    startOfDay,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, LayoutGrid, Clock, Lock, Menu, X, User, Mail, Phone, Clock3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvailability, getAppointmentsForDashboard } from "@/app/actions/availability"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ViewType = 'day' | 'week' | 'month'

interface CalendarHeaderProps {
    view: ViewType
    currentDate: Date
    isMenuOpen: boolean
    onViewChange: (v: ViewType) => void
    onMenuToggle: () => void
    onPrevious: () => void
    onToday: () => void
    onNext: () => void
}

function CalendarHeader({ view, currentDate, isMenuOpen, onViewChange, onMenuToggle, onPrevious, onToday, onNext }: CalendarHeaderProps) {
    return (
        <div className="flex flex-col gap-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 pt-2 pb-4 -mt-2">
            <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                    <h2 className="text-xl sm:text-2xl font-bold font-display capitalize">
                        {format(currentDate, view === 'month' ? "MMMM yyyy" : "MMMM yyyy", { locale: es })}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {view === 'week' ? `Semana del ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })}` :
                            view === 'day' ? format(currentDate, "EEEE, d 'de' MMMM", { locale: es }) :
                                'Vista mensual'}
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuToggle}
                    className="sm:hidden"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <CalendarIcon className="h-6 w-6" />}
                </Button>
            </div>

            <div className="hidden sm:flex items-center justify-between gap-4 w-full">
                <div className="flex items-center bg-muted/50 p-1 rounded-2xl border">
                    <Button
                        variant={view === 'day' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onViewChange('day')}
                        className={cn(
                            "px-3 py-1.5 h-8 rounded-xl",
                            view === 'day' ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Clock className="h-4 w-4" />
                        Día
                    </Button>
                    <Button
                        variant={view === 'week' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onViewChange('week')}
                        className={cn(
                            "px-3 py-1.5 h-8 rounded-xl",
                            view === 'week' ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <CalendarIcon className="h-4 w-4" />
                        Semana
                    </Button>
                    <Button
                        variant={view === 'month' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onViewChange('month')}
                        className={cn(
                            "px-3 py-1.5 h-8 rounded-xl",
                            view === 'month' ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Mes
                    </Button>
                </div>

                <div className="flex items-center border rounded-2xl overflow-hidden shadow-xs">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onPrevious}
                        className="rounded-none border-r border-border h-9"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToday}
                        className="rounded-none h-9 px-4 font-bold"
                    >
                        Hoy
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onNext}
                        className="rounded-none border-l border-border h-9"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="sm:hidden flex flex-col gap-4 p-4 mt-2 bg-card border rounded-xl shadow-xl animate-in slide-in-from-top-4 duration-200">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Vista</p>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={view === 'day' ? "vlink" : "secondary"}
                                size="sm"
                                onClick={() => { onViewChange('day'); onMenuToggle(); }}
                                className="h-auto py-3 text-[10px] flex-col rounded-xl"
                            >
                                <Clock className="h-4 w-4" />
                                Día
                            </Button>
                            <Button
                                variant={view === 'week' ? "vlink" : "secondary"}
                                size="sm"
                                onClick={() => { onViewChange('week'); onMenuToggle(); }}
                                className="h-auto py-3 text-[10px] flex-col rounded-xl"
                            >
                                <CalendarIcon className="h-4 w-4" />
                                Semana
                            </Button>
                            <Button
                                variant={view === 'month' ? "vlink" : "secondary"}
                                size="sm"
                                onClick={() => { onViewChange('month'); onMenuToggle(); }}
                                className="h-auto py-3 text-[10px] flex-col rounded-xl"
                            >
                                <LayoutGrid className="h-4 w-4" />
                                Mes
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Navegación</p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { onPrevious(); onMenuToggle(); }}
                                className="flex-1 h-10 rounded-xl"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { onToday(); onMenuToggle(); }}
                                className="flex-1 h-10 rounded-xl font-bold"
                            >
                                Hoy
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { onNext(); onMenuToggle(); }}
                                className="flex-1 h-10 rounded-xl"
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export function CalendarView() {
    const [view, setView] = useState<ViewType>('week')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [availability, setAvailability] = useState<any[]>([])
    const [appointments, setAppointments] = useState<any[]>([])
    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [availData, apptsData] = await Promise.all([
                    getAvailability(),
                    getAppointmentsForDashboard()
                ])
                setAvailability(availData)
                setAppointments(apptsData)
            } catch (err) {
                console.error("Error fetching data for calendar:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Navigation logic based on view
    const handlePrevious = () => {
        if (view === 'day') setCurrentDate(subDays(currentDate, 1))
        else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
        else if (view === 'month') setCurrentDate(subMonths(currentDate, 1))
    }

    const handleNext = () => {
        if (view === 'day') setCurrentDate(addDays(currentDate, 1))
        else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
        else if (view === 'month') setCurrentDate(addMonths(currentDate, 1))
    }

    const handleToday = () => {
        const today = new Date()
        setCurrentDate(today)
        setSelectedDate(today)
    }


    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

        const days = eachDayOfInterval({ start: startDate, end: endDate })
        const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

        return (
            <div className="border rounded-xl bg-card overflow-hidden">
                <div className="grid grid-cols-7 border-b bg-muted/30">
                    {weekDays.map(day => (
                        <div key={day} className="p-2 sm:p-3 text-center text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.charAt(0)}</span>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {days.map((day, idx) => {
                        const dayOfWeek = getDay(day)
                        const daySlots = availability.filter(a => a.dayOfWeek === dayOfWeek && !a.specificDate)
                        const specificDateSlots = availability.filter(a => a.specificDate && isSameDay(new Date(a.specificDate), day))

                        const mainAvailability = daySlots.find(s => !s.isBlocked)
                        const isBlocked = specificDateSlots.some(s => s.isBlocked)
                        const isPast = isBefore(day, startOfDay(new Date()))
                        const isFullyUnavailable = !mainAvailability || isPast
                        const dayAppointments = appointments.filter(a => isSameDay(new Date(a.startTime), day))

                        return (
                            <div
                                key={day.toString()}
                                role="button"
                                tabIndex={isPast || isBlocked ? -1 : 0}
                                onClick={() => {
                                    if (isPast) return
                                    if (isBlocked) return
                                    setSelectedDate(day)
                                    setCurrentDate(day)
                                    setView('day')
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        if (isPast) return
                                        if (isBlocked) return
                                        setSelectedDate(day)
                                        setCurrentDate(day)
                                        setView('day')
                                    }
                                }}
                                className={cn(
                                    "min-h-[50px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[150px] p-1 sm:p-2 border-b border-r last:border-r-0 cursor-pointer hover:bg-accent/30 transition-colors",
                                    isPast && "opacity-40 pointer-events-none bg-muted/20",
                                    !isSameDay(day, monthStart) && day < monthStart && "text-muted-foreground/30 bg-muted/10",
                                    !isSameDay(day, monthEnd) && day > monthEnd && "text-muted-foreground/30 bg-muted/10",
                                    isToday(day) && "bg-primary/5",
                                    isBlocked && "bg-red-100"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-sm font-medium",
                                        isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground",
                                        isBlocked && "text-destructive"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="mt-1 space-y-1">
                                    {isBlocked && (
                                        <div className="px-1 sm:px-1.5 py-0.5 bg-red-100 text-destructive text-[8px] sm:text-[10px] font-bold rounded flex items-center gap-1 w-fit">
                                            <Lock className="h-2.5 w-2.5" />
                                            <span className="hidden sm:inline">Bloqueado</span>
                                        </div>
                                    )}
                                    {isFullyUnavailable && !isBlocked && (
                                        <div className="px-1 sm:px-1.5 py-0.5 bg-muted text-muted-foreground text-[8px] sm:text-[10px] font-medium rounded w-fit">
                                            <span className="hidden sm:inline">No disponible</span>
                                            <span className="sm:hidden">N/D</span>
                                        </div>
                                    )}
                                    {dayAppointments.length > 0 && !isBlocked && (
                                        <div className="px-1 sm:px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] sm:text-[10px] font-bold rounded flex items-center gap-1 w-fit overflow-hidden">
                                            <span className="truncate">{dayAppointments.length} cita{dayAppointments.length > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderDayOrWeekView = () => {
        const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
        const displayDays = view === 'day'
            ? [currentDate]
            : [...Array(7)].map((_, i) => addDays(startDate, i))

        const hours = [...Array(24)].map((_, i) => i)

        return (
            <div className="flex flex-col border rounded-xl bg-card overflow-hidden h-[600px]">
                <div className="overflow-auto scrollbar-hide flex-1">
                    <div className={cn(
                        "flex flex-col min-w-full transition-all duration-300",
                        view === 'week' ? "w-max sm:w-full" : "w-full"
                    )}>
                        {/* Header Grid */}
                        <div className={cn(
                            "grid border-b sticky top-0 z-30 bg-card",
                            view === 'day'
                                ? "grid-cols-[80px_1fr]"
                                : "grid-cols-[80px_repeat(7,120px)] sm:grid-cols-[80px_repeat(7,1fr)]"
                        )}>
                            <div className="sticky left-0 z-40 bg-background/95 backdrop-blur-sm border-r" />
                            {displayDays.map((day) => (
                                <div
                                    key={day.toString()}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedDate(day)}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedDate(day) }}
                                    className={cn(
                                        "p-4 text-center cursor-pointer transition-colors hover:bg-accent/50",
                                        isSameDay(day, selectedDate) && "bg-accent",
                                        "border-r last:border-r-0"
                                    )}
                                >
                                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {format(day, "eee", { locale: es })}
                                    </p>
                                    <p className={cn(
                                        "text-base sm:text-lg font-bold",
                                        isToday(day) && "text-primary border-b-2 border-primary inline-block px-1"
                                    )}>
                                        {format(day, "d")}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Body Grid */}
                        <div className={cn(
                            "grid relative",
                            view === 'day'
                                ? "grid-cols-[80px_1fr]"
                                : "grid-cols-[80px_repeat(7,120px)] sm:grid-cols-[80px_repeat(7,1fr)]"
                        )}>
                            {/* Time labels column */}
                            <div className="flex flex-col sticky left-0 z-20">
                                {hours.map((hour) => (
                                    <div key={hour} className="h-20 p-4 text-[10px] sm:text-xs font-black text-muted-foreground text-right border-r border-b bg-background/95 backdrop-blur-md">
                                        {hour}:00
                                    </div>
                                ))}
                            </div>

                            {/* Days columns */}
                            {displayDays.map((day) => {
                                const dayOfWeek = getDay(day)
                                return (
                                    <div key={day.toString()} className="flex flex-col relative border-r last:border-r-0">
                                        {hours.map((hour) => {
                                            const daySlots = availability.filter(a => a.dayOfWeek === dayOfWeek && !a.specificDate)
                                            const specificDateSlots = availability.filter(a => a.specificDate && isSameDay(new Date(a.specificDate), day))
                                            const mainAvailability = daySlots.find(s => !s.isBlocked)
                                            const blockedSlots = [...daySlots.filter(s => s.isBlocked), ...specificDateSlots]
                                            const now = new Date()
                                            const slotDate = new Date(day)
                                            slotDate.setHours(hour, 0, 0, 0)
                                            const isPastSlot = isBefore(slotDate, now)

                                            let isAvailable = false
                                            if (mainAvailability && !isPastSlot) {
                                                const [startH] = mainAvailability.startTime.split(':').map(Number)
                                                const [endH] = mainAvailability.endTime.split(':').map(Number)
                                                if (hour >= startH && hour < endH) isAvailable = true
                                                blockedSlots.forEach(block => {
                                                    const [bStartH] = block.startTime.split(':').map(Number)
                                                    const [bEndH] = block.endTime.split(':').map(Number)
                                                    if (hour >= bStartH && hour < bEndH) isAvailable = false
                                                })
                                            }

                                            const slotAppointments = appointments.filter(a => {
                                                const aStart = new Date(a.startTime);
                                                return isSameDay(aStart, day) && aStart.getHours() === hour;
                                            });

                                            return (
                                                <div
                                                    key={hour}
                                                    className={cn(
                                                        "group h-20 border-b last:border-b-0 relative transition-colors",
                                                        !isAvailable ? "bg-muted/40" : "hover:bg-accent/30"
                                                    )}
                                                >
                                                    {slotAppointments.map((appt, idx) => (
                                                        <div
                                                            key={appt.id}
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedAppointment(appt);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter" || e.key === " ") {
                                                                    e.stopPropagation();
                                                                    setSelectedAppointment(appt);
                                                                }
                                                            }}
                                                            className="absolute inset-x-1 border rounded-md p-1 bg-primary/10 border-primary/20 text-[10px] overflow-hidden z-10 cursor-pointer hover:bg-primary/20 hover:border-primary/40 transition-colors"
                                                            style={{
                                                                top: `${(new Date(appt.startTime).getMinutes() / 60) * 100}%`,
                                                                height: `${Math.max(20, (((new Date(appt.endTime).getTime() - new Date(appt.startTime).getTime()) / 1000 / 60) / 60) * 100)}%`,
                                                                left: `${(idx * 4) + 4}px`,
                                                                right: '4px'
                                                            }}
                                                        >
                                                            <p className="font-semibold text-primary truncate leading-tight">{appt.clientName}</p>
                                                            {appt.service?.name && <p className="text-[10px] text-primary/80 truncate leading-tight">{appt.service.name}</p>}
                                                        </div>
                                                    ))}

                                                    {!isAvailable && slotAppointments.length === 0 && (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                                            <Lock className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
            <CalendarHeader
                view={view}
                currentDate={currentDate}
                isMenuOpen={isMenuOpen}
                onViewChange={setView}
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                onPrevious={handlePrevious}
                onToday={handleToday}
                onNext={handleNext}
            />
            {view === 'month' ? renderMonthView() : renderDayOrWeekView()}

            <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                    <div className="bg-primary/5 border-b p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-display font-bold">
                                Detalles de la Cita
                            </DialogTitle>
                            <DialogDescription>
                                Información completa sobre la reserva.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {selectedAppointment && (
                        <div className="p-6 space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                <div className="space-y-1.5 w-full overflow-hidden">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="font-bold text-lg leading-tight truncate">{selectedAppointment.service?.name || "Servicio General"}</p>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Inversión</p>
                                            <p className="font-black text-primary">$ {(selectedAppointment.service?.price ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Clock3 className="h-3.5 w-3.5 text-primary" />
                                            <span className="capitalize">
                                                {format(new Date(selectedAppointment.startTime), "EEEE d 'de' MMMM", { locale: es })}
                                            </span>
                                        </div>
                                        <span className="opacity-40 hidden xs:inline">•</span>
                                        <span className="font-medium text-foreground/80 bg-muted px-1.5 py-0.5 rounded text-xs">
                                            {format(new Date(selectedAppointment.startTime), "HH:mm")} - {format(new Date(selectedAppointment.endTime), "HH:mm")}
                                        </span>
                                    </div>
                                    <div className="pt-2 flex items-center gap-2 text-[10px] text-muted-foreground border-t mt-2">
                                        <CalendarIcon className="h-3 w-3" />
                                        <span>Registrada el: {format(new Date(selectedAppointment.createdAt), "dd/MM/yyyy HH:mm")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Información del Cliente</h4>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-accent/50 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-muted-foreground leading-none mb-1">Nombre</p>
                                            <p className="text-sm font-semibold truncate">{selectedAppointment.clientName}</p>
                                        </div>
                                    </div>

                                    {selectedAppointment.clientEmail && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-accent/50 transition-colors">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] text-muted-foreground leading-none mb-1">Correo Electrónico</p>
                                                <a href={`mailto:${selectedAppointment.clientEmail}`} className="text-sm font-medium text-primary hover:underline break-all block leading-tight">
                                                    {selectedAppointment.clientEmail}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-accent/50 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground leading-none mb-1">Teléfono (WhatsApp)</p>
                                            <a href={`https://wa.me/${selectedAppointment.clientPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-green-600 hover:underline">
                                                {selectedAppointment.clientPhone}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
