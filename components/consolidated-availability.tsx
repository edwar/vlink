"use client"

import { useState } from "react"
import { format, addDays, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Search, ArrowRight } from "lucide-react"
import { getOrgConsolidatedSlots } from "@/app/actions/consolidated-availability"
import Link from "next/link"
import Image from "next/image"

interface Props {
    orgSlug: string
}

export function ConsolidatedAvailability({ orgSlug }: Props) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [slotsData, setSlotsData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const dateRange = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1))

    const handleDateSelect = async (date: Date) => {
        setSelectedDate(date)
        setLoading(true)
        setHasSearched(true)
        setSlotsData([])

        try {
            const data = await getOrgConsolidatedSlots(orgSlug, date)
            setSlotsData(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full bg-card border-2 border-primary/5 rounded-[2.5rem] p-6 md:p-10 shadow-none space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 text-primary">
                    <Search className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-display font-black tracking-tight">Buscar Disponibilidad</h2>
                <p className="text-muted-foreground text-sm font-medium">Revisa qué profesionales tienen horarios libres en un día específico.</p>
            </div>

            {/* Date carousel */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5 justify-center md:justify-start">
                    <Calendar className="h-3 w-3" /> Selecciona una fecha
                </p>
                <div className="flex gap-2 overflow-x-auto pb-4 snap-x hide-scrollbar scroll-smooth">
                    {dateRange.map((date) => {
                        const isSelected = selectedDate && isSameDay(date, selectedDate)
                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleDateSelect(date)}
                                className={`snap-start shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border-2 font-bold transition-all active:scale-95
                                    ${isSelected
                                        ? "bg-primary text-primary-foreground border-primary shadow-none scale-105"
                                        : "bg-background border-primary/10 hover:border-primary/30 shadow-none"
                                    }`}
                            >
                                <span className="text-[10px] uppercase tracking-widest opacity-80">
                                    {format(date, "EEE", { locale: es })}
                                </span>
                                <span className="text-2xl font-black leading-tight">
                                    {format(date, "d")}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest opacity-80">
                                    {format(date, "MMM", { locale: es })}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Results */}
            {hasSearched && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        Resultados para {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : ""}
                    </p>

                    {loading ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[1, 2].map(i => (
                                <div key={i} className="p-4 border-2 border-primary/5 rounded-2xl flex items-center gap-4 animate-pulse">
                                    <div className="h-12 w-12 bg-muted rounded-full shrink-0" />
                                    <div className="space-y-2 w-full">
                                        <div className="h-4 bg-muted rounded w-1/2" />
                                        <div className="h-3 bg-muted rounded w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : slotsData.length === 0 ? (
                        <div className="text-center py-10 bg-muted/30 rounded-3xl border border-dashed border-border">
                            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="font-bold text-foreground">Sin disponibilidad</p>
                            <p className="text-sm text-muted-foreground">Ningún profesional tiene horarios libres este día.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {slotsData.map((data, i) => (
                                <div key={i} className="group relative flex flex-col p-5 bg-background border-2 border-primary/5 hover:border-primary/20 rounded-3xl transition-all shadow-none">
                                    <div className="flex items-center gap-3 mb-4">
                                        {data.profile.image ? (
                                            <div className="relative h-12 w-12 rounded-2xl overflow-hidden shadow-none">
                                                <Image src={data.profile.image} alt={data.profile.displayName} fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl shadow-none">
                                                {data.profile.displayName.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-black text-sm">{data.profile.displayName}</p>
                                            <p className="text-xs text-primary font-bold">{data.slots.length} horarios libres</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-5 max-h-[80px] overflow-y-auto pr-1 custom-scrollbar">
                                        {data.slots.slice(0, 8).map((slot: string) => (
                                            <span key={slot} className="px-2 py-1 bg-muted text-xs font-bold rounded-lg border border-border/50">
                                                {slot}
                                            </span>
                                        ))}
                                        {data.slots.length > 8 && (
                                            <span className="px-2 py-1 text-xs font-bold text-muted-foreground flex items-center">
                                                +{data.slots.length - 8} más
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        href={`/${data.profile.username}?date=${selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}`}
                                        className="mt-auto flex items-center justify-between w-full p-3 bg-primary/5 text-primary text-sm font-bold rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                    >
                                        Seleccionar horario
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* CSS for hiding scrollbar visually but keeping functionality */}
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 4px;
                }
                @media (prefers-color-scheme: dark) {
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255,255,255,0.1);
                    }
                }
            `}</style>
        </div>
    )
}
