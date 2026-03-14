"use client"

import { PageTour } from "@/components/page-tour"

export function DashboardTour() {
    const steps = [
        {
            title: "¡Bienvenido a VLink! 👋",
            intro: "Estamos emocionados de tenerte aquí. Vamos a darte un recorrido rápido por tu nuevo panel de control.",
            position: 'auto' as const
        },
        {
            element: "#tour-theme-toggle",
            title: "Modo Oscuro",
            intro: "¿Prefieres trabajar de noche? Cambia el tema aquí con un solo clic.",
            position: 'bottom' as const
        },
        {
            element: "#tour-nav",
            title: "Navegación",
            intro: "Accede a tu agenda, equipo, perfil y configuraciones desde aquí.",
            position: 'right' as const
        },
        {
            element: "#tour-tab-agenda",
            title: "Tu Agenda",
            intro: "Visualiza todas tus citas del día y próximas reservas en un solo lugar.",
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
            position: 'left' as const
        }
    ]

    return (
        <PageTour 
            pageKey="dashboard-main" 
            version="2026-03-14" 
            steps={steps} 
        />
    )
}
