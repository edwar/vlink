"use client"

import { CreditCard, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PaymentRequiredBannerProps {
    planName: string
    daysRemaining: number | null
}

export function PaymentRequiredBanner({ planName, daysRemaining }: PaymentRequiredBannerProps) {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    const isUrgent = daysRemaining !== null && daysRemaining <= 7

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`relative px-4 py-3 md:px-5 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 border-b ${isUrgent
                    ? "bg-amber-500/10 border-amber-500/20"
                    : "bg-blue-500/5 border-blue-500/10"
                    }`}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`hidden sm:flex h-8 w-8 rounded-xl items-center justify-center shrink-0 ${isUrgent ? "bg-amber-500/15 text-amber-600" : "bg-blue-500/10 text-blue-600"
                        }`}>
                        <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-[10px] md:text-xs font-bold leading-tight ${isUrgent ? "text-amber-700 dark:text-amber-400" : "text-blue-700 dark:text-blue-400"}`}>
                            {isUrgent
                                ? `Tu periodo de prueba expira en ${daysRemaining} ${daysRemaining === 1 ? "día" : "días"}`
                                : `Estás usando el plan ${planName} en periodo de prueba gratuito`
                            }
                        </p>
                        <p className="hidden sm:block text-[11px] text-muted-foreground font-medium">
                            Agrega un método de pago para desbloquear todas las características sin interrupciones.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/dashboard/organizacion/planes"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${isUrgent
                            ? "bg-amber-500 text-white hover:bg-amber-600"
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
