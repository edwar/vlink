"use client"

import { PageTour } from "@/components/page-tour"

export function DisponibilidadTour() {
    const steps = [
        {
            title: "Control de Disponibilidad",
            intro: "Define exactamente cuándo estás disponible para recibir citas. El control total de tu tiempo está aquí.",
            position: "bottom"
        },
        {
            element: "#tour-weekly-header",
            title: "Horario Semanal",
            intro: "Define aquí tus horas de trabajo recurrentes para que tus clientes puedan agendar.",
            position: "auto"
        },
        {
            element: "#tour-weekly-location",
            title: "Selección de Sede",
            intro: "Elige la sede sobre la cual deseas configurar el horario. Puedes cambiar entre tus múltiples sedes rápidamente aquí.",
            position: "auto"
        },
        {
            element: "#tour-weekly-days",
            title: "Configuración por Día",
            intro: "Activa cada día y define tus rangos de trabajo, incluyendo tus horas de almuerzo.",
            position: "auto"
        },
        {
            element: "#tour-special-blocks",
            title: "Bloqueos Especiales",
            intro: "¿Vacaciones o una cita médica? Añade bloqueos para días específicos en los que no quieres ser agendado.",
            position: "auto"
        },
        {
            element: "#tour-save-availability",
            title: "Guardar Disponibilidad",
            intro: "Asegura todos tus cambios de horario haciendo clic en este botón.",
            position: "auto"
        }
    ]

    return (
        <PageTour
            pageKey="disponibilidad"
            version="2026-03-28T12:00:00Z"
            steps={steps}
        />
    )
}
