import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { canManageProfile } from "@/lib/permissions"
import { PROFILE_CHANNEL_PREFIX } from "@/lib/realtime-channels"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Autoriza suscripciones a canales privados de Pusher.
 * Solo el dueño del perfil o un OWNER/MANAGER de una organización compartida
 * puede escuchar `private-profile-<profileId>`.
 */
export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const form = await req.formData()
    const socketId = form.get("socket_id")
    const channelName = form.get("channel_name")

    if (typeof socketId !== "string" || typeof channelName !== "string") {
        return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
    }

    if (!channelName.startsWith(PROFILE_CHANNEL_PREFIX)) {
        return NextResponse.json({ error: "Canal no permitido" }, { status: 403 })
    }

    const profileId = channelName.slice(PROFILE_CHANNEL_PREFIX.length)
    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        select: { userId: true }
    })

    if (!profile || !(await canManageProfile(session.user.id, profile.userId))) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json(pusherServer.authorizeChannel(socketId, channelName))
}
