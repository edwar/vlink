"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { pusherClient } from "@/lib/pusher-client"
import { profileChannel } from "@/lib/realtime-channels"

/**
 * Escucha eventos de Pusher para refrescar el dashboard 
 * en tiempo real cuando hay cambios en la base de datos.
 */
export function DashboardRealtimeUpdater({ profileId }: { profileId: string }) {
    const router = useRouter()

    useEffect(() => {
        // Suscribirse al canal específico del perfil/usuario
        const channel = pusherClient.subscribe(profileChannel(profileId))
        
        // Escuchar el evento de actualización
        channel.bind("appointments-updated", () => {
            console.log("[Realtime] Cambios detectados en la base de datos, refrescando UI...")
            // Refrescamos los Server Components sin recargar la página completa
            router.refresh()
        })

        return () => {
            pusherClient.unsubscribe(profileChannel(profileId))
        }
    }, [profileId, router])

    return null
}
