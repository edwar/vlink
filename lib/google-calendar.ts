import { google } from "googleapis"
import prisma from "./prisma"
import { randomUUID } from "crypto"

async function getGoogleAuthClient(userId: string) {
    const account = await prisma.account.findFirst({
        where: {
            userId,
            providerId: "google",
        },
    })

    if (!account || !account.accessToken) {
        throw new Error("Google account not connected or access token missing")
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
        access_token: account.accessToken,
        refresh_token: account.refreshToken,
        expiry_date: account.accessTokenExpiresAt?.getTime(),
    })

    // Handle token refresh automatically
    oauth2Client.on("tokens", async (tokens) => {
        if (tokens.refresh_token) {
            await prisma.account.update({
                where: { id: account.id },
                data: {
                    refreshToken: tokens.refresh_token,
                },
            })
        }
        if (tokens.access_token) {
            await prisma.account.update({
                where: { id: account.id },
                data: {
                    accessToken: tokens.access_token,
                    accessTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                },
            })
        }
    })

    return oauth2Client
}

export async function createGoogleCalendarEvent(appointmentId: string) {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                profile: {
                    include: {
                        user: true
                    }
                },
                service: true
            }
        })

        if (!appointment) throw new Error("Appointment not found")
        if (!appointment.profile.userId) throw new Error("Profile has no associated user")

        const auth = await getGoogleAuthClient(appointment.profile.userId)
        const calendar = google.calendar({ version: "v3", auth })

        const event = {
            summary: `${appointment.service?.name || 'Cita'} - ${appointment.clientName}`,
            description: `Cita agendada vía VLink.\nCliente: ${appointment.clientName}\nWhatsApp: ${appointment.clientPhone}\nEmail: ${appointment.clientEmail || 'No proporcionado'}`,
            start: {
                dateTime: appointment.startTime.toISOString(),
                timeZone: "UTC", // Or user's timezone if stored
            },
            end: {
                dateTime: appointment.endTime.toISOString(),
                timeZone: "UTC",
            },
            attendees: appointment.clientEmail ? [{ email: appointment.clientEmail }] : [],
            reminders: {
                useDefault: true,
            },
        }

        const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: event,
            sendUpdates: "all", // This sends the invite to the client
        })

        // Store the event ID for future reference (updates/cancellations)
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                googleEventId: response.data.id
            }
        })

        return response.data
    } catch (error) {
        console.error("Error creating Google Calendar event:", error)
        // We don't throw here to avoid failing the whole booking process
        // but it would be good to log this for the professional
        return null
    }
}

export async function updateGoogleCalendarEvent(appointmentId: string) {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                profile: { include: { user: true } },
                service: true
            }
        })

        if (!appointment || !appointment.googleEventId || !appointment.profile.userId) {
            return null // Not synced — nothing to update
        }

        const auth = await getGoogleAuthClient(appointment.profile.userId)
        const calendar = google.calendar({ version: "v3", auth })

        await calendar.events.patch({
            calendarId: "primary",
            eventId: appointment.googleEventId,
            sendUpdates: "all", // Notify attendees of the change
            requestBody: {
                start: {
                    dateTime: appointment.startTime.toISOString(),
                    timeZone: "UTC",
                },
                end: {
                    dateTime: appointment.endTime.toISOString(),
                    timeZone: "UTC",
                },
            },
        })

        return true
    } catch (error) {
        console.error("Error updating Google Calendar event:", error)
        return false
    }
}

export async function deleteGoogleCalendarEvent(appointmentId: string) {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                profile: true
            }
        })

        if (!appointment || !appointment.googleEventId || !appointment.profile.userId) {
            return null // Not found or never synced
        }

        const auth = await getGoogleAuthClient(appointment.profile.userId)
        const calendar = google.calendar({ version: "v3", auth })

        await calendar.events.delete({
            calendarId: "primary",
            eventId: appointment.googleEventId,
            sendUpdates: "all", // Notify attendees of cancellation
        })

        return true
    } catch (error) {
        console.error("Error deleting Google Calendar event:", error)
        return false
    }
}

/**
 * Subscribes to Google Calendar push notifications (webhooks) for a given profile
 */
