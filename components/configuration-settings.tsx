"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Pencil, Trash2, Check, X, Clock, Save, Briefcase } from "lucide-react"
import { getConfiguration, updateDisplayName, createService, updateService, deleteService } from "@/app/actions/services"
import { cn } from "@/lib/utils"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"

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
    const [nameSuccess, setNameSuccess] = useState(false)
    const [services, setServices] = useState<ServiceItem[]>([])
    const [error, setError] = useState<string | null>(null)

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
                setError("No se pudo cargar la configuración")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSaveName = async () => {
        setSavingName(true)
        setError(null)
        try {
            await updateDisplayName(displayName)
            setNameSuccess(true)
            setTimeout(() => setNameSuccess(false), 3000)
        } catch (err: any) {
            setError(err.message || "Error al guardar")
        } finally {
            setSavingName(false)
        }
    }

    const handleCreateService = async () => {
        if (!newName.trim()) return
        setCreatingService(true)
        setError(null)
        try {
            await createService({ name: newName, durationMinutes: newDuration })
            const data = await getConfiguration()
            setServices(data.services)
            setNewName("")
            setNewDuration(30)
            setShowNewForm(false)
        } catch (err: any) {
            setError(err.message || "Error al crear servicio")
        } finally {
            setCreatingService(false)
        }
    }

    const handleUpdateService = async (id: string) => {
        if (!editName.trim()) return
        setUpdatingService(true)
        setError(null)
        try {
            await updateService(id, { name: editName, durationMinutes: editDuration })
            const data = await getConfiguration()
            setServices(data.services)
            setEditingId(null)
        } catch (err: any) {
            setError(err.message || "Error al actualizar")
        } finally {
            setUpdatingService(false)
        }
    }

    const handleDeleteService = async (id: string) => {
        setDeletingId(id)
        setError(null)
        try {
            await deleteService(id)
            setServices(prev => prev.filter(s => s.id !== id))
        } catch (err: any) {
            setError(err.message || "Error al eliminar")
        } finally {
            setDeletingId(null)
        }
    }

    const handleToggleActive = async (service: ServiceItem) => {
        setError(null)
        try {
            await updateService(service.id, { isActive: !service.isActive })
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, isActive: !s.isActive } : s))
        } catch (err: any) {
            setError(err.message || "Error al actualizar")
        }
    }

    const startEditing = (service: ServiceItem) => {
        setEditingId(service.id)
        setEditName(service.name)
        setEditDuration(service.durationMinutes)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Cargando configuración...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Display Name Section */}
            <section className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">Nombre Público</h3>
                    <p className="text-sm text-muted-foreground">El nombre que verán tus clientes al agendar.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 space-y-2">
                        <Label className="sr-only">Nombre</Label>
                        <Input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Tu nombre público"
                        />
                    </div>
                    <Button
                        onClick={handleSaveName}
                        disabled={savingName}
                        className={cn(
                            "shrink-0 transition-all",
                            nameSuccess && "bg-green-500 hover:bg-green-500 text-white"
                        )}
                    >
                        {savingName ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : nameSuccess ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {savingName ? "Guardando..." : nameSuccess ? "Guardado" : "Guardar"}
                    </Button>
                </div>
            </section>

            {/* Services Section */}
            <section className="space-y-6 border-t pt-8">
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Servicios</h3>
                        <p className="text-sm text-muted-foreground">Define los servicios que ofreces y su duración.</p>
                    </div>
                    {!showNewForm && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowNewForm(true)}
                            className="shrink-0"
                        >
                            <Plus className="h-4 w-4" />
                            Añadir Servicio
                        </Button>
                    )}
                </div>

                {/* New Service Form */}
                {showNewForm && (
                    <div className="p-4 border-2 border-dashed border-primary/30 rounded-xl space-y-4 bg-primary/5 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                            <Label>Nombre del servicio</Label>
                            <Input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ej: Consulta General, Corte de Cabello..."
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Duración</Label>
                            <div className="flex flex-wrap gap-2">
                                {DURATION_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setNewDuration(opt.value)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all",
                                            newDuration === opt.value
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-card border-muted hover:border-primary/50"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setShowNewForm(false); setNewName(""); setNewDuration(30) }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCreateService}
                                disabled={creatingService || !newName.trim()}
                            >
                                {creatingService ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Crear Servicio
                            </Button>
                        </div>
                    </div>
                )}

                {/* Service List */}
                {services.length === 0 && !showNewForm ? (
                    <div className="p-8 text-center border-2 border-dashed rounded-2xl bg-muted/20">
                        <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">
                            Aún no tienes servicios configurados.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Agrega al menos uno para que tus clientes puedan elegir al agendar.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className={cn(
                                    "p-4 border rounded-xl transition-all",
                                    !service.isActive && "opacity-50",
                                    editingId === service.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/30"
                                )}
                            >
                                {editingId === service.id ? (
                                    /* Edit Mode */
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Nombre</Label>
                                            <Input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Duración</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {DURATION_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setEditDuration(opt.value)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all",
                                                            editDuration === opt.value
                                                                ? "bg-primary text-primary-foreground border-primary"
                                                                : "bg-card border-muted hover:border-primary/50"
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                                <X className="h-4 w-4" />
                                                Cancelar
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateService(service.id)}
                                                disabled={updatingService || !editName.trim()}
                                            >
                                                {updatingService ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                Guardar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* View Mode */
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Briefcase className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{service.name}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {service.durationMinutes >= 60
                                                        ? `${Math.floor(service.durationMinutes / 60)}h ${service.durationMinutes % 60 > 0 ? `${service.durationMinutes % 60}min` : ""}`
                                                        : `${service.durationMinutes} min`}
                                                </span>
                                                {!service.isActive && (
                                                    <span className="ml-2 px-1.5 py-0.5 bg-muted rounded text-[10px] font-bold uppercase">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => handleToggleActive(service)}
                                                className={cn(
                                                    "p-2 rounded-lg text-xs font-bold transition-colors",
                                                    service.isActive
                                                        ? "text-green-600 hover:bg-green-500/10"
                                                        : "text-muted-foreground hover:bg-muted"
                                                )}
                                                title={service.isActive ? "Desactivar" : "Activar"}
                                            >
                                                <div className={cn(
                                                    "h-3 w-3 rounded-full border-2 transition-colors",
                                                    service.isActive ? "bg-green-500 border-green-500" : "border-muted-foreground"
                                                )} />
                                            </button>
                                            <button
                                                onClick={() => startEditing(service)}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteService(service.id)}
                                                disabled={deletingId === service.id}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                            >
                                                {deletingId === service.id
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <Trash2 className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                    {error}
                </div>
            )}
        </div>
    )
}
