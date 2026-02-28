"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-5.5 shrink-0 rounded-sm border-2 border-muted-foreground/30 bg-background/50",
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:border-primary/80 hover:scale-105 active:scale-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:shadow-[0_0_20px_-5px_oklch(var(--primary)/0.5)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-primary-foreground"
      >
        <CheckIcon className="size-4 stroke-3 animate-in zoom-in-50 fade-in duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
