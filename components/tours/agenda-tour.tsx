"use client"

import { PageTour } from "@/components/page-tour"

export function AgendaTour() {
    const steps = [
        {
            title: "Tu Agenda Profesional",
            intro: "VLink te ofrece una vista clara de tus compromisos. Aquí gestionas el día a día de tu negocio.",
            position: "bottom"
        },
        {
            element: "#tour-calendar-location",
            title: "Seleccionar Ubicación",
            intro: "Visualiza la agenda de una sede específica. Esto te permite gestionar tus compromisos por ubicación de forma independiente.",
            position: "auto"
        },
        {
            element: "#tour-calendar-view-switcher",
            title: "Cambiar Vista",
            intro: "¿Prefieres ver tu día, tu semana o el mes completo? Cambia la perspectiva según tu necesidad.",
            position: "auto"
        },
        {
            element: "#tour-calendar-nav",
            title: "Navegación Temporal",
            intro: "Muévete entre fechas fácilmente o regresa al día de hoy con un solo clic.",
            position: "auto"
        },
        {
            element: "#tour-calendar-content",
            title: "Gestión de Citas",
            intro: "Haz clic en cualquier espacio disponible para bloquearlo, o selecciona una cita existente para ver los detalles del cliente.",
            position: "auto"
        }
    ]

    return (
        <PageTour
            pageKey="agenda"
            version="2026-03-27T12:00:00Z"
            steps={steps}
        />
    )
}
