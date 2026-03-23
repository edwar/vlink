"use client"

import { PageTour } from "@/components/page-tour"

export function PerfilTour() {
    const steps = [
        {
            title: "Tu Perfil Profesional",
            intro: "Esta es tu identidad digital en VLink. Aquí configuras cómo te presentas al mundo.",
            position: "bottom"
        },
        {
            element: "#tour-profile-url",
            title: "Tu Link Público",
            intro: "Este es el enlace que debes compartir con tus clientes para que agenden contigo. ¡Cópialo y pégalo en tus redes!",
            position: "auto"
        },
        {
            element: "#tour-username",
            title: "Tu Identidad",
            intro: "Personaliza tu URL única. Elige un nombre fácil de recordar para tus clientes.",
            position: "auto"
        },
        {
            element: "#tour-bio",
            title: "Tu Biografía",
            intro: "Cuéntales a tus clientes quién eres y qué valor aportas. Una buena biografía genera confianza.",
            position: "auto"
        },
        {
            element: "#tour-google-sync",
            title: "Google Calendar",
            intro: "Conecta tu calendario de Google para que VLink respete tus compromisos personales automáticamente.",
            position: "auto"
        },
        {
            element: "#tour-policies",
            title: "Tus Reglas de Agenda",
            intro: "Define tiempos de descanso (Buffer) entre citas y cuánto tiempo de aviso mínimo necesitas para una reserva.",
            position: "auto"
        },
        {
            element: "#tour-save",
            title: "Actualizar Perfil",
            intro: "Haz clic aquí para publicar todos tus cambios de identidad.",
            position: "top"
        }
    ]

    return (
        <PageTour
            pageKey="perfil"
            version="2026-03-27T12:00:00Z"
            steps={steps}
        />
    )
}
