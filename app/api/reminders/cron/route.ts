import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { sendAppointmentEmail } from '@/lib/resend'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    // Verify CRON_SECRET to prevent unauthorized calls
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // 1. 24h Reminders pass
    const window24hStart = new Date(now.getTime() + 22 * 60 * 60 * 1000)
    const window24hEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000)

    const appts24h = await prisma.appointment.findMany({
        where: {
            status: 'CONFIRMED',
            clientEmail: { not: null },
            startTime: { gte: window24hStart, lte: window24hEnd },
            reminder24hSentAt: null,
        } as any,
        include: {
            profile: { include: { user: true } },
            service: true,
        },
    })

    const results = { sent24h: 0, sent2h: 0, errors: 0 }

    for (const appt of appts24h as any[]) {
        try {
            await sendAppointmentEmail({
                to: appt.clientEmail!,
                type: 'REMINDER_24H',
                clientName: appt.clientName,
                professionalName: appt.profile.displayName || appt.profile.user.name,
                serviceName: appt.service?.name,
                price: appt.service?.price,
                date: format(appt.startTime, "EEEE, d 'de' MMMM", { locale: es }),
                time: format(appt.startTime, 'HH:mm'),
            })
            await prisma.appointment.update({
                where: { id: appt.id },
                data: { reminder24hSentAt: now } as any,
            })
            results.sent24h++
        } catch (error) {
            console.error(`[reminders/cron] Error sending 24h reminder for appt ${appt.id}:`, error)
            results.errors++
        }
    }

    // 2. 2h Reminders pass
    const window2hStart = new Date(now.getTime() + 1.5 * 60 * 60 * 1000)
    const window2hEnd = new Date(now.getTime() + 2.5 * 60 * 60 * 1000)

    const appts2h = await prisma.appointment.findMany({
        where: {
            status: 'CONFIRMED',
            clientEmail: { not: null },
            startTime: { gte: window2hStart, lte: window2hEnd },
            reminder2hSentAt: null,
        } as any,
        include: {
            profile: { include: { user: true } },
            service: true,
        },
    })

    for (const appt of appts2h as any[]) {
        try {
            await sendAppointmentEmail({
                to: appt.clientEmail!,
                type: 'REMINDER_2H',
                clientName: appt.clientName,
                professionalName: appt.profile.displayName || appt.profile.user.name,
                serviceName: appt.service?.name,
                price: appt.service?.price,
                date: 'Hoy',
                time: format(appt.startTime, 'HH:mm'),
            })
            await prisma.appointment.update({
                where: { id: appt.id },
                data: { reminder2hSentAt: now } as any,
            })
            results.sent2h++
        } catch (error) {
            console.error(`[reminders/cron] Error sending 2h reminder for appt ${appt.id}:`, error)
            results.errors++
        }
    }

    console.log('[reminders/cron] Run complete:', results)
    return Response.json({ ok: true, ...results })
}
