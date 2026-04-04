"use client"

import { useState } from "react"
import { updateOrganizationHolidayWork } from "@/app/actions/organization"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plane } from "lucide-react"

interface ToggleHolidayWorkProps {
  initialValue: boolean
  organizationId: string
}

export function ToggleHolidayWork({ initialValue, organizationId }: ToggleHolidayWorkProps) {
  const [enabled, setEnabled] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setLoading(true)
    try {
      await updateOrganizationHolidayWork(organizationId, checked)
      setEnabled(checked)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-linear-to-br from-primary/5 via-transparent to-transparent border border-border/40 overflow-hidden group h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Días Festivos</CardTitle>
            <CardDescription>
              Configura si tu organización acepta citas en feriados.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div
            onClick={() => !loading && handleToggle(!enabled)}
            className="flex items-center justify-between px-4 py-2 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group/row"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-sm text-foreground">
                Permitir agendar en días festivos (Global)
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Esta regla afecta a todos los profesionales.
              </span>
            </div>
            <div className="flex items-center gap-3">
              {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              <Checkbox
                checked={enabled}
                onCheckedChange={(checked) => handleToggle(!!checked)}
                disabled={loading}
                className="scale-110"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2 font-medium">
            <div className="mt-0.5 shrink-0">✨</div>
            <p className="leading-relaxed">
              {enabled
                ? "Tu calendario se mantendrá abierto incluso en días festivos."
                : "Se bloquearán automáticamente todos los días festivos."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
