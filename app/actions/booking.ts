"use server"

import prisma from "@/lib/prisma"
import { format } from "date-fns"
import { sendAppointmentEmail } from "@/lib/resend"
import { es } from "date-fns/locale"
import { randomUUID } from "crypto"

export async function getProfileForBooking(username: string) {
    const profile = await prisma.profile.findUnique({
        where: { username },
        include: {
            user: {
                include: {
                    memberships: {
                        include: {
                            organization: true
                        }
                    }
                }
            },
            services: {
                where: { isActive: true },
                orderBy: { createdAt: 'asc' }
            }
        }
    })

    if (!profile) return null

    // Soft-Lock Check: Priority: OWNER > MANAGER > PROFESSIONAL, then by createdAt
    const membership = profile.user.memberships[0];
    if (membership && membership.organization) {
        const org = membership.organization;
        const planConfig = await prisma.planConfig.findUnique({
            where: { id: org.subscriptionPlan }
        });

        const maxSeats = planConfig?.maxSeats ?? 0;
        if (maxSeats > 0) {
            const allOrgMembers = await prisma.member.findMany({
                where: { organizationId: org.id },
                orderBy: { createdAt: 'asc' }
            });

            // Definir prioridad: OWNER (0) > MANAGER (1) > PROFESSIONAL (2)
            const rolePriority: Record<string, number> = {
                OWNER: 0,
                MANAGER: 1,
                PROFESSIONAL: 2
            };

            const sortedMembers = allOrgMembers.sort((a, b) => {
                const priorityA = rolePriority[a.role] ?? 10;
                const priorityB = rolePriority[b.role] ?? 10;
                if (priorityA !== priorityB) return priorityA - priorityB;
                return a.createdAt.getTime() - b.createdAt.getTime();
            });

            const myIndex = sortedMembers.findIndex(m => m.userId === profile.userId);
            if (myIndex >= maxSeats) {
                console.log(`[Soft-Lock] Perfil ${username} bloqueado por límite de asientos del plan ${org.subscriptionPlan}`);
                return null;
            }
        }
    }

    return {
        displayName: profile.displayName || profile.user.name || username,
        bio: profile.bio || "",
        username: profile.username,
        image: profile.user.image,
        advanceNoticeHours: profile.advanceNoticeHours,
        expertise: profile.expertise || [],
        services: profile.services.map((s) => ({
            id: s.id,
            name: s.name,
            durationMinutes: s.durationMinutes,
            price: s.price
        }))
    }
}

export async function getAvailableSlots(username: string, date: Date, durationMinutes: number = 30) {
    const profile = await prisma.profile.findUnique({
        where: { username },
        include: { availabilities: true }
    });

    if (!profile) throw new Error("Perfil no encontrado")

    const dayOfWeek = date.getDay()

    // 1. Obtener disponibilidad recurrente para este día de la semana
    const recurring = profile.availabilities.find(a => a.dayOfWeek === dayOfWeek && !a.isBlocked)

    if (!recurring) return []

    // Timezone safe boundaries (Colombia -05:00)
    const isoDate = date.toISOString().split("T")[0];
    const dayStart = new Date(`${isoDate}T00:00:00-05:00`);
    const dayEnd = new Date(`${isoDate}T23:59:59-05:00`);

    // 2. Obtener bloqueos específicos para esta fecha
    const blocks = profile.availabilities.filter(a => {
        if (!a.isBlocked || !a.specificDate) return false;
        return a.specificDate.toISOString().split("T")[0] === isoDate;
    })

    // 3. Obtener citas existentes para esta fecha
    const appointments = await prisma.appointment.findMany({
        where: {
            profileId: profile.id,
            startTime: { gte: dayStart },
            endTime: { lte: dayEnd },
            status: { not: "CANCELLED" }
        }
    })

    // 4. Generar slots basados en las horas recurrentes
    const slots: string[] = []

    const [startHour, startMin] = recurring.startTime.split(":").map(Number)
    const [endHour, endMin] = recurring.endTime.split(":").map(Number)

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + durationMinutes <= endMinutes) {
        const slotEndMinutes = currentMinutes + durationMinutes;

        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        const eh = Math.floor(slotEndMinutes / 60);
        const em = slotEndMinutes % 60;
        const slotEndStr = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

        const slotStartDateTime = new Date(`${isoDate}T${timeStr}:00-05:00`)
        const now = new Date()
        const requiredAdvanceNoticeMs = (profile.advanceNoticeHours ?? 24) * 60 * 60 * 1000
        const isTooSoon = (slotStartDateTime.getTime() - now.getTime()) < requiredAdvanceNoticeMs

        // Verificar si el slot está bloqueado por un bloqueo específico
        const isBlocked = blocks.some(b => timeStr < b.endTime && slotEndStr > b.startTime)

        // Verificar si el slot solapa con una cita existente
        const isOccupied = appointments.some(appt => {
            const apptStartMins = (appt.startTime.getTime() - dayStart.getTime()) / 60000;
            const apptEndMins = (appt.endTime.getTime() - dayStart.getTime()) / 60000;
            return currentMinutes < apptEndMins && slotEndMinutes > apptStartMins;
        })

        if (!isBlocked && !isOccupied && !isTooSoon) {
            slots.push(timeStr)
        }

        currentMinutes += durationMinutes;
    }

    return slots
}

