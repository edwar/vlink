import { notFound } from "next/navigation"
import { getAppointmentByToken } from "@/app/actions/client-cancel"
import { CancelPageClient } from "@/components/cancel-page-client"
import { Title } from "@/components/title"

interface CancelPageProps {
    params: {
        token: string
    }
}

export default async function CancelPage({ params }: CancelPageProps) {
    const { token } = await params
    const appointment = await getAppointmentByToken(token)

    if (!appointment) {
        return notFound()
    }

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto relative rounded-3xl p-6 md:p-8 bg-linear-to-br from-card to-card border-2 border-primary/5 shadow-none">
                <div className="mb-8">
                    <Title title="Cancelar Reserva" className="text-3xl" />
                    <p className="text-muted-foreground font-medium text-sm mt-3">
                        Revisa los detalles de tu cita antes de confirmar la cancelación.
                    </p>
                </div>

                <CancelPageClient appointment={appointment} token={token} />
            </div>
        </main>
    )
}
