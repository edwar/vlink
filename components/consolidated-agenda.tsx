"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, User, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrgConsolidatedSlots } from "@/app/actions/consolidated-availability"
import { UserAvatar } from "@/components/user-avatar"
import { cn } from "@/lib/utils"

interface ConsolidatedAgendaProps {
    orgSlug: string
}

export function ConsolidatedAgenda({ orgSlug }: ConsolidatedAgendaProps) {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const results = await getOrgConsolidatedSlots(orgSlug, selectedDate)
                setData(results)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [orgSlug, selectedDate])

    const filteredData = data.filter(item =>
        item.profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.profile.username.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Date Picker */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-linear-to-br from-primary/5 via-background to-background overflow-hidden">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedDate(prev => addDays(prev, -1))}
                        className="rounded-xl"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex flex-col items-center min-w-[200px]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Agenda Consolidada</span>
                        <h2 className="text-xl font-black font-display tracking-tight text-center">
                            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                        </h2>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedDate(prev => addDays(prev, 1))}
                        className="rounded-xl"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar profesional..."
                        className="w-full h-11 pl-10 pr-4 bg-muted/40 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Sincronizando Disponibilidades...</p>
                </div>
            ) : filteredData.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredData.map((item) => (
                        <div
                            key={item.profile.username}
                            className="group p-4 rounded-2xl transition-all flex flex-col md:flex-row md:items-center gap-6 bg-linear-to-br from-primary/5 via-background to-background overflow-hidden"
                        >
                            <div className="flex items-center gap-4 min-w-[240px]">
                                <UserAvatar
                                    image={item.profile.image}
                                    name={item.profile.displayName}
                                    className="min-h-12 min-w-12 rounded-xl"
                                />
                                <div>
                                    <h3 className="font-black text-foreground group-hover:text-primary transition-colors">{item.profile.displayName}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">@{item.profile.username}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {item.slots.map((slot: string) => (
                                    <span
                                        key={slot}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/10"
                                    >
                                        <Clock className="h-3 w-3 opacity-50" />
                                        {slot}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-20 bg-linear-to-br from-primary/5 via-background to-background overflow-hidden rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                        <User className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-black font-display">No hay espacios libres</h3>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                        Ningún profesional del equipo tiene disponibilidad configurada para esta fecha o todos los espacios están ocupados.
                    </p>
                </div>
            )}
        </div>
    )
}
