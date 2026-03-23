"use client"

import { useState } from "react"
import { updateOrganizationHolidayWork } from "@/app/actions/organization"

interface ToggleHolidayWorkProps {
  initialValue: boolean
  organizationId: string
}

export function ToggleHolidayWork({ initialValue, organizationId }: ToggleHolidayWorkProps) {
  const [enabled, setEnabled] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setLoading(true)
    try {
      await updateOrganizationHolidayWork(organizationId, checked)
      setEnabled(checked)
    } catch (error) {
      console.error(error)
      // Revert checkbox state on error
      e.target.checked = !checked
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl shadow-sm mb-6 max-w-lg">
      <input
        type="checkbox"
        id="holiday-work"
        checked={enabled}
        onChange={handleToggle}
        disabled={loading}
        className="w-5 h-5 accent-primary cursor-pointer rounded border-primary/20"
      />
      <label htmlFor="holiday-work" className="text-sm font-black text-primary cursor-pointer select-none">
        Permitir agendar en días festivos (Global)
      </label>
      {loading && <span className="text-[10px] animate-pulse">Guardando...</span>}
    </div>
  )
}