export async function subscribeToGoogleCalendar(profileId: string) {
    try {
        const profile = await prisma.profile.findUnique({
            where: { id: profileId },
            include: { user: true }
        })

        if (!profile || !profile.userId) return false

        const auth = await getGoogleAuthClient(profile.userId)
        const calendar = google.calendar({ version: "v3", auth })

        // 1. Fetch initial syncToken
        const eventsResponse = await calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
        })

        const nextSyncToken = eventsResponse.data.nextSyncToken

        // 2. Setup Watch Channel
        const channelId = randomUUID()
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vlink.com"

        // Google Webhooks REQUIRE a verified HTTPS domain. Bypass for local dev.
        if (appUrl.includes("localhost") || !appUrl.startsWith("https://")) {
            console.warn("⚠️ Bypass de Webhook para entorno local: Google Calendar requiere dominios HTTPS válidos y verificados. Simulando suscripción de webhook para pruebas locales.")

            await prisma.profile.update({
                where: { id: profileId },
                data: {
                    syncToken: nextSyncToken || null,
                    webhookChannelId: channelId,
                    webhookResourceId: "dev-resource-id-" + Math.random().toString(36).substring(7),
                    webhookExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            })
            return true
        }

        const watchResponse = await calendar.events.watch({
            calendarId: "primary",
            requestBody: {
                id: channelId,
                type: "web_hook",
                address: `${appUrl}/api/webhooks/google-calendar`,
            }
        })

        // 3. Save to database
        await prisma.profile.update({
            where: { id: profileId },
            data: {
                syncToken: nextSyncToken || null,
                webhookChannelId: watchResponse.data.id || channelId,
                webhookResourceId: watchResponse.data.resourceId,
                webhookExpiresAt: watchResponse.data.expiration
                    ? new Date(parseInt(watchResponse.data.expiration))
                    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
            }
        })

        return true
    } catch (error) {
        console.error("Error subscribing to Google Calendar:", error)
        return false
    }
}

/**
 * Reacts to incoming webhooks by requesting incremental changes (syncToken) and syncing our DB
 */
export async function handleGoogleCalendarWebhookSync(channelId: string, resourceId: string) {
    try {
        const profile = await prisma.profile.findUnique({
            where: { webhookChannelId: channelId, webhookResourceId: resourceId },
            include: { user: true }
        })

        if (!profile || !profile.userId) return

        const auth = await getGoogleAuthClient(profile.userId)
        const calendar = google.calendar({ version: "v3", auth })

        // Fetch changes using syncToken
        const options: any = {
            calendarId: "primary",
        }

        if (profile.syncToken) {
            options.syncToken = profile.syncToken
        } else {
            // Fallback if no syncToken
            options.timeMin = new Date().toISOString()
        }

        const response = await calendar.events.list(options)
        const events = response.data.items || []

        // Update syncToken for next time
        if (response.data.nextSyncToken) {
            await prisma.profile.update({
                where: { id: profile.id },
                data: { syncToken: response.data.nextSyncToken }
            })
        }

        // Process changed events
        for (const event of events) {
            // We only care about events that exist in our DB (modifications/cancellations)
            if (!event.id) continue

            const appointment = await prisma.appointment.findFirst({
                where: { googleEventId: event.id, profileId: profile.id }
            })

            if (!appointment) continue

            // If event was deleted in Google Calendar
            if (event.status === "cancelled" && appointment.status !== "CANCELLED") {
                await prisma.appointment.update({
                    where: { id: appointment.id },
                    data: { status: "CANCELLED" }
                })
                continue
            }

            // If event timing was changed in Google Calendar
            if (event.start?.dateTime && event.end?.dateTime) {
                const newStart = new Date(event.start.dateTime)
                const newEnd = new Date(event.end.dateTime)

                if (newStart.getTime() !== appointment.startTime.getTime() ||
                    newEnd.getTime() !== appointment.endTime.getTime()) {

                    await prisma.appointment.update({
                        where: { id: appointment.id },
                        data: {
                            startTime: newStart,
                            endTime: newEnd,
                            // Could reset reminders here too if we wanted
                        }
                    })
                }
            }
        }
    } catch (error) {
        // If syncToken is invalid (e.g. 410 Gone), we should clear it to do a full resync next time
        if ((error as any)?.code === 410) {
            await prisma.profile.updateMany({
                where: { webhookChannelId: channelId },
                data: { syncToken: null }
            })
        }
        console.error("Error handling Google Calendar sync:", error)
    }
}
