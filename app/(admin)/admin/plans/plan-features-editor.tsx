"use client"

import { PillInput } from "@/components/ui/pill-input"
import { useState } from "react"

interface PlanFeaturesEditorProps {
    initialFeatures: string[]
}

export function PlanFeaturesEditor({ initialFeatures }: PlanFeaturesEditorProps) {
    const [features, setFeatures] = useState<string[]>(initialFeatures)

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Características (Enter/Coma para añadir)
            </label>
            <PillInput
                value={features}
                onChange={setFeatures}
                placeholder="Ej: Sync Google, API..."
                className="bg-muted/40 border-none px-4 py-3"
            />
            {/* Hidden input to be picked up by the Server Action formData */}
            <input type="hidden" name="features" value={features.join(',')} />
        </div>
    )
}
