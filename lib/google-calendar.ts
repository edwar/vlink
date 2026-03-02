import { google } from "googleapis"
import prisma from "./prisma"

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
