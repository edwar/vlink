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
            element: "#tour-org-payments-anchor",
            title: "Pagos y Cobros",
            intro: "Configura tu cuenta de Wompi para automatizar los cobros de tu organización y gestionar tus ingresos.",
            position: "auto"
        },
        {
            element: "#tour-org-contact-anchor",
            title: "Comunicación y Soporte",
            intro: "Mantén actualizados tus canales de contacto (WhatsApp y teléfono) para que tus clientes puedan comunicarse contigo fácilmente.",
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
            element: "#tour-org-public-page",
            title: "Página Pública",
            intro: "Visualiza cómo tus clientes ven el perfil de tu organización y agendan citas directamente con tus profesionales.",
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
            version="2026-03-20T23:40:00Z"
            steps={steps}
        />
    )
}
