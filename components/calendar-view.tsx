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
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, LayoutGrid, Clock, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvailability } from "@/app/actions/availability"

type ViewType = 'day' | 'week' | 'month'

export function CalendarView() {
    const [view, setView] = useState<ViewType>('week')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [availability, setAvailability] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const data = await getAvailability()
                setAvailability(data)
            } catch (err) {
                console.error("Error fetching availability for calendar:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAvailability()
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

    const renderHeader = () => (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold font-display capitalize">
                    {format(currentDate, view === 'month' ? "MMMM yyyy" : "MMMM yyyy", { locale: es })}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {view === 'week' ? `Semana del ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })}` :
                        view === 'day' ? format(currentDate, "EEEE, d 'de' MMMM", { locale: es }) :
                            'Vista mensual'}
                </p>
            </div>

            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border w-full sm:w-auto">
                <button
                    onClick={() => setView('day')}
                    className={cn(
                        "flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                        view === 'day' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Clock className="h-4 w-4" />
                    Día
                </button>
                <button
                    onClick={() => setView('week')}
                    className={cn(
                        "flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                        view === 'week' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <CalendarIcon className="h-4 w-4" />
                    Semana
                </button>
                <button
                    onClick={() => setView('month')}
                    className={cn(
                        "flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                        view === 'month' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <LayoutGrid className="h-4 w-4" />
                    Mes
                </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="flex items-center border rounded-lg overflow-hidden">
                    <button onClick={handlePrevious} className="p-2 hover:bg-accent border-r">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={handleToday} className="px-4 py-2 text-sm font-medium hover:bg-accent">
                        Hoy
                    </button>
                    <button onClick={handleNext} className="p-2 hover:bg-accent border-l">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )

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
                        const isFullyUnavailable = !mainAvailability

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => {
                                    setSelectedDate(day)
                                    setCurrentDate(day)
                                    setView('day')
                                }}
                                className={cn(
                                    "min-h-[50px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[150px] p-1 sm:p-2 border-b border-r last:border-r-0 cursor-pointer hover:bg-accent/30 transition-colors",
                                    !isSameDay(day, monthStart) && day < monthStart && "text-muted-foreground/30 bg-muted/10",
                                    !isSameDay(day, monthEnd) && day > monthEnd && "text-muted-foreground/30 bg-muted/10",
                                    isToday(day) && "bg-primary/5",
                                    isBlocked && "bg-red-50/30"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-sm font-medium",
                                        isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="mt-1 space-y-1">
                                    {isBlocked && (
                                        <div className="px-1 sm:px-1.5 py-0.5 bg-red-100 text-red-700 text-[8px] sm:text-[10px] font-bold rounded flex items-center gap-1 w-fit">
                                            <Lock className="h-2.5 w-2.5" />
                                            <span className="hidden sm:inline">Bloqueado</span>
                                        </div>
                                    )}
                                    {isFullyUnavailable && !isBlocked && (
                                        <div className="px-1 sm:px-1.5 py-0.5 bg-muted text-muted-foreground text-[8px] sm:text-[10px] font-medium rounded w-fit">
                                            <span className="hidden sm:inline">No laborable</span>
                                            <span className="sm:hidden">N/L</span>
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
            <div className="flex flex-col border rounded-xl bg-card overflow-hidden">
                <div className={cn(
                    "grid border-b",
                    view === 'day' ? "grid-cols-1" : "grid-cols-7"
                )}>
                    {displayDays.map((day) => (
                        <div
                            key={day.toString()}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                                "p-4 text-center cursor-pointer transition-colors hover:bg-accent/50",
                                isSameDay(day, selectedDate) && "bg-accent"
                            )}
                        >
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {format(day, "eee", { locale: es })}
                            </p>
                            <p className={cn(
                                "text-lg font-semibold",
                                isToday(day) && "text-primary border-b-2 border-primary inline-block shrink-0 px-1"
                            )}>
                                {format(day, "d")}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-hide relative">
                    <div className={cn(
                        "grid",
                        view === 'day' ? "grid-cols-[80px_1fr]" : "grid-cols-[80px_repeat(7,1fr)]"
                    )}>
                        {/* Time labels column */}
                        <div className="flex flex-col">
                            {hours.map((hour) => (
                                <div key={hour} className="h-16 p-4 text-xs font-medium text-muted-foreground text-right border-r border-b bg-muted/30">
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
                                        // Check availability for this slot
                                        // A slot is available if there is an availability record that covers it
                                        // AND there is NO blocked record that covers it

                                        const daySlots = availability.filter(a => a.dayOfWeek === dayOfWeek && !a.specificDate)
                                        const specificDateSlots = availability.filter(a => a.specificDate && isSameDay(new Date(a.specificDate), day))

                                        const mainAvailability = daySlots.find(s => !s.isBlocked)
                                        const blockedSlots = [...daySlots.filter(s => s.isBlocked), ...specificDateSlots]

                                        let isAvailable = false
                                        if (mainAvailability) {
                                            const [startH, startM] = mainAvailability.startTime.split(':').map(Number)
                                            const [endH, endM] = mainAvailability.endTime.split(':').map(Number)

                                            // Main availability range check
                                            if (hour >= startH && hour < endH) {
                                                isAvailable = true
                                            }

                                            // Check if lunch/blocked slot overlaps
                                            blockedSlots.forEach(block => {
                                                const [bStartH, bStartM] = block.startTime.split(':').map(Number)
                                                const [bEndH, bEndM] = block.endTime.split(':').map(Number)

                                                if (hour >= bStartH && hour < bEndH) {
                                                    isAvailable = false
                                                }
                                            })
                                        }

                                        return (
                                            <div
                                                key={hour}
                                                className={cn(
                                                    "group h-16 border-b last:border-b-0 relative transition-colors",
                                                    !isAvailable ? "bg-muted/40" : "hover:bg-accent/30"
                                                )}
                                            >
                                                {isAvailable ? (
                                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-1 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center gap-2 text-primary hover:bg-primary/5 hover:border-primary/50">
                                                        <Plus className="h-3 w-3" />
                                                        <span className="text-[10px] font-bold">Cita</span>
                                                    </button>
                                                ) : (
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
        )
    }

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
            {renderHeader()}
            {view === 'month' ? renderMonthView() : renderDayOrWeekView()}
        </div>
    )
}
