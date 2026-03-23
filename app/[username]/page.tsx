import { getProfileForBooking } from "@/app/actions/booking"
import { MaintenanceGuard } from "@/components/maintenance-guard"
import { BookingClient } from "./booking-client"
import type { Metadata } from "next"

export async function generateMetadata({ 
    params 
}: { 
    params: Promise<{ username: string }> 
}): Promise<Metadata> {
    const resolvedParams = await params
    const profile = await getProfileForBooking(resolvedParams.username)

    if (!profile) {
        return {
            title: "Perfil no encontrado | VLink",
            description: "El perfil que buscas no existe en VLink.",
        }
    }

    const title = `Agendar cita con ${profile.displayName} | VLink`
    const description = profile.bio || `Reserva una cita con ${profile.displayName} de forma rápida y sencilla a través de VLink.`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            images: profile.image ? [{ url: profile.image }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: profile.image ? [profile.image] : [],
        },
    }
}

export default async function BookingPage({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = await params
    const profile = await getProfileForBooking(resolvedParams.username)

    const jsonLd = profile ? {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": profile.displayName,
        "description": profile.bio,
        "image": profile.image,
        "url": `https://vlink.cognilab.dev/${profile.username}`,
        "knowsAbout": profile.expertise,
        "provider": {
            "@type": "Person",
            "name": profile.displayName
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Servicios",
            "itemListElement": (profile.services as any[]).map((s: any, i: number) => ({
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": s.name
                },
                "price": s.price,
                "priceCurrency": "COP",
                "position": i + 1
            }))
        }
    } : null

    return (
        <MaintenanceGuard>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <BookingClient params={resolvedParams} />
        </MaintenanceGuard>
    )
}
