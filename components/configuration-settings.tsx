"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Pencil, Trash2, Check, X, Clock, Save, Briefcase } from "lucide-react"
import { getConfiguration, updateDisplayName, createService, updateService, deleteService } from "@/app/actions/services"
import { cn } from "@/lib/utils"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
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
}

export function ConfigurationSettings() {
    const [loading, setLoading] = useState(true)
    const [displayName, setDisplayName] = useState("")
    const [savingName, setSavingName] = useState(false)
    const [services, setServices] = useState<ServiceItem[]>([])

    // New service form
    const [showNewForm, setShowNewForm] = useState(false)
    const [newName, setNewName] = useState("")
    const [newDuration, setNewDuration] = useState(30)
    const [creatingService, setCreatingService] = useState(false)

    // Editing
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
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
            await createService({ name: newName, durationMinutes: newDuration })
            const data = await getConfiguration()
            setServices(data.services)
            setNewName("")
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
            await updateService(id, { name: editName, durationMinutes: editDuration })
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
                                    className="shrink-0 h-11 rounded-xl font-black px-6 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95"
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
                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Duración Sugerida</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {DURATION_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setNewDuration(opt.value)}
                                                className={cn(
                                                    "px-5 py-3 rounded-xl text-sm font-black border-2 transition-all active:scale-95",
                                                    newDuration === opt.value
                                                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                                        : "bg-background border-muted/50 hover:border-primary/30"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end pt-4 border-t border-primary/10">
                                    <Button
                                        variant="ghost"
                                        onClick={() => { setShowNewForm(false); setNewName(""); setNewDuration(30) }}
                                        className="rounded-xl font-bold h-11"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleCreateService}
                                        disabled={creatingService || !newName.trim()}
                                        className="rounded-xl font-black h-11 px-6 shadow-md"
                                    >
                                        {creatingService ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
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
                                            "group p-6 border-2 rounded-2xl transition-all duration-300",
                                            !service.isActive ? "bg-muted/5 border-transparent opacity-60" : "bg-background border-muted/30 hover:border-primary/20 hover:shadow-md",
                                            editingId === service.id && "border-primary ring-4 ring-primary/5 bg-primary/5 shadow-xl"
                                        )}
                                    >
                                        {editingId === service.id ? (
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Editar Nombre</Label>
                                                    <Input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="h-12 rounded-xl border-2 font-bold px-5"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Editar Duración</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {DURATION_OPTIONS.map((opt) => (
                                                            <button
                                                                key={opt.value}
                                                                onClick={() => setEditDuration(opt.value)}
                                                                className={cn(
                                                                    "px-4 py-2 rounded-lg text-xs font-black border-2 transition-all",
                                                                    editDuration === opt.value
                                                                        ? "bg-primary text-primary-foreground border-primary"
                                                                        : "bg-background border-muted/50 hover:border-primary/20"
                                                                )}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 justify-end pt-4 border-t border-primary/10">
                                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="rounded-lg font-bold">
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateService(service.id)}
                                                        disabled={updatingService || !editName.trim()}
                                                        className="rounded-lg font-black px-5"
                                                    >
                                                        {updatingService ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                                                        Guardar
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm transition-all duration-500",
                                                    service.isActive ? "bg-primary/10 border-primary/10 scale-100" : "bg-muted border-transparent scale-90"
                                                )}>
                                                    <Briefcase className={cn("h-7 w-7", service.isActive ? "text-primary" : "text-muted-foreground/30")} />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <p className="font-black text-lg truncate tracking-tight text-foreground/90">{service.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-bold uppercase tracking-wider">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>
                                                            {service.durationMinutes >= 60
                                                                ? `${Math.floor(service.durationMinutes / 60)}h ${service.durationMinutes % 60 > 0 ? `${service.durationMinutes % 60}m` : ""}`
                                                                : `${service.durationMinutes} min`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleToggleActive(service)}
                                                        className={cn(
                                                            "p-2.5 rounded-xl transition-all active:scale-90",
                                                            service.isActive
                                                                ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                                                : "bg-muted text-muted-foreground hover:bg-muted-foreground/10"
                                                        )}
                                                        title={service.isActive ? "Desactivar" : "Activar"}
                                                    >
                                                        <Check className={cn("h-5 w-5", !service.isActive && "opacity-30")} />
                                                    </button>
                                                    <button
                                                        onClick={() => startEditing(service)}
                                                        className="p-2.5 bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-90"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteService(service.id)}
                                                        disabled={deletingId === service.id}
                                                        className="p-2.5 bg-muted/50 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90"
                                                    >
                                                        {deletingId === service.id
                                                            ? <Loader2 className="h-5 w-5 animate-spin" />
                                                            : <Trash2 className="h-5 w-5" />}
                                                    </button>
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
                                className="w-full h-14 rounded-2xl font-black text-base shadow-lg shadow-primary/10 overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.98]"
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
