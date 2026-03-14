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
            element: "#tour-weekly-anchor",
            title: "Horario Semanal",
            intro: "Configura tus horas de trabajo recurrentes. Activa los días que laboras y define tus franjas horarias.",
            position: "auto"
        },
        {
            element: "#tour-special-anchor",
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
            version="2026-03-14T17:46:00Z"
            steps={steps}
        />
    )
}
