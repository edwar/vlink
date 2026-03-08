import { MaintenanceGuard } from "@/components/maintenance-guard"
import { BookingClient } from "./booking-client"

export default async function BookingPage({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = await params
    return (
        <MaintenanceGuard>
            <BookingClient params={resolvedParams} />
        </MaintenanceGuard>
    )
}
