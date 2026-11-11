/**
 * Nombres de canales de Pusher compartidos entre servidor y cliente.
 * Los canales `private-` exigen autorización en /api/pusher/auth.
 */
export const PROFILE_CHANNEL_PREFIX = "private-profile-"

export function profileChannel(profileId: string) {
    return `${PROFILE_CHANNEL_PREFIX}${profileId}`
}
