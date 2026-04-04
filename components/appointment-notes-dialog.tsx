"use client"

import { useState } from "react"
import { StickyNote, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { updateAppointmentNotesAction } from "@/app/actions/appointment-notes"
import { sileo } from "sileo"
import { Textarea } from "./ui/textarea"

interface AppointmentNotesDialogProps {
    apptId: string
    clientName: string
    initialNotes: string | null
}

export function AppointmentNotesDialog({ apptId, clientName, initialNotes }: AppointmentNotesDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [notes, setNotes] = useState(initialNotes || "")
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await updateAppointmentNotesAction(apptId, notes)
            if (result.success) {
                sileo.success({ title: "Notas actualizadas", description: "Las notas internas se han guardado." })
                setIsOpen(false)
            } else {
                sileo.error({ title: "Error", description: result.error ?? "No se pudieron guardar las notas." })
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    className="h-12 w-12 rounded-2xl flex items-center justify-center transition-all shrink-0 border bg-amber-500/5 text-amber-600 border-amber-500/20 hover:bg-amber-500 hover:text-white"
                    title="Notas internas"
                >
                    <StickyNote className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader className="pt-4">
                    <div className="h-16 w-16 bg-primary-foreground rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                        <StickyNote className="h-8 w-8" />
                    </div>
                    <DialogTitle className="text-2xl font-display font-black tracking-tight text-center">
                        Notas Internas
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground text-center">
                        Notas privadas para <span className="font-bold text-foreground">{clientName}</span>. El cliente no podrá verlas.
                    </p>
                </DialogHeader>

                <div className="space-y-4 pb-2">
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Escribe detalles importantes del cliente, preferencias, historial..."
                        className="w-full h-40 p-4 rounded-2xl bg-muted/50 border border-primary/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 transition-all"
                    />

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-12 rounded-2xl font-bold text-sm bg-primary hover:bg-primary/80 shadow-lg shadow-primary/20 text-primary-foreground"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                            </span>
                        ) : (
                            "Guardar notas"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
