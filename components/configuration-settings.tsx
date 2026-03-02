"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Pencil, Trash2, Check, X, Clock, Save, Briefcase } from "lucide-react"
import { getConfiguration, updateConfiguration, createService, updateService, deleteService } from "@/app/actions/services"
import { cn, formatPrice, parsePrice } from "@/lib/utils"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from "./ui/input-group"
import { sileo } from "sileo"
import { LoadingState } from "./loading-state"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"

const DURATION_OPTIONS = [
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "1 hora", value: 60 },
    { label: "1.5 hrs", value: 90 },
    { label: "2 hrs", value: 120 },
]

interface ServiceItem {
    id: string
    name: string
    durationMinutes: number
    isActive: boolean
    price: number
}

export function ConfigurationSettings() {
    const [loading, setLoading] = useState(true)
    const [displayName, setDisplayName] = useState("")
    const [advanceNoticeHours, setAdvanceNoticeHours] = useState(24)
    const [savingConfig, setSavingConfig] = useState(false)
    const [services, setServices] = useState<ServiceItem[]>([])

    // New service form
    const [showNewForm, setShowNewForm] = useState(false)
    const [newName, setNewName] = useState("")
    const [newPrice, setNewPrice] = useState("0")
    const [newDuration, setNewDuration] = useState(30)
    const [creatingService, setCreatingService] = useState(false)

    // Editing
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editPrice, setEditPrice] = useState("0")
    const [editDuration, setEditDuration] = useState(30)
    const [updatingService, setUpdatingService] = useState(false)

    // Deleting
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getConfiguration()
                setDisplayName(data.displayName)
                setAdvanceNoticeHours(data.advanceNoticeHours ?? 24)
                setServices(data.services)
            } catch (err) {
                console.error(err)
                sileo.error({
                    title: "Error de carga",
                    description: "No se pudo obtener tu configuración. Por favor, recarga la página."
                })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSaveConfig = async () => {
        setSavingConfig(true)
        try {
            await updateConfiguration({ displayName, advanceNoticeHours })
            sileo.success({
                title: "Configuración guardada",
                description: "Marca y logística actualizadas correctamente.",
                styles: {
                    title: "text-green-600! font-bold!",
                    badge: "text-green-600!"
                }
            })
        } catch (err: any) {
            sileo.error({
                title: "Error al guardar",
                description: err.message || "No se pudo actualizar la configuración."
            })
        } finally {
            setSavingConfig(false)
        }
    }

    const handleCreateService = async () => {
        if (!newName.trim()) return
        setCreatingService(true)
        try {
            await createService({
                name: newName,
                durationMinutes: newDuration,
                price: parseFloat(parsePrice(newPrice)) || 0
            })
            const data = await getConfiguration()
            setServices(data.services)
            setNewName("")
            setNewPrice("0")
            setNewDuration(30)
            setShowNewForm(false)
            sileo.success({
                title: "Servicio creado",
                description: "El nuevo servicio ya está disponible para tus clientes.",
                styles: {
                    title: "text-green-600! font-bold!",
                    badge: "text-green-600!"
                }
            })
        } catch (err: any) {
            sileo.error({
                title: "Error al crear",
                description: err.message || "No se pudo crear el servicio."
            })
        } finally {
            setCreatingService(false)
        }
    }

    const handleUpdateService = async (id: string) => {
        if (!editName.trim()) return
        setUpdatingService(true)
        try {
            await updateService(id, {
                name: editName,
                durationMinutes: editDuration,
                price: parseFloat(parsePrice(editPrice)) || 0
            })
            const data = await getConfiguration()
            setServices(data.services)
            setEditingId(null)
            sileo.success({
                title: "Servicio actualizado",
                description: "Los cambios se han guardado exitosamente.",
                styles: {
                    title: "text-green-600! font-bold!",
                    badge: "text-green-600!"
                }
            })
        } catch (err: any) {
            sileo.error({
                title: "Error al actualizar",
                description: err.message || "No se pudieron guardar los cambios."
            })
        } finally {
            setUpdatingService(false)
        }
    }

    const handleDeleteService = async (id: string) => {
        setDeletingId(id)
        try {
            await deleteService(id)
            setServices(prev => prev.filter(s => s.id !== id))
            sileo.info({
                title: "Servicio eliminado",
                description: "El servicio ha sido removido de tu lista."
            })
            setServiceToDelete(null)
        } catch (err: any) {
            sileo.error({
                title: "Error al eliminar",
                description: err.message || "No se pudo eliminar el servicio."
            })
        } finally {
            setDeletingId(null)
        }
    }

    const handleToggleActive = async (service: ServiceItem) => {
        const newState = !service.isActive
        try {
            await updateService(service.id, { isActive: newState })
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, isActive: newState } : s))
            sileo.info({
                title: newState ? "Servicio activado" : "Servicio desactivado",
                description: newState ? "Tus clientes ya pueden agendar este servicio." : "Este servicio ya no será visible para agendar."
            })
        } catch (err: any) {
            sileo.error({
                title: "Error de estado",
                description: "No se pudo cambiar el estado del servicio."
            })
        }
    }

    const startEditing = (service: ServiceItem) => {
        setEditingId(service.id)
        setEditName(service.name)
        setEditPrice(formatPrice(service.price))
        setEditDuration(service.durationMinutes)
    }

    if (loading) {
        return (
            <LoadingState message="Cargando configuración..." fullPage={false} />
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Column 1: Services (Left) */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-10">
                    <section className="relative p-1 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                        <div className="relative z-10 bg-card/60 backdrop-blur-xl border border-primary/5 rounded-[2.3rem] p-8 sm:p-10 shadow-xl shadow-primary/5 space-y-10">
                            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-1 bg-primary rounded-full" />
                                        <h3 className="text-3xl font-black font-display tracking-tight text-primary uppercase">Mis Servicios</h3>
                                    </div>
                                    <p className="text-muted-foreground font-medium text-lg max-w-xl">
                                        Define tu portafolio profesional. Configura precios y duraciones personalizadas para cada sesión.
                                    </p>
                                </div>
                                {!showNewForm && (
                                    <Button
                                        onClick={() => setShowNewForm(true)}
                                        className="shrink-0 h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        Nuevo Servicio
                                    </Button>
                                )}
                            </div>

                            {/* New Service Form */}
                            {showNewForm && (
                                <div className="p-8 border-2 border-dashed border-primary/20 rounded-[2rem] space-y-10 bg-primary/5 animate-in slide-in-from-top-6 duration-500 overflow-hidden relative">
                                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/80 ml-1">Nombre del Servicio</Label>
                                        <Input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="Ej: Consultoría Estratégica, Sesión de Coaching..."
                                            className="h-16 rounded-2xl border-2 border-primary/5 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-xl font-black bg-background/50 px-8 shadow-inner"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/80 ml-1">Inversión (COP)</Label>
                                            <div className="group transition-all">
                                                <InputGroup className="h-16 rounded-2xl overflow-hidden border-2 border-primary/5 bg-background/50 focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-inner">
                                                    <InputGroupAddon className="bg-primary/5 border-r border-primary/10 px-6 h-16 flex items-center justify-center">
                                                        <InputGroupText className="text-primary font-black text-xl">$</InputGroupText>
                                                    </InputGroupAddon>
                                                    <InputGroupInput
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9.]*"
                                                        value={newPrice}
                                                        onChange={(e) => setNewPrice(formatPrice(e.target.value))}
                                                        className="font-black text-xl px-6 h-16 bg-transparent border-none focus:ring-0"
                                                        placeholder="0"
                                                    />
                                                </InputGroup>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/80 ml-1">Tiempo de Sesión</Label>
                                            <Select
                                                value={newDuration.toString()}
                                                onValueChange={(val) => setNewDuration(parseInt(val))}
                                            >
                                                <SelectTrigger className="h-16 w-full rounded-2xl border-2 border-primary/5 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-xl font-black bg-background/50 px-8 shadow-inner">
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="h-5 w-5 text-primary" />
                                                        <SelectValue placeholder="Duración" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent position="popper" className="rounded-2xl border-2 border-primary/5 shadow-2xl p-2 bg-popover/90 backdrop-blur-xl">
                                                    <SelectGroup>
                                                        {DURATION_OPTIONS.map((opt) => (
                                                            <SelectItem
                                                                key={opt.value}
                                                                value={opt.value.toString()}
                                                                className="font-black text-sm py-4 px-6 rounded-xl focus:bg-primary focus:text-white cursor-pointer transition-colors"
                                                            >
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end pt-8 border-t border-primary/10">
                                        <Button
                                            variant="ghost"
                                            onClick={() => { setShowNewForm(false); setNewName(""); setNewPrice("0"); setNewDuration(30) }}
                                            className="rounded-2xl font-black h-14 px-8 uppercase tracking-widest text-xs hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        >
                                            Descartar
                                        </Button>
                                        <Button
                                            onClick={handleCreateService}
                                            disabled={creatingService || !newName.trim()}
                                            className="rounded-2xl font-black h-14 px-10 uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                                        >
                                            {creatingService ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                                            Publicar Servicio
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Service List */}
                            {services.length === 0 && !showNewForm ? (
                                <div className="py-24 text-center border-2 border-dashed rounded-[2rem] bg-muted/5 border-primary/10 space-y-6">
                                    <div className="h-20 w-20 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mx-auto ring-1 ring-primary/10">
                                        <Briefcase className="h-10 w-10 text-primary/30" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-2xl font-black font-display tracking-tight text-foreground/80 lowercase italic">Tu mesa está vacía</p>
                                        <p className="text-muted-foreground font-medium max-w-[320px] mx-auto leading-relaxed">
                                            Crea tu primer servicio para empezar a recibir agendamientos profesionalmente.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowNewForm(true)}
                                        className="rounded-xl font-black border-2 hover:bg-primary/5"
                                    >
                                        Inaugurar Catálogo
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {services.map((service) => (
                                        <div
                                            key={service.id}
                                            className={cn(
                                                "group relative p-1 rounded-[2rem] transition-all duration-500",
                                                editingId === service.id ? "bg-linear-to-br from-primary/20 to-transparent" : "bg-transparent"
                                            )}
                                        >
                                            <div className={cn(
                                                "relative z-10 p-6 sm:p-8 rounded-[1.8rem] border transition-all duration-500",
                                                !service.isActive
                                                    ? "bg-muted/10 border-transparent opacity-60 grayscale"
                                                    : "bg-background/40 backdrop-blur-md border-primary/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5",
                                                editingId === service.id && "bg-card shadow-2xl border-primary shadow-primary/10"
                                            )}>
                                                {editingId === service.id ? (
                                                    <div className="space-y-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                                <Pencil className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <h4 className="font-black text-lg uppercase tracking-widest text-primary">Redactando Servicio</h4>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Nombre</Label>
                                                            <Input
                                                                type="text"
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                className="h-14 rounded-xl border-2 border-primary/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-black bg-background px-6"
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-4">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Precio</Label>
                                                                <InputGroup className="h-14 rounded-xl border-2 border-primary/10 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all bg-background px-0 overflow-hidden shadow-none">
                                                                    <InputGroupAddon className="bg-primary/5 border-r border-primary/10 px-5 flex items-center justify-center">
                                                                        <InputGroupText className="font-black text-primary">$</InputGroupText>
                                                                    </InputGroupAddon>
                                                                    <InputGroupInput
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        pattern="[0-9.]*"
                                                                        value={editPrice}
                                                                        onChange={(e) => setEditPrice(formatPrice(e.target.value))}
                                                                        className="font-black text-lg px-5 h-14 bg-transparent border-none focus:ring-0"
                                                                    />
                                                                </InputGroup>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Duración</Label>
                                                                <Select
                                                                    value={editDuration.toString()}
                                                                    onValueChange={(val) => setEditDuration(parseInt(val))}
                                                                >
                                                                    <SelectTrigger className="h-14 w-full rounded-xl border-2 border-primary/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-black bg-background px-6">
                                                                        <SelectValue placeholder="Duración" />
                                                                    </SelectTrigger>
                                                                    <SelectContent position="popper" className="rounded-xl border-2 border-primary/5 shadow-2xl p-2 bg-popover/90 backdrop-blur-xl">
                                                                        {DURATION_OPTIONS.map(opt => (
                                                                            <SelectItem
                                                                                key={opt.value}
                                                                                value={opt.value.toString()}
                                                                                className="font-black text-sm py-3 px-6 rounded-lg focus:bg-primary focus:text-white cursor-pointer"
                                                                            >
                                                                                {opt.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-primary/10">
                                                            <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl font-black h-12 uppercase tracking-widest text-[10px]">
                                                                Cancelar
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleUpdateService(service.id)}
                                                                disabled={updatingService || !editName.trim()}
                                                                className="rounded-xl font-black h-12 px-8 uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                                                            >
                                                                {updatingService ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                                Confirmar Cambios
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                                                        {/* Status Indicator */}
                                                        <div className={cn(
                                                            "h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] flex items-center justify-center shrink-0 border-2 transition-all duration-700",
                                                            service.isActive
                                                                ? "bg-primary/10 border-primary/20 shadow-xl shadow-primary/5 group-hover:scale-110 group-hover:rotate-6"
                                                                : "bg-muted border-muted-foreground/10 opacity-50 shrink-0"
                                                        )}>
                                                            <Briefcase className={cn("h-7 w-7 sm:h-9 sm:w-9", service.isActive ? "text-primary" : "text-muted-foreground/40")} />
                                                        </div>

                                                        <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
                                                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-2">
                                                                <h4 className="font-black text-xl sm:text-2xl truncate tracking-tight text-foreground/90 leading-tight">
                                                                    {service.name}
                                                                </h4>
                                                                <span className={cn(
                                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                                    service.isActive
                                                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                                        : "bg-muted text-muted-foreground border-muted-foreground/10"
                                                                )}>
                                                                    {service.isActive ? "Vigente" : "Latente"}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] font-black uppercase tracking-widest">
                                                                <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    <span>
                                                                        {service.durationMinutes >= 60
                                                                            ? `${Math.floor(service.durationMinutes / 60)}h ${service.durationMinutes % 60 > 0 ? `${service.durationMinutes % 60}m` : ""}`
                                                                            : `${service.durationMinutes} minutos`}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-foreground/70 bg-muted/30 px-3 py-1.5 rounded-xl border border-foreground/5 shadow-inner">
                                                                    <span className="text-primary/60">$</span>
                                                                    <span>{(service.price || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })} COP</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex sm:flex-col gap-2 shrink-0 pt-4 sm:pt-0">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleToggleActive(service)}
                                                                className={cn(
                                                                    "h-12 w-12 p-0 rounded-xl transition-all hover:scale-105 active:scale-90 border-2",
                                                                    service.isActive
                                                                        ? "text-green-600 border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5 shadow-lg shadow-green-500/5"
                                                                        : "text-muted-foreground border-primary/5 hover:border-primary/20"
                                                                )}
                                                                title={service.isActive ? "Archivar" : "Activar"}
                                                            >
                                                                <Check className={cn("h-5 w-5", service.isActive ? "opacity-100" : "opacity-30")} />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => startEditing(service)}
                                                                className="h-12 w-12 p-0 rounded-xl transition-all hover:scale-105 active:scale-90 border-2 border-primary/5 hover:border-primary/20 hover:bg-primary/5"
                                                                title="Ajustar"
                                                            >
                                                                <Pencil className="h-5 w-5" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setServiceToDelete(service)}
                                                                disabled={deletingId === service.id}
                                                                className="h-12 w-12 p-0 rounded-xl transition-all hover:scale-105 active:scale-90 border-2 border-destructive/5 hover:border-destructive/20 hover:bg-destructive/5 text-destructive"
                                                                title="Eliminar"
                                                            >
                                                                {deletingId === service.id
                                                                    ? <Loader2 className="h-5 w-5 animate-spin" />
                                                                    : <Trash2 className="h-5 w-5" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {!editingId && (
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Column 2: Commercial Name (Right) */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-10">
                    <section className="p-1 rounded-[2.5rem] bg-linear-to-b from-primary/5 to-transparent">
                        <div className="bg-card/60 backdrop-blur-xl border border-primary/5 rounded-[2.3rem] p-8 sm:p-10 shadow-xl shadow-primary/5 space-y-12">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black font-display tracking-tight text-foreground/90 uppercase">Marca y Logística</h3>
                                    <p className="text-sm text-muted-foreground font-medium">Personaliza tu identidad y reglas de negocio.</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Tu Nombre de Profesional</Label>
                                        <Input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Ej: Ing. Marco Antonio Solís"
                                            className="h-16 rounded-2xl border-2 border-primary/5 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-xl font-black bg-background/50 px-8 shadow-inner"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Horas de Antelación Mínima</Label>
                                        <p className="text-[11px] text-muted-foreground font-medium mb-3 ml-1 leading-tight">
                                            Tiempo mínimo para aceptar citas. <span className="text-primary font-bold">0 = mismo día</span>.
                                        </p>
                                        <div className="group transition-all">
                                            <InputGroup className="h-16 rounded-2xl overflow-hidden border-2 border-primary/5 bg-background/50 focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-inner">
                                                <InputGroupAddon className="bg-primary/5 border-r border-primary/10 px-6 h-16 flex items-center justify-center">
                                                    <Clock className="h-6 w-6 text-primary" />
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    type="number"
                                                    min={0}
                                                    value={advanceNoticeHours}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        const cleanValue = isNaN(val) ? 0 : val;
                                                        setAdvanceNoticeHours(cleanValue);
                                                        // This forces the input to sync visually if the browser is holding a leading zero string like "04"
                                                        e.target.value = cleanValue.toString();
                                                    }}
                                                    className="font-black text-xl px-6 h-16 bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                            </InputGroup>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSaveConfig}
                                        disabled={savingConfig}
                                        className="w-full h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/10 transition-all hover:scale-105 active:scale-95 group/save"
                                    >
                                        {savingConfig ? (
                                            <Loader2 className="h-6 w-6 animate-spin mr-3" />
                                        ) : (
                                            <Save className="h-6 w-6 mr-3 group-hover/save:rotate-12 transition-transform" />
                                        )}
                                        {savingConfig ? "Asegurando..." : "Guardar Configuración"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <Dialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
                <DialogContent className="rounded-[2.5rem] border-2 border-primary/10 bg-card/95 backdrop-blur-2xl p-10 max-w-md">
                    <DialogHeader className="space-y-4">
                        <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-2 mx-auto sm:mx-0">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-3xl font-black font-display tracking-tight uppercase">Eliminar Servicio</DialogTitle>
                        <DialogDescription className="text-lg font-medium leading-relaxed pr-6">
                            Estás a punto de desmantelar <span className="font-black text-foreground underline decoration-destructive/30 decoration-4">{serviceToDelete?.name}</span>. Esta operación es irreversible y afectará tu disponibilidad futura.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row w-full gap-4 pt-8">
                        <Button
                            variant="ghost"
                            onClick={() => setServiceToDelete(null)}
                            className="flex-1 rounded-2xl font-black h-14 uppercase tracking-widest text-xs border-2 border-transparent hover:bg-muted/50 transition-all"
                        >
                            Conservar
                        </Button>
                        <Button
                            onClick={() => {
                                if (serviceToDelete) handleDeleteService(serviceToDelete.id)
                            }}
                            disabled={deletingId === serviceToDelete?.id}
                            variant="destructive"
                            className="flex-1 rounded-2xl font-black h-14 uppercase tracking-widest text-xs shadow-2xl shadow-destructive/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            {deletingId === serviceToDelete?.id ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Trash2 className="h-5 w-5 mr-2" />}
                            Confirmar Baja
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
