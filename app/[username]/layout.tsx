import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Agendar cita — VLink",
    description: "Reserva una cita con tu profesional de confianza a través de VLink.",
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
    return children
}
