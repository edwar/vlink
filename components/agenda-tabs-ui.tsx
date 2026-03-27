"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface AgendaTabsUIProps {
    children_hoy: React.ReactNode
    children_proximas: React.ReactNode
    children_historial: React.ReactNode
}

export function AgendaTabsUI({
    children_hoy,
    children_proximas,
    children_historial
}: AgendaTabsUIProps) {
    const [activeTab, setActiveTab] = React.useState("hoy")

    return (
        <Tabs defaultValue="hoy" onValueChange={setActiveTab} className="w-full">
            <TabsList id="tour-agenda-tabs" className="relative w-full max-w-3xl bg-surface/50 border border-border/20 p-1 rounded-full h-auto! gap-1 mb-6 flex overflow-hidden">
                <TabsTrigger
                    value="hoy"
                    className={cn(
                        "relative z-10 flex-1 min-w-0 rounded-full h-auto px-1 sm:px-6 py-2 sm:py-3 font-bold sm:font-black uppercase text-[9px] sm:text-xs tracking-widest sm:tracking-[0.2em] transition-all duration-300 shadow-none border-none",
                        activeTab === "hoy" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {activeTab === "hoy" && (
                        <motion.div
                            layoutId="agenda-active-pill"
                            className="absolute inset-0 bg-linear-to-br from-primary/10 to-primary/5 rounded-full border border-primary/10 shadow-[0_2px_10px_-3px_rgba(var(--primary),0.1)]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-20 whitespace-nowrap">Agenda</span>
                </TabsTrigger>

                <TabsTrigger
                    value="proximas"
                    className={cn(
                        "relative z-10 flex-1 min-w-0 rounded-full h-auto px-1 sm:px-6 py-2 sm:py-3 font-bold sm:font-black uppercase text-[9px] sm:text-xs tracking-widest sm:tracking-[0.2em] transition-all duration-300 shadow-none border-none",
                        activeTab === "proximas" ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {activeTab === "proximas" && (
                        <motion.div
                            layoutId="agenda-active-pill"
                            className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-blue-500/5 rounded-full border border-blue-500/10 shadow-[0_2px_10px_-3px_rgba(59,130,246,0.1)]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-20 whitespace-nowrap">Reservas</span>
                </TabsTrigger>

                <TabsTrigger
                    value="historial"
                    className={cn(
                        "relative z-10 flex-1 min-w-0 rounded-full h-auto px-1 sm:px-6 py-2 sm:py-3 font-bold sm:font-black uppercase text-[9px] sm:text-xs tracking-widest sm:tracking-[0.2em] transition-all duration-300 shadow-none border-none",
                        activeTab === "historial" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {activeTab === "historial" && (
                        <motion.div
                            layoutId="agenda-active-pill"
                            className="absolute inset-0 bg-muted/60 rounded-full border border-border/40 shadow-sm"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-20 whitespace-nowrap">Historial</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="hoy" className="m-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in duration-500">
                {children_hoy}
            </TabsContent>

            <TabsContent value="proximas" className="m-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in duration-500">
                {children_proximas}
            </TabsContent>

            <TabsContent value="historial" className="m-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in duration-500">
                {children_historial}
            </TabsContent>
        </Tabs>
    )
}
