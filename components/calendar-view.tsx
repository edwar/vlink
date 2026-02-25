"use client"

import { useState } from "react"
import { format, startOfWeek, addDays, startOfDay, addHours, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i))

    const hours = [...Array(14)].map((_, i) => i + 8) // 8 AM to 9 PM

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-display">
                    {format(currentDate, "MMMM yyyy", { locale: es })}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentDate(addDays(currentDate, -7))}
                        className="p-2 hover:bg-accent rounded-md"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-1 text-sm font-medium hover:bg-accent rounded-md border"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => setCurrentDate(addDays(currentDate, 7))}
                        className="p-2 hover:bg-accent rounded-md"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col border rounded-xl bg-card overflow-hidden">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b">
                    {weekDays.map((day) => (
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
                                isSameDay(day, new Date()) && "text-primary border-b-2 border-primary inline-block shrink-0 px-1"
                            )}>
                                {format(day, "d")}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Time Grid / Agenda */}
                <div className="flex-1 overflow-y-auto max-h-[600px]">
                    {hours.map((hour) => (
                        <div key={hour} className="group grid grid-cols-[80px_1fr] border-b last:border-0 min-h-[64px]">
                            <div className="p-4 text-xs font-medium text-muted-foreground text-right border-r bg-muted/30">
                                {hour}:00
                            </div>
                            <div className="relative p-2 flex items-center justify-center">
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-2 border-2 border-dashed border-muted rounded-lg flex items-center justify-center gap-2 text-muted-foreground hover:bg-accent hover:border-accent-foreground hover:text-accent-foreground">
                                    <Plus className="h-4 w-4" />
                                    <span className="text-xs font-medium">Bloquear o Cita</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
