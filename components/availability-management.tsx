"use client"

import { useState } from "react"
import { Clock, Plus, Trash2 } from "lucide-react"

const DAYS = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
]

export function AvailabilityManagement() {
    const [recurringDays, setRecurringDays] = useState([
        { day: "Lunes", start: "09:00", end: "17:00", active: true },
        { day: "Martes", start: "09:00", end: "17:00", active: true },
        { day: "Miércoles", start: "09:00", end: "17:00", active: true },
        { day: "Jueves", start: "09:00", end: "17:00", active: true },
        { day: "Viernes", start: "09:00", end: "17:00", active: true },
    ])

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Horario Semanal</h3>
                        <p className="text-sm text-muted-foreground">Define tus horas de trabajo recurrentes.</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {DAYS.map((day, idx) => {
                        const setting = recurringDays.find(d => d.day === day)
                        return (
                            <div key={day} className="flex items-center justify-between p-4 bg-card border rounded-xl">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        checked={setting?.active || false}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        onChange={() => { }}
                                    />
                                    <span className="font-medium min-w-[80px]">{day}</span>
                                </div>

                                {setting?.active ? (
                                    <div className="flex items-center gap-3">
                                        <input type="time" defaultValue={setting.start} className="bg-background border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary" />
                                        <span className="text-muted-foreground">a</span>
                                        <input type="time" defaultValue={setting.end} className="bg-background border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary" />
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">No disponible</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Bloqueos Especiales</h3>
                        <p className="text-sm text-muted-foreground">Días específicos que no estarás disponible (vacaciones, citas, etc.)</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        <Plus className="h-4 w-4" />
                        Añadir Bloqueo
                    </button>
                </div>

                <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
                    <p className="text-sm text-muted-foreground">No tienes bloqueos configurados.</p>
                </div>
            </section>

            <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Guardar Cambios
                </button>
            </div>
        </div>
    )
}