export async function createAppointment(data: {
    username: string,
    date: Date,
    time: string,
    clientName: string,
    clientPhone: string,
    clientEmail: string,
    serviceId?: string
}) {
    const profile = await prisma.profile.findUnique({ where: { username: data.username } })
    if (!profile) throw new Error("Perfil no encontrado")

    // Get duration and service info if provided
    let durationMinutes = 30
    let serviceName = undefined
    let servicePrice = undefined

    if (data.serviceId) {
        const service = await prisma.service.findUnique({ where: { id: data.serviceId } })
        if (service) {
            durationMinutes = service.durationMinutes
            serviceName = service.name
            servicePrice = service.price
        }
    }

    const isoDate = data.date.toISOString().split("T")[0]; // "2026-02-28"
    const startTime = new Date(`${isoDate}T${data.time.padStart(5, '0')}:00-05:00`);

    // Explicit end time using math
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const cancelToken = randomUUID()

    // Atomic transaction with advisory lock to prevent race condition double-bookings
    // The advisory lock serializes all booking attempts for the same profile
    const appointment = await prisma.$transaction(async (tx) => {
        // Acquire an advisory lock scoped to this profile (using a hash of the profileId)
        // This blocks concurrent booking attempts for the same professional
        const lockKey = Math.abs(hashCode(profile.id))
        await tx.$queryRawUnsafe(`SELECT pg_advisory_xact_lock(${lockKey})`)

        // Now safely check for collisions — no other transaction can insert while we hold the lock
        const collision = await tx.appointment.findFirst({
            where: {
                profileId: profile.id,
                status: { not: "CANCELLED" },
                startTime: { lt: endTime },
                endTime: { gt: startTime }
            }
        })

        if (collision) throw new Error("Slot ya ocupado")

        return tx.appointment.create({
            data: {
                profileId: profile.id,
                serviceId: data.serviceId || null,
                clientName: data.clientName,
                clientPhone: data.clientPhone,
                clientEmail: data.clientEmail,
                startTime,
                endTime,
                status: "CONFIRMED",
                cancelToken,
            }
        })
    }, {
        isolationLevel: 'Serializable',
        timeout: 10000 // 10s max wait for the lock
    })

    // Get professional name for email
    const user = await prisma.user.findUnique({ where: { id: profile.userId } })

    const cancelLink = `${process.env.NEXT_PUBLIC_APP_URL}/cancelar/${cancelToken}`

    // Send confirmation email
    await sendAppointmentEmail({
        to: data.clientEmail,
        type: "CONFIRMATION",
        clientName: data.clientName,
        professionalName: user?.name || data.username,
        serviceName,
        price: servicePrice,
        date: format(startTime, "EEEE, d 'de' MMMM", { locale: es }),
        time: data.time,
        cancelLink,
    })

    // Sync with Google Calendar (Awaiting execution to prevent serverless suspension/timeouts on Prisma)
    const { createGoogleCalendarEvent } = await import("@/lib/google-calendar")
    await createGoogleCalendarEvent(appointment.id).catch(console.error)

    return appointment
}

/**
 * Simple string hash to generate a stable numeric key for advisory locks
 */
function hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash |= 0 // Convert to 32-bit integer
    }
    return hash
}

