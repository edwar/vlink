"use client"

import { useState, useEffect } from "react"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, ChevronLeft, ChevronRight, User, Loader2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrgConsolidatedSlots } from "@/app/actions/consolidated-availability"
import { UserAvatar } from "@/components/user-avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ConsolidatedAgendaProps {
    orgSlug: string
    locations: any[]
}

export function ConsolidatedAgenda({ orgSlug, locations }: ConsolidatedAgendaProps) {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any[]>([])
    const [selectedLocationId, setSelectedLocationId] = useState<string>("all")

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const results = await getOrgConsolidatedSlots(
                    orgSlug, 
                    selectedDate, 
                    selectedLocationId === "all" ? undefined : selectedLocationId
                )
                setData(results)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [orgSlug, selectedDate, selectedLocationId])

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Date Picker / Location Selector */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedDate(prev => addDays(prev, -1))}
                        className="rounded-xl h-12 w-12"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex flex-col items-center min-w-[200px]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Agenda Consolidada</span>
                        <h2 className="text-xl font-black font-display tracking-tight text-center">
                            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                        </h2>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedDate(prev => addDays(prev, 1))}
                        className="rounded-xl h-12 w-12"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="hidden md:flex h-10 w-10 items-center justify-center bg-primary/5 rounded-xl border border-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                        <SelectTrigger className="w-full md:w-[220px] h-12 rounded-xl bg-background border-border/40 font-bold">
                            <SelectValue placeholder="Todas las sedes" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40 font-medium">
                            <SelectItem value="all" className="font-bold">Todas las sedes</SelectItem>
                            {locations.map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                    {loc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Sincronizando Disponibilidades...</p>
                </div>
            ) : data.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {data.map((item) => (
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

                            <div className="flex flex-wrap gap-2 flex-1">
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
                        Ningún profesional del equipo tiene disponibilidad configurada para esta fecha/sede o todos los espacios están ocupados.
                    </p>
                </div>
            )}
        </div>
    )
}

