"use client"

import { PageTour } from "@/components/page-tour"

export function PerfilTour() {
    const tourVersion = "2026-03-14-v5" // Update this to trigger the tour again for testing
    const steps = [
        {
            title: "Tu Perfil Profesional",
            intro: "Esta es tu identidad digital en VLink. Aquí configuras cómo te presentas al mundo.",
            position: "bottom"
        },
        {
            element: "#tour-profile-anchor",
            title: "Tu Link Público",
            intro: "Este es el enlace que debes compartir con tus clientes para que agenden contigo. ¡Cópialo y pégalo en tus redes!",
            position: "auto"
        },
        {
            element: "#tour-username-anchor",
            title: "Tu Identidad",
            intro: "Personaliza tu URL única. Elige un nombre fácil de recordar para tus clientes.",
            position: "auto"
        },
        {
            element: "#tour-bio-anchor",
            title: "Tu Biografía",
            intro: "Cuéntales a tus clientes quién eres y qué valor aportas. Una buena biografía genera confianza.",
            position: "auto"
        },
        {
            element: "#tour-google-anchor",
            title: "Google Calendar",
            intro: "Conecta tu calendario de Google para que VLink respete tus compromisos personales automáticamente.",
            position: "auto"
        },
        {
            element: "#tour-save-anchor",
            title: "Actualizar Perfil",
            intro: "Haz clic aquí para publicar todos tus cambios de identidad.",
            position: "top"
        }
    ]

    return (
        <PageTour
            pageKey="perfil"
            version="2024-03-14-v1"
            steps={steps}
        />
    )
}
