"use client"

import { useState, useRef, useEffect } from "react"
import { updateOrganizationName } from "@/app/actions/organization"
import { sileo } from "sileo"
import { Pencil, Check, X, Loader2 } from "lucide-react"

interface RenameOrganizationProps {
    organizationId: string
    currentName: string
}

export function RenameOrganization({ organizationId, currentName }: RenameOrganizationProps) {
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState(currentName)
    const [saving, setSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus()
            inputRef.current?.select()
        }
    }, [editing])

    const handleSave = async () => {
        if (value.trim() === currentName) {
            setEditing(false)
            return
        }
        setSaving(true)
        try {
            await updateOrganizationName(organizationId, value)
            sileo.success({
                title: "Nombre actualizado",
                description: `La organización ahora se llama "${value.trim()}".`
            })
            setEditing(false)
        } catch (err) {
            sileo.error({
                title: "Error",
                description: err instanceof Error ? err.message : "No se pudo actualizar el nombre."
            })
            setValue(currentName)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setValue(currentName)
        setEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave()
        if (e.key === "Escape") handleCancel()
    }

    if (editing) {
        return (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={saving}
                    className="text-5xl font-display font-black tracking-tighter text-primary uppercase bg-transparent border-b-2 border-primary/40 focus:border-primary outline-none w-full max-w-sm transition-colors"
                    placeholder="Nombre de la organización"
                />
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handleSave}
                        disabled={saving || !value.trim()}
                        className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                    >
                        {saving
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Check className="h-4 w-4" />
                        }
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 disabled:opacity-50 transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3 group/rename">
            <h1 className="text-5xl font-display font-black tracking-tighter text-primary uppercase">
                {value}
            </h1>
            <button
                onClick={() => setEditing(true)}
                title="Editar nombre de la organización"
                className="h-9 w-9 rounded-xl bg-primary/5 border border-primary/10 text-primary/40 flex items-center justify-center opacity-0 group-hover/rename:opacity-100 hover:bg-primary/10 hover:text-primary hover:border-primary/20 hover:scale-105 transition-all duration-200"
            >
                <Pencil className="h-4 w-4" />
            </button>
        </div>
    )
}
