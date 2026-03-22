"use client"

import React, { useState, useEffect, useRef } from "react"
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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, Clock, Lock, Menu, X, User, Mail, Phone, Clock3, CheckCircle2, Loader2, MapPinned } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvailability, getAppointmentsForDashboard } from "@/app/actions/availability"
import { getOrganizationLocations } from "@/app/actions/locations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { pusherClient } from "@/lib/pusher-client"
import { useRouter } from "next/navigation"
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
    locations: any[]
    selectedLocationId: string | null
    onLocationChange: (id: string | null) => void
}

function CalendarHeader({
    view,
    currentDate,
    isMenuOpen,
    onViewChange,
    onMenuToggle,
    onPrevious,
    onToday,
    onNext,
    locations,
    selectedLocationId,
    onLocationChange
}: CalendarHeaderProps) {
    return (
        <div className="flex flex-col gap-4 bg-transparent pt-2 pb-4 border-b border-dashed border-border/60 mb-2">
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

                <div className="flex flex-col lg:flex-row items-end lg:items-center gap-4">
                    <Select
                        value={selectedLocationId || "all"}
                        onValueChange={(value) => onLocationChange(value === "all" ? null : value)}
                    >
                        <SelectTrigger className="flex w-[220px] h-10 bg-muted/30 px-3 rounded-full border border-border/50 text-xs font-black uppercase tracking-widest focus:ring-0 shadow-none hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <MapPinned className="h-4 w-4 text-primary shrink-0" />
                                <SelectValue placeholder="Todas las Sedes" />
                            </div>
                        </SelectTrigger>
                        <SelectContent position="popper" className="w-(--radix-select-trigger-width) rounded-2xl border-border/40 shadow-2xl">
                            <SelectItem value="all" className="text-xs font-bold py-2 rounded-xl">Todas las Sedes</SelectItem>
                            {locations.map(loc => (
                                <SelectItem key={loc.id} value={loc.id} className="text-xs font-bold py-2 rounded-xl">
                                    {loc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

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
            </div>

            <div className="hidden sm:flex items-center justify-between gap-4 w-full">
                <div id="tour-calendar-view-switcher" className="relative flex items-center bg-muted/30 p-1.5 rounded-full border border-border/50">
                    <div id="tour-calendar-switcher-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                    <Button
                        variant={view === 'day' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onViewChange('day')}
                        className={cn(
                            "px-4 py-1.5 h-auto rounded-full text-[11px] font-bold uppercase tracking-widest",
                            view === 'day' ? "bg-background text-foreground shadow-[none]" : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                        )}
                    >
                        <Clock className="h-4 w-4 mr-2" />
                        Día
                    </Button>
                    <Button
                        variant={view === 'week' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onViewChange('week')}
                        className={cn(
                            "px-4 py-1.5 h-auto rounded-full text-[11px] font-bold uppercase tracking-widest",
                            view === 'week' ? "bg-background text-foreground shadow-[none]" : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                        )}
                    >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Semana
                    </Button>
                    <Button
                        variant={view === 'month' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onViewChange('month')}
                        className={cn(
                            "px-4 py-1.5 h-auto rounded-full text-[11px] font-bold uppercase tracking-widest",
                            view === 'month' ? "bg-background text-foreground shadow-[none]" : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                        )}
                    >
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Mes
                    </Button>
                </div>

                <div id="tour-calendar-nav" className="relative flex items-center border border-border/50 rounded-full overflow-hidden bg-muted/10 p-1">
                    <div id="tour-calendar-nav-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onPrevious}
                        className="rounded-full h-8 w-8 hover:bg-background text-muted-foreground"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToday}
                        className="rounded-full h-8 px-4 font-black uppercase text-[10px] tracking-widest hover:bg-background"
                    >
                        Hoy
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onNext}
                        className="rounded-full h-8 w-8 hover:bg-background text-muted-foreground"
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
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-1 flex items-center gap-2">
                            <MapPinned className="h-3 w-3 text-primary" />
                            Sede
                        </p>
                        <Select
                            value={selectedLocationId || "all"}
                            onValueChange={(value) => { onLocationChange(value === "all" ? null : value); onMenuToggle(); }}
                        >
                            <SelectTrigger className="w-full h-10 rounded-xl bg-muted/20 border-border/40 px-4 text-xs font-bold transition-all text-foreground">
                                <SelectValue placeholder="Todas las Sedes" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="w-(--radix-select-trigger-width) rounded-2xl border-border/40 shadow-2xl">
                                <SelectItem value="all" className="text-xs font-bold py-2 rounded-xl">Todas las Sedes</SelectItem>
                                {locations.map(loc => (
                                    <SelectItem key={loc.id} value={loc.id} className="text-xs font-bold py-2 rounded-xl">
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

export function CalendarView({ profileId, organizationId }: { profileId: string, organizationId: string }) {
    const router = useRouter()
    const [view, setView] = useState<ViewType>('month')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [availability, setAvailability] = useState<any[]>([])
    const [locations, setLocations] = useState<any[]>([])
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
    const [appointments, setAppointments] = useState<any[]>([])
    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [now, setNow] = useState(new Date(0)) // Neutral date for SSR
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Setup mounted state and timer
    useEffect(() => {
        setIsMounted(true)
        setNow(new Date())
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    // Auto-scroll to current time on day/week view switch
    useEffect(() => {
        if (isMounted && (view === 'day' || view === 'week') && scrollContainerRef.current) {
            const hour = now.getHours()
            const minutes = now.getMinutes()
            const scrollPos = (hour + minutes / 60) * 80 - 150 // 80px per hour, offset 150px
            scrollContainerRef.current.scrollTo({
                top: Math.max(0, scrollPos),
                behavior: 'smooth'
            })
        }
    }, [view])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [availData, apptsData, locsData] = await Promise.all([
                    getAvailability(),
                    getAppointmentsForDashboard(),
                    getOrganizationLocations(organizationId)
                ])
                setAvailability(availData)
                setAppointments(apptsData)
                setLocations(locsData)
            } catch (err) {
                console.error("Error fetching data for calendar:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()

        const channel = pusherClient.subscribe(`profile-${profileId}`)
        channel.bind("appointments-updated", () => {
            fetchData()
            router.refresh()
        })

        return () => {
            pusherClient.unsubscribe(`profile-${profileId}`)
        }
        // Listen for real-time updates
        // We'll trust the profile the user is currently seeing
        // For simplicity, we can get the profile ID from the appointments or availability if needed, 
        // but since this is for the professional's dashboard, we can use a generic approach or wait for prop
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
            <div className="border border-primary/10 rounded-[2.5rem] bg-transparent overflow-hidden">
                <div className="grid grid-cols-7 border-b border-border/50 bg-muted/10">
                    {weekDays.map(day => (
                        <div key={day} className="p-3 sm:p-4 text-center text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.charAt(0)}</span>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 bg-background/30">
                    {days.map((day, idx) => {
                        const dayOfWeek = getDay(day)

                        // Filter availability by selected location
                        const filteredAvail = selectedLocationId
                            ? availability.filter(a => a.locationId === selectedLocationId)
                            : availability;

                        const daySlots = filteredAvail.filter(a => a.dayOfWeek === dayOfWeek && !a.specificDate)
                        const specificDateSlots = filteredAvail.filter(a => a.specificDate && isSameDay(new Date(a.specificDate), day))

                        const mainAvailability = daySlots.find(s => !s.isBlocked)
                        const isBlocked = specificDateSlots.some(s => s.isBlocked)
                        const isPast = isBefore(day, startOfDay(new Date()))
                        const isFullyUnavailable = !mainAvailability || isPast

                        // Filter appointments by selected location
                        const filteredAppts = selectedLocationId
                            ? appointments.filter(a => a.locationId === selectedLocationId)
                            : appointments;

                        const dayAppointments = filteredAppts.filter(a => isSameDay(new Date(a.startTime), day))

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
                                    "min-h-[60px] sm:min-h-[100px] lg:min-h-[120px] p-2 sm:p-3 border-b border-r border-border/50 last:border-r-0 cursor-pointer hover:bg-primary/5 transition-colors",
                                    isPast && "opacity-40 pointer-events-none bg-muted/10",
                                    !isSameDay(day, monthStart) && day < monthStart && "text-muted-foreground/30 bg-transparent",
                                    !isSameDay(day, monthEnd) && day > monthEnd && "text-muted-foreground/30 bg-transparent",
                                    isToday(day) && "bg-primary/5",
                                    isBlocked && "bg-red-500/5 hover:bg-red-500/10"
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
            <div className="flex flex-col border border-primary/10 rounded-[2.5rem] bg-transparent overflow-hidden h-[600px]">
                <div ref={scrollContainerRef} className="overflow-auto scrollbar-hide flex-1">
                    <div className={cn(
                        "flex flex-col min-w-full transition-all duration-300",
                        view === 'week' ? "w-max sm:w-full" : "w-full"
                    )}>
                        {/* Header Grid */}
                        <div className={cn(
                            "grid border-b border-border/50 sticky top-0 z-30 bg-background/95 backdrop-blur",
                            view === 'day'
                                ? "grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr]"
                                : "grid-cols-[60px_repeat(7,120px)] sm:grid-cols-[80px_repeat(7,1fr)]"
                        )}>
                            <div className="sticky left-0 z-40 bg-background/95 backdrop-blur-sm border-r border-border/50" />
                            {displayDays.map((day) => (
                                <div
                                    key={day.toString()}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedDate(day)}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedDate(day) }}
                                    className={cn(
                                        "p-3 sm:p-4 text-center cursor-pointer transition-colors hover:bg-primary/5",
                                        isSameDay(day, selectedDate) && "bg-primary/5",
                                        "border-r border-border/50 last:border-r-0"
                                    )}
                                >
                                    <p className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                                        {format(day, "eee", { locale: es })}
                                    </p>
                                    <div className="mt-1 flex justify-center">
                                        <div className={cn(
                                            "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold",
                                            isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
                                        )}>
                                            {format(day, "d")}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Body Grid */}
                        <div className={cn(
                            "grid relative bg-background/30",
                            view === 'day'
                                ? "grid-cols-[80px_1fr]"
                                : "grid-cols-[80px_repeat(7,120px)] sm:grid-cols-[80px_repeat(7,1fr)]"
                        )}>
                            {/* Time labels column */}
                            <div className="flex flex-col sticky left-0 z-20">
                                {hours.map((hour) => (
                                    <div key={hour} className="h-20 p-2 sm:p-4 pr-3 sm:pr-5 text-[10px] sm:text-xs font-black text-muted-foreground text-right border-r border-b border-border/50 bg-background/95 backdrop-blur-md">
                                        {hour}:00
                                    </div>
                                ))}
                            </div>

                            {/* Days columns */}
                            {displayDays.map((day) => {
                                const dayOfWeek = getDay(day)
                                const now = new Date() // Define now here for consistent client-side rendering
                                return (
                                    <div key={day.toString()} className="flex flex-col relative border-r border-border/50 last:border-r-0">
                                        {/* Current Time Line (Only for today) */}
                                        {isMounted && isSameDay(day, now) && (
                                            <div
                                                className="absolute left-0 right-0 z-20 pointer-events-none"
                                                style={{
                                                    top: `${(now.getHours() + now.getMinutes() / 60) * 80}px`,
                                                }}
                                            >
                                                <div className="relative w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]">
                                                    <div className="absolute left-0 -top-1 w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
                                                </div>
                                            </div>
                                        )}
                                        {hours.map((hour) => {
                                            // Filter availability by selected location
                                            const filteredAvail = selectedLocationId
                                                ? availability.filter(a => a.locationId === selectedLocationId)
                                                : availability;

                                            const daySlots = filteredAvail.filter(a => a.dayOfWeek === dayOfWeek && !a.specificDate)
                                            const specificDateSlots = filteredAvail.filter(a => a.specificDate && isSameDay(new Date(a.specificDate), day))
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

                                            // Filter appointments by selected location
                                            const filteredAppts = selectedLocationId
                                                ? appointments.filter(a => a.locationId === selectedLocationId)
                                                : appointments;

                                            const slotAppointments = filteredAppts.filter(a => {
                                                const aStart = new Date(a.startTime);
                                                return isSameDay(aStart, day) && aStart.getHours() === hour;
                                            });

                                            return (
                                                <div
                                                    key={hour}
                                                    className={cn(
                                                        "group h-20 border-b border-border/50 last:border-b-0 relative transition-colors",
                                                        !isAvailable ? "bg-muted/10 cursor-not-allowed" : "hover:bg-primary/5"
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

    if (!isMounted) {
        return (
            <div className="w-full h-[800px] rounded-[2.5rem] bg-surface/50 border border-border/40 animate-pulse flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Sincronizando Agenda...</p>
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
                locations={locations}
                selectedLocationId={selectedLocationId}
                onLocationChange={setSelectedLocationId}
            />
            <div id="tour-calendar-content" className="relative">
                <div id="tour-calendar-content-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                {view === 'month' ? renderMonthView() : renderDayOrWeekView()}
            </div>

            <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/50 rounded-lg">
                    <div className="border-b border-border/50 p-6">
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
                        <div className="p-6 space-y-8">
                            <div className="flex items-start gap-4 p-4 rounded-4xl bg-transparent border border-dashed border-border/50">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex flex-col gap-2 items-start">
                                            <p className="font-bold text-lg leading-tight md:truncate max-w-[200px] md:max-w-none">{selectedAppointment.service?.name || "Servicio General"}</p>
                                            {selectedAppointment.status === "PAGADA" ? (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-green-500/10 text-green-600 px-3 py-1 rounded-full border border-green-500/20">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Servicio Pagado
                                                </span>
                                            ) : selectedAppointment.status === "PENDING" ? (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full border border-yellow-500/20">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Pago Pendiente
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="text-right shrink-0 pt-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 -mr-[0.1em]">Pago</p>
                                            <p className="font-black text-primary text-md leading-none">$ {(selectedAppointment.service?.price ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</p>
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
                                        <span className="font-bold bg-primary/5 text-primary px-2 py-0.5 rounded-full text-[10px] tracking-widest uppercase">
                                            {format(new Date(selectedAppointment.startTime), "HH:mm")} - {format(new Date(selectedAppointment.endTime), "HH:mm")}
                                        </span>
                                    </div>
                                    <div className="pt-3 flex items-center gap-2 text-[10px] text-muted-foreground border-t border-dashed border-border/50 mt-3 font-semibold uppercase tracking-widest">
                                        <CalendarIcon className="h-3 w-3" />
                                        <span>Registrada el: {format(new Date(selectedAppointment.createdAt), "dd/MM/yyyy HH:mm")}</span>
                                    </div>
                                    {selectedAppointment.location && (
                                        <div className="pt-2 flex items-center gap-2 text-[10px] text-primary/60 font-semibold uppercase tracking-widest">
                                            <MapPinned className="h-3 w-3" />
                                            <span>Sede: {selectedAppointment.location.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Información del Cliente</h4>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-transparent border border-dashed border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-muted-foreground leading-none mb-1 font-semibold uppercase tracking-widest">Nombre</p>
                                            <p className="text-sm font-bold truncate">{selectedAppointment.clientName}</p>
                                        </div>
                                    </div>

                                    {selectedAppointment.clientEmail && (
                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-transparent border border-dashed border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-colors">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] text-muted-foreground leading-none mb-1 font-semibold uppercase tracking-widest">Correo Electrónico</p>
                                                <a href={`mailto:${selectedAppointment.clientEmail}`} className="text-sm font-bold text-primary hover:underline break-all block leading-tight">
                                                    {selectedAppointment.clientEmail}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-transparent border border-dashed border-border/50 hover:bg-green-500/5 hover:border-green-500/20 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground leading-none mb-1 font-semibold uppercase tracking-widest">Teléfono (WhatsApp)</p>
                                            <a href={`https://wa.me/${selectedAppointment.clientPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-green-600 hover:underline">
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
