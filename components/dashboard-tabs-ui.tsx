"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface DashboardTabsUIProps {
    children_agenda: React.ReactNode
    children_analytics: React.ReactNode
    stats: {
        totalToday: number
        totalActive: number
        hoursOccupied: number
    }
    exportLink: React.ReactNode
}

export function DashboardTabsUI({ 
    children_agenda, 
    children_analytics,
    stats,
    exportLink
}: DashboardTabsUIProps) {
    const [activeTab, setActiveTab] = React.useState("agenda")

    return (
        <Tabs defaultValue="agenda" onValueChange={setActiveTab} className="space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-2">
                <TabsList className="relative w-fit xs:w-auto bg-surface/50 border border-border/20 p-1.5 rounded-full h-auto gap-1">
                    <TabsTrigger 
                        id="tour-tab-agenda"
                        value="agenda" 
                        className={cn(
                            "relative z-10 flex-1 sm:flex-none rounded-full px-6 sm:px-8 py-3 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] transition-colors duration-300 shadow-none border-none",
                            activeTab === "agenda" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {activeTab === "agenda" && (
                            <motion.div
                                layoutId="active-pill"
                                className="absolute inset-0 bg-linear-to-br from-primary/10 to-primary/5 rounded-full border border-primary/10 shadow-[0_2px_10px_-3px_rgba(var(--primary),0.1)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-20">Mi Agenda</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                        id="tour-tab-analytics"
                        value="analytics" 
                        className={cn(
                            "relative z-10 flex-1 sm:flex-none rounded-full px-6 sm:px-8 py-3 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] transition-colors duration-300 shadow-none border-none",
                            activeTab === "analytics" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {activeTab === "analytics" && (
                            <motion.div
                                layoutId="active-pill"
                                className="absolute inset-0 bg-linear-to-br from-primary/10 to-primary/5 rounded-full border border-primary/10 shadow-[0_2px_10px_-3px_rgba(var(--primary),0.1)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-20">Estadísticas</span>
                    </TabsTrigger>
                </TabsList>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div id="tour-export-csv" className="relative flex items-center gap-4 sm:gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground w-fit bg-transparent px-2 py-2 overflow-x-auto custom-scrollbar">
                        <div id="tour-export-anchor" className="absolute inset-0 pointer-events-none rounded-[inherit]" />
                        <span className="flex items-center gap-2 shrink-0">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <div className="h-3 w-px bg-border/50 shrink-0" />
                        <span className="flex items-center gap-2 shrink-0"><div className="h-2 w-2 rounded-full bg-primary" /> {stats.totalToday} Hoy</span>
                        <div className="h-3 w-px bg-border/50 shrink-0" />
                        <span className="flex items-center gap-2 shrink-0"><div className="h-2 w-2 rounded-full bg-blue-500" /> {stats.totalActive} Activas</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-border/50 shrink-0" />
                        {exportLink}
                    </div>
                </div>
            </div>

            <TabsContent value="agenda" className="space-y-16 mt-0 focus-visible:ring-0">
                {children_agenda}
            </TabsContent>

            <TabsContent value="analytics" className="mt-0 focus-visible:ring-0">
                {children_analytics}
            </TabsContent>
        </Tabs>
    )
}
