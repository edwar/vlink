"use client"

import { PageTour } from "@/components/page-tour"
import { useEffect, useState } from "react"

export function DashboardTour() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024) // lg breakpoint
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const steps = [
        {
            title: "¡Bienvenido a VLink! 👋",
            intro: "Estamos emocionados de tenerte aquí. Vamos a darte un recorrido rápido por tu nuevo panel de control.",
            position: 'auto' as const
        },
        // Skip "Modo Oscuro" step on mobile
        ...(!isMobile ? [{
            element: "#tour-theme-toggle",
            title: "Modo Oscuro",
            intro: "¿Prefieres trabajar de noche? Cambia el tema aquí con un solo clic.",
            position: 'bottom' as const
        }] : []),
        {
            element: isMobile ? "#tour-mobile-nav-trigger" : "#tour-nav",
            title: "Navegación",
            intro: isMobile 
                ? "Toca el menú para acceder a tu agenda, equipo, perfil y configuraciones."
                : "Accede a tu agenda, equipo, perfil y configuraciones desde aquí.",
            position: isMobile ? 'bottom' : 'right' as const
        },
        {
            element: "#tour-tab-agenda",
            title: "Agenda principal",
            intro: "Esta es tu vista principal del calendario y las listas de citas.",
            position: 'bottom' as const
        },
        {
            element: "#tour-agenda-tabs",
            title: "Vistas de la Agenda",
            intro: "Ahora puedes navegar fácilmente entre las citas de Hoy, Próximas Reservas y tu Historial pasadas desde estas pestañas.",
            position: 'bottom' as const
        },
        {
            element: "#tour-tab-analytics",
            title: "Analíticas",
            intro: "Mide tu crecimiento y el rendimiento de tus servicios con datos precisos.",
            position: 'bottom' as const
        },
        {
            element: "#tour-today-summary",
            title: "Resumen de Hoy",
            intro: "Mira rápidamente cuántas citas tienes para hoy.",
            position: 'auto' as const
        },
        {
            element: "#tour-export-anchor",
            title: "Tus Datos",
            intro: "Puedes exportar tu historial de citas a CSV en cualquier momento.",
            position: isMobile ? 'bottom' : 'left' as const
        }
    ]

    return (
        <PageTour 
            pageKey="dashboard-main" 
            version="2026-03-22T23:55:00Z" 
            steps={steps} 
        />
    )
}
