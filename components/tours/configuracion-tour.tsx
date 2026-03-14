"use client"

import { PageTour } from "@/components/page-tour"

export function ConfiguracionTour() {
    const steps = [
        {
            title: "Configuración de Servicios",
            intro: "Bienvenido a la sección de ingeniería de servicios. Aquí es donde diseñas tu oferta comercial.",
            position: "bottom"
        },
        {
            element: "#tour-services-list",
            title: "Tus Servicios",
            intro: "Esta lista muestra todos los servicios que ofreces. Puedes activarlos, editarlos o eliminarlos desde aquí.",
            position: "right"
        },
        {
            element: "#tour-new-service",
            title: "Nuevo Servicio",
            intro: "¿Tienes una nueva idea? Haz clic aquí para definir un nuevo nombre, precio y duración.",
            position: "left"
        },
        {
            element: "#tour-branding-section",
            title: "Marca y Logística",
            intro: "Personaliza cómo te ven tus clientes y define las reglas básicas de tu operación.",
            position: "left"
        },
        {
            element: "#tour-save-config",
            title: "Guardar Cambios",
            intro: "No olvides guardar después de actualizar tu nombre o reglas de antelación.",
            position: "top"
        }
    ]

    return (
        <PageTour
            pageKey="configuracion"
            version="2026-03-14T17:46:00Z"
            steps={steps}
        />
    )
}
