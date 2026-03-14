"use client"

import { PageTour } from "@/components/page-tour"

export function OrganizacionTour() {
    const steps = [
        {
            title: "Gestión de Organización",
            intro: "VLink es potente para equipos. Aquí gestionas a tus profesionales y la marca corporativa.",
            position: "bottom"
        },
        {
            element: "#tour-org-qr-anchor",
            title: "Marketing y QR",
            intro: "Descarga el QR de tu organización para tu local o publicidad impresa. ¡Facilita el agendamiento!",
            position: "auto"
        },
        {
            element: "#tour-org-invite-anchor",
            title: "Crecimiento de Equipo",
            intro: "Invita a otros profesionales a unirse a tu equipo compartiendo el link de invitación.",
            position: "auto"
        },
        {
            element: "#tour-team-members-anchor",
            title: "Tus Profesionales",
            intro: "Aquí verás a todos los miembros de tu equipo, sus roles y estados actuales.",
            position: "auto"
        },
        {
            element: "#tour-team-agenda",
            title: "Vista de Equipo",
            intro: "Accede a la agenda consolidada de toda la organización para una mejor coordinación.",
            position: "auto"
        },
        {
            element: "#tour-org-plan",
            title: "Tu Plan",
            intro: "Gestiona los límites de tu equipo y mejora tus características escalando de plan.",
            position: "auto"
        }
    ]

    return (
        <PageTour
            pageKey="organizacion"
            version="2026-03-14T17:46:00Z"
            steps={steps}
        />
    )
}
