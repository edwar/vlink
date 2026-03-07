import { NextRequest, NextResponse } from "next/server"
import { handleGoogleCalendarWebhookSync } from "@/lib/google-calendar"

export const runtime = 'nodejs'
// We don't cache webhooks
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    const channelId = req.headers.get("x-goog-channel-id")
    const resourceId = req.headers.get("x-goog-resource-id")
    const resourceState = req.headers.get("x-goog-resource-state") // e.g., 'sync', 'exists'

    // Google requires a quick 200 OK response
    if (!channelId || !resourceId) {
        return new NextResponse("Missing required headers", { status: 400 })
    }

    // When the watch channel is first created, Google sends a 'sync' message
    if (resourceState === "sync") {
        console.log(`[Google Sync] Channel ${channelId} successfully connected.`)
        return new NextResponse("Sync successful", { status: 200 })
    }

    // For any actual changes ('exists'), trigger the sync handler
    console.log(`[Google Sync] Event received for channel ${channelId}. Syncing...`)

    // We execute the sync logic. On Vercel standard, functions run up to 10s-50s
    await handleGoogleCalendarWebhookSync(channelId, resourceId).catch(error => {
        console.error("[Google Sync] Webhook handling error:", error)
    })

    return new NextResponse("OK", { status: 200 })
}
