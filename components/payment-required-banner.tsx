"use client"

import { CreditCard, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface PaymentRequiredBannerProps {
    planName: string
    daysRemaining: number | null
    endDate: number | null
}

export function PaymentRequiredBanner({ planName, daysRemaining, endDate }: PaymentRequiredBannerProps) {
    const [dismissed, setDismissed] = useState(false)
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null)

    useEffect(() => {
        if (!endDate) return

        const interval = setInterval(() => {
            const now = new Date().getTime()
            const distance = endDate - now

            if (distance < 0) {
                clearInterval(interval)
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 })
                return
            }

            setTimeLeft({
                d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((distance % (1000 * 60)) / 1000)
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [endDate])

    if (dismissed) return null

    const isUrgent = daysRemaining !== null && daysRemaining <= 7

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`relative px-4 py-3 md:px-5 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 border-b ${isUrgent
                    ? "bg-destructive/10 border-destructive/20"
                    : "bg-blue-500/5 border-blue-500/10"
                    }`}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`hidden sm:flex h-8 w-8 rounded-xl items-center justify-center shrink-0 ${isUrgent ? "bg-destructive/15 text-destructive" : "bg-blue-500/10 text-blue-600"
                        }`}>
                        <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <div className={`text-[10px] md:text-xs font-bold leading-tight ${isUrgent ? "text-destructive dark:text-destructive" : "text-blue-700 dark:text-blue-400"}`}>
                            {timeLeft ? (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                                    <span className="opacity-80">Trial expira en:</span>
                                    <div className="flex gap-1 items-center">
                                        <div className="flex flex-col items-center">
                                            <motion.span
                                                key={`days-${timeLeft.d}`}
                                                initial={{ opacity: 0.3 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5 }}
                                                className={cn(
                                                    "bg-primary/10 px-1.5 py-0.5 rounded-md font-mono text-[11px] md:text-xs min-w-[28px] text-center border border-primary/10",
                                                    isUrgent ? "bg-destructive/10 border-destructive/20" : ""
                                                )}
                                            >
                                                {timeLeft.d}d
                                            </motion.span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <motion.span
                                                key={`hours-${timeLeft.h}`}
                                                initial={{ opacity: 0.3 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5 }}
                                                className={cn(
                                                    "bg-primary/10 px-1.5 py-0.5 rounded-md font-mono text-[11px] md:text-xs min-w-[28px] text-center border border-primary/10",
                                                    isUrgent ? "bg-destructive/10 border-destructive/20" : ""
                                                )}
                                            >
                                                {timeLeft.h}h
                                            </motion.span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <motion.span
                                                key={`minutes-${timeLeft.m}`}
                                                initial={{ opacity: 0.3 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5 }}
                                                className={cn(
                                                    "bg-primary/10 px-1.5 py-0.5 rounded-md font-mono text-[11px] md:text-xs min-w-[28px] text-center border border-primary/10",
                                                    isUrgent ? "bg-destructive/10 border-destructive/20" : ""
                                                )}
                                            >
                                                {timeLeft.m}m
                                            </motion.span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <motion.span
                                                key={`seconds-${timeLeft.s}`}
                                                initial={{ opacity: 0.3 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5 }}
                                                className={cn(
                                                    "bg-primary/10 px-1.5 py-0.5 rounded-md font-mono text-[11px] md:text-xs min-w-[28px] text-center border border-primary/10",
                                                    isUrgent ? "bg-destructive/10 border-destructive/20" : ""
                                                )}
                                            >
                                                {timeLeft.s}s
                                            </motion.span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                isUrgent
                                    ? `Tu periodo de prueba expira en ${daysRemaining} ${daysRemaining === 1 ? "día" : "días"}`
                                    : `Estás usando el plan ${planName} en periodo de prueba gratuito`
                            )}
                        </div>
                        <p className={cn("block text-[11px] font-display", isUrgent ? "text-destructive/50" : "text-muted-foreground")}>
                            Agrega un método de pago para desbloquear todas las características sin interrupciones.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/dashboard/organizacion/planes"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${isUrgent
                            ? "bg-destructive text-white hover:bg-destructive/80"
                            : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/20"
                            }`}
                    >
                        Agregar Tarjeta
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                    <button
                        onClick={() => setDismissed(true)}
                        className="absolute top-2 right-2 md:relative md:top-0 md:right-0 p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
