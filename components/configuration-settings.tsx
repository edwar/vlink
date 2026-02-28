"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Pencil, Trash2, Check, X, Clock, Save, Briefcase } from "lucide-react"
import { getConfiguration, updateDisplayName, createService, updateService, deleteService } from "@/app/actions/services"
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
    const [savingName, setSavingName] = useState(false)
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getConfiguration()
                setDisplayName(data.displayName)
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

    const handleSaveName = async () => {
        setSavingName(true)
        try {
            await updateDisplayName(displayName)
            sileo.success({
                title: "Nombre actualizado",
                description: "Tu nombre público se ha guardado correctamente.",
                styles: {
                    title: "text-green-600! font-bold!",
                    badge: "text-green-600!"
                }
            })
        } catch (err: any) {
            sileo.error({
                title: "Error al guardar",
                description: err.message || "No se pudo actualizar tu nombre público."
            })
        } finally {
            setSavingName(false)
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
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Column 1: Services (Left) */}
                <div className="lg:col-span-7 space-y-8">
                    <section className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black font-display tracking-tight text-primary">Mis Servicios</h3>
                                <p className="text-sm text-muted-foreground font-medium">Define qué ofreces y cuánto dura cada sesión.</p>
                            </div>
                            {!showNewForm && (
                                <Button
                                    onClick={() => setShowNewForm(true)}
                                    className="shrink-0 h-12 rounded-xl font-black shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Nuevo Servicio
                                </Button>
                            )}
                        </div>

                        {/* New Service Form */}
                        {showNewForm && (
                            <div className="p-6 border-2 border-dashed border-primary/20 rounded-2xl space-y-8 bg-primary/5 animate-in slide-in-from-top-4 duration-300">
                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Nombre del Servicio</Label>
                                    <Input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Ej: Consulta Médica, Asesoría Legal..."
                                        className="h-14 rounded-xl border-2 border-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg font-bold bg-background px-6"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Precio (Opcional)</Label>
                                        <InputGroup className="h-14 rounded-xl border-2 border-muted/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all bg-background px-0 overflow-hidden shadow-none">
                                            <InputGroupAddon align="inline-start" className="pl-5 border-none">
                                                <InputGroupText className="text-lg font-bold text-muted-foreground">$</InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9.]*"
                                                value={newPrice}
                                                onChange={(e) => setNewPrice(formatPrice(e.target.value))}
                                                placeholder="0"
                                                className="h-full text-lg font-bold px-4 border-none focus-visible:ring-0"
                                            />
                                        </InputGroup>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Duración Sugerida</Label>
                                        <Select
                                            value={newDuration.toString()}
                                            onValueChange={(val) => setNewDuration(parseInt(val))}
                                        >
                                            <SelectTrigger className="h-14 w-full rounded-xl border-2 border-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg font-bold bg-background px-6 shadow-sm">
                                                <SelectValue placeholder="Seleccionar duración" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" className="rounded-xl border-2 shadow-xl">
                                                <SelectGroup>
                                                    {DURATION_OPTIONS.map((opt) => (
                                                        <SelectItem
                                                            key={opt.value}
                                                            value={opt.value.toString()}
                                                            className="font-bold py-3 focus:bg-primary/10 focus:text-primary cursor-pointer"
                                                        >
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-6 border-t border-primary/10">
                                    <Button
                                        variant="ghost"
                                        onClick={() => { setShowNewForm(false); setNewName(""); setNewPrice("0"); setNewDuration(30) }}
                                        className="rounded-xl font-bold h-12 w-full sm:w-auto"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleCreateService}
                                        disabled={creatingService || !newName.trim()}
                                        className="rounded-xl font-black h-12 px-8 w-full sm:w-auto shadow-lg shadow-primary/10 hover:scale-105 transition-all active:scale-95"
                                    >
                                        {creatingService ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                                        Crear Servicio
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Service List */}
                        {services.length === 0 && !showNewForm ? (
                            <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/10 border-muted-foreground/10 space-y-4">
                                <div className="h-16 w-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto grayscale opacity-50">
                                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-black font-display tracking-tight">No tienes servicios activos</p>
                                    <p className="text-sm text-muted-foreground font-medium max-w-[280px] mx-auto leading-relaxed">
                                        Agrega al menos uno para que tus clientes puedan reservar una cita contigo.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {services.map((service) => (
                                    <div
                                        key={service.id}
                                        className={cn(
                                            "group p-5 sm:p-6 border-2 rounded-2xl transition-all duration-300",
                                            !service.isActive ? "bg-muted/5 border-transparent opacity-60" : "bg-background border-muted/30 hover:border-primary/20 hover:shadow-md",
                                            editingId === service.id && "border-primary ring-4 ring-primary/5 bg-primary/5 shadow-xl"
                                        )}
                                    >
                                        {editingId === service.id ? (
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Nombre del Servicio</Label>
                                                    <Input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="h-14 rounded-xl border-2 border-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg font-bold bg-background px-6"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Precio (Opcional)</Label>
                                                        <InputGroup className="h-14 rounded-xl border-2 border-muted/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all bg-background px-0 overflow-hidden shadow-none">
                                                            <InputGroupAddon align="inline-start" className="pl-5 border-none">
                                                                <InputGroupText className="text-lg font-bold text-muted-foreground">$</InputGroupText>
                                                            </InputGroupAddon>
                                                            <InputGroupInput
                                                                type="text"
                                                                inputMode="numeric"
                                                                pattern="[0-9.]*"
                                                                value={editPrice}
                                                                onChange={(e) => setEditPrice(formatPrice(e.target.value))}
                                                                className="h-full text-lg font-bold px-4 border-none focus-visible:ring-0"
                                                            />
                                                        </InputGroup>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Duración</Label>
                                                        <Select
                                                            value={editDuration.toString()}
                                                            onValueChange={(val) => setEditDuration(parseInt(val))}
                                                        >
                                                            <SelectTrigger className="h-14 w-full rounded-xl border-2 border-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg font-bold bg-background px-6 shadow-sm">
                                                                <SelectValue placeholder="Duración" />
                                                            </SelectTrigger>
                                                            <SelectContent position="popper" className="rounded-xl border-2 shadow-xl">
                                                                {DURATION_OPTIONS.map(opt => (
                                                                    <SelectItem
                                                                        key={opt.value}
                                                                        value={opt.value.toString()}
                                                                        className="font-bold py-3 focus:bg-primary/10 focus:text-primary cursor-pointer"
                                                                    >
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-6 border-t border-primary/10">
                                                    <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl font-bold h-12 w-full sm:w-auto">
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleUpdateService(service.id)}
                                                        disabled={updatingService || !editName.trim()}
                                                        className="rounded-xl font-black h-12 px-8 w-full sm:w-auto shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all active:scale-95"
                                                    >
                                                        {updatingService ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                        Guardar Cambios
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-5">
                                                {/* Info Header */}
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm transition-all duration-500",
                                                        service.isActive ? "bg-primary/10 border-primary/20" : "bg-muted border-transparent opacity-40 shrink-0"
                                                    )}>
                                                        <Briefcase className={cn("h-6 w-6", service.isActive ? "text-primary" : "text-muted-foreground")} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <h4 className="font-black text-base sm:text-lg truncate tracking-tight text-foreground/90 leading-tight mb-1">{service.name}</h4>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-muted-foreground/60 font-black uppercase tracking-wider">
                                                            <div className="flex items-center gap-1.5 bg-primary/5 text-primary px-2 py-0.5 rounded-full">
                                                                <Clock className="h-3 w-3" />
                                                                <span>
                                                                    {service.durationMinutes >= 60
                                                                        ? `${Math.floor(service.durationMinutes / 60)}h ${service.durationMinutes % 60 > 0 ? `${service.durationMinutes % 60}m` : ""}`
                                                                        : `${service.durationMinutes} min`}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-foreground/80 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                                                    $ {(service.price || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2 pt-4 border-t border-muted/30">
                                                    <Button
                                                        onClick={() => handleToggleActive(service)}
                                                        className={cn(
                                                            "flex-1 flex items-center justify-center h-11 rounded-xl transition-all active:scale-95 shadow-sm",
                                                            service.isActive
                                                                ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/10"
                                                                : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 border border-transparent"
                                                        )}
                                                        title={service.isActive ? "Desactivar" : "Activar"}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        <span className="hidden sm:block ml-2 text-[10px] font-black uppercase tracking-tighter">
                                                            {service.isActive ? "Activo" : "Inactivo"}
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        onClick={() => startEditing(service)}
                                                        className="flex-1 flex items-center justify-center h-11 bg-secondary/50 text-secondary-foreground hover:bg-secondary rounded-xl transition-all active:scale-95 border border-muted/30 shadow-sm"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="hidden sm:block ml-2 text-[10px] font-black uppercase tracking-tighter">Editar</span>
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeleteService(service.id)}
                                                        disabled={deletingId === service.id}
                                                        className="flex-1 flex items-center justify-center h-11 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl transition-all active:scale-95 border border-destructive/10 shadow-sm"
                                                    >
                                                        {deletingId === service.id
                                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                                            : <Trash2 className="h-4 w-4" />}
                                                        <span className="hidden sm:block ml-2 text-[10px] font-black uppercase tracking-tighter">Borrar</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Column 2: Public Name (Right) */}
                <div className="lg:col-span-5 space-y-8">
                    <section className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold font-display tracking-tight">Nombre Público</h3>
                            <p className="text-xs text-muted-foreground font-medium">Es el título que verán tus clientes.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Tu Nombre Comercial</Label>
                                <Input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Ej: Dr. Alejandro García"
                                    className="h-14 rounded-2xl border-2 border-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg font-bold bg-background px-6"
                                />
                            </div>

                            <Button
                                onClick={handleSaveName}
                                disabled={savingName}
                                className="w-full h-12 rounded-2xl font-black text-base shadow-lg shadow-primary/10 overflow-hidden hover:scale-105 transition-all active:scale-95"
                            >
                                {savingName ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <Save className="h-5 w-5 mr-2" />
                                )}
                                {savingName ? "Guardando..." : "Actualizar Nombre"}
                            </Button>
                        </div>
                    </section>

                    <div className="p-8 rounded-3xl bg-primary/5 border-2 border-primary/10 space-y-4">
                        <h4 className="text-sm font-black font-display uppercase tracking-widest text-primary/80">Tip Profesional</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            Usa un nombre que sea fácil de reconocer para tus clientes. Esto genera confianza y profesionalismo desde el primer contacto.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
