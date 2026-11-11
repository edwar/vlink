import PusherClient from "pusher-js"

/**
 * Configure Pusher for client-side event listening.
 * Los canales `private-` se autorizan contra /api/pusher/auth (cookie de sesión).
 */
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    channelAuthorization: {
      endpoint: "/api/pusher/auth",
      transport: "ajax",
    },
  }
)
