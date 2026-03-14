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
            element: "#tour-calendar-switcher-anchor",
            title: "Cambiar Vista",
            intro: "¿Prefieres ver tu día, tu semana o el mes completo? Cambia la perspectiva según tu necesidad.",
            position: "auto"
        },
        {
            element: "#tour-calendar-nav-anchor",
            title: "Navegación Temporal",
            intro: "Muévete entre fechas fácilmente o regresa al día de hoy con un solo clic.",
            position: "auto"
        },
        {
            element: "#tour-calendar-content-anchor",
            title: "Gestión de Citas",
            intro: "Haz clic en cualquier espacio disponible para bloquearlo, o selecciona una cita existente para ver los detalles del cliente.",
            position: "auto"
        }
    ]

    return (
        <PageTour
            pageKey="agenda"
            version="2024-03-14-v1"
            steps={steps}
        />
    )
}
