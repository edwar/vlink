"use server"

import prisma from "@/lib/prisma"
import { format } from "date-fns"
import { sendAppointmentEmail, sendPaymentEmail } from "@/lib/resend"
import { es } from "date-fns/locale"
import { randomUUID } from "crypto"
import { getBogotaDay, getBogotaISO } from "@/lib/utils"
import { createWompiTransaction } from "@/lib/wompi"
import { pusherServer } from "@/lib/pusher"
import { isHolidayColombia } from "@/lib/holidays"

export async function getProfileForBooking(username: string) {
    const profile = await prisma.profile.findUnique({
        where: { username },
        include: {
            user: {
                include: {
                    memberships: {
                        include: {
                            organization: true,
                            locationServices: {
                                where: { isActive: true }
                            }
                        }
                    }
                }
            },
            services: {
                where: { isActive: true },
                orderBy: { createdAt: 'asc' }
            }
        }
    }) as any

    if (!profile) return null

    // 1. Billing Enforcement: Lock if payment is missing or overdue
    let isLocked = false;
    const membership = profile.user.memberships[0];

    if (membership && membership.organization) {
        const org = membership.organization;
        const now = new Date();

        const planConfig = org.subscriptionPlan ? await prisma.planConfig.findUnique({
            where: { id: org.subscriptionPlan }
        }) : null;

        // Check for Billing Hard-Lock
        const isDegraded = org.billingStatus === "DEGRADED";
        const isOverdueGraceEnded = org.billingStatus === "OVERDUE" && org.gracePeriodEnd && org.gracePeriodEnd < now;

        // Treat as expired trial if: ACTIVE + Trial Date Passed + No active Mercado Pago subscription
        // and its either not a free plan or we want to enforce card for all.
        // Assuming planConfig.price starts with '$0' for free plans.
        const trialExpired = org.billingStatus === "ACTIVE" &&
            org.gracePeriodEnd &&
            org.gracePeriodEnd < now &&
            !org.mpSubscriptionId &&
            (planConfig?.price !== "$0");

        if (isDegraded || isOverdueGraceEnded || trialExpired || !org.subscriptionPlan) {
            console.log(`[Hard-Lock] Agenda bloqueada para ${username}. Status: ${org.billingStatus}, Plan: ${org.subscriptionPlan}`);
            isLocked = true;
        }

        // 2. Soft-Lock Check (Seat limits) - only if not already hard-locked
        if (!isLocked && planConfig) {
            const maxSeats = planConfig.maxSeats ?? 0;
            if (maxSeats > 0) {
                const allOrgMembers = await prisma.member.findMany({
                    where: { organizationId: org.id },
                    orderBy: { createdAt: 'asc' }
                });

                // Priority: OWNER (0) > MANAGER (1) > PROFESSIONAL (2)
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
                    isLocked = true;
                }
            }
        }
    } else {
        // Individual user without organization - check if individual booking is allowed or needs a plan
        // For now, let's assume they need an organization to be active in this specific workflow
        // or just let it pass if that's the business rule.
        // Based on user request "si no tiene un plan", let's assume if no org/plan, it's locked.
        // isLocked = true; 
    }

    return {
        id: profile.id,
        displayName: profile.displayName || profile.user.name || username,
        bio: profile.bio || "",
        username: profile.username,
        image: profile.user.image,
        advanceNoticeHours: profile.advanceNoticeHours,
        expertise: profile.expertise || [],
        isLocked,
        organizationId: profile.organizationId || "",
        organizationSlug: membership?.organization?.slug || "",
        services: profile.services.map((s: any) => ({
            id: s.id,
            name: s.name,
            durationMinutes: s.durationMinutes,
            price: s.price
        })),
        locationServices: membership?.locationServices?.map((ls: any) => ({
            locationId: ls.locationId,
            serviceId: ls.serviceId
        })) || []
    }
}

/**
 * Gets active locations for an organization by slug.
 */
export async function getLocationsByOrgSlug(slug: string) {
    const org = await prisma.organization.findUnique({
        where: { slug },
        include: { locations: { where: { isActive: true } } } as any
    }) as any
    return org?.locations || []
}

/**
 * Gets active locations for an organization by ID.
 */
export async function getLocationsByOrgId(organizationId: string) {
    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: { locations: { where: { isActive: true } } } as any
    }) as any
    return org?.locations || []
}

/**
 * Gets professionals available at a specific location, optionally filtered by date and service.
 */
export async function getProfessionalsByLocation(locationId: string, date?: Date, serviceId?: string) {
    const whereClause: any = {
        organization: {
            locations: { some: { id: locationId } }
        },
        showOnOrgPage: true
    }

    // If serviceId is provided, only show professionals who offer that service at that location
    if (serviceId) {
        whereClause.member = {
            locationServices: {
                some: {
                    locationId,
                    serviceId,
                    isActive: true
                }
            }
        }
    }

    const profiles = await prisma.profile.findMany({
        where: whereClause,
        include: {
            user: true,
            services: true,
            availabilities: {
                where: { locationId, specificDate: null } as any
            }
        }
    })

    return profiles.map((p: any) => ({
        id: p.id,
        username: p.username,
        displayName: p.displayName || p.user.name || p.username,
        image: p.user.image,
        expertise: p.expertise
    }))
}

export async function getAvailableSlots(username: string, date: Date, durationMinutes: number = 30, locationId?: string) {
    const profile = await prisma.profile.findUnique({
        where: { username },
        include: {
            availabilities: true,
            organization: {
                select: { id: true, workOnHolidays: true, slotGenerationMethod: true }
            }
        }
    });

    if (!profile) throw new Error("Perfil no encontrado")

    // Check for Holidays if organization doesn't work on them
    if (profile.organization && !profile.organization.workOnHolidays) {
        const { isHoliday } = isHolidayColombia(date);
        if (isHoliday) {
            return []; // No hay disponibilidad en festivos
        }
    }

    const dayOfWeek = getBogotaDay(date)
    // 1. Obtener disponibilidad recurrente para este día de la semana
    // Si locationId está presente, solo buscar disponibilidad en esa sede
    const recurringPeriods = profile.availabilities.filter((a: any) =>
        a.dayOfWeek === dayOfWeek &&
        !a.isBlocked &&
        !a.specificDate &&
        (!locationId || !a.locationId || a.locationId === locationId)
    ) as any[]

    if (recurringPeriods.length === 0) return []

    // Timezone safe boundaries (Colombia -05:00)
    const isoDate = getBogotaISO(date);

    // 2. Obtener bloqueos específicos y recurrentes (isBlocked=true)
    const specialBlocks = profile.availabilities.filter((a: any) => {
        if (!a.isBlocked) return false;
        // Bloqueo específico para est fecha
        if (a.specificDate && getBogotaISO(a.specificDate) === isoDate) return true;
        // Bloqueo recurrente para este día y sede
        if (!a.specificDate && a.dayOfWeek === dayOfWeek && (!locationId || !a.locationId || a.locationId === locationId)) return true;

        return false;
    })

    // 3. Obtener horarios especiales (isBlocked=false) si existen
    const specialHours = profile.availabilities.filter((a: any) => {
        if (a.isBlocked || !a.specificDate) return false;
        return getBogotaISO(a.specificDate) === isoDate && (!locationId || !a.locationId || a.locationId === locationId);
    })

    // Si hay horarios especiales para hoy, usamos ESOS en lugar de los recurrentes
    const activePeriods = specialHours.length > 0 ? specialHours : recurringPeriods;

    // 4. Obtener citas existentes para esta fecha
    const dayStart = new Date(`${isoDate}T00:00:00-05:00`);
    const dayEnd = new Date(`${isoDate}T23:59:59-05:00`);
    const appointments = await prisma.appointment.findMany({
        where: {
            profileId: profile.id,
            startTime: { gte: dayStart },
            endTime: { lte: dayEnd },
            status: { not: "CANCELLED" }
        }
    })

    // 5. Generar slots basados en los periodos activos
    const slots: string[] = []
    const now = new Date()
    const requiredAdvanceNoticeMs = (profile.advanceNoticeHours ?? 24) * 60 * 60 * 1000

    for (const period of activePeriods) {
        const [startHour, startMin] = period.startTime.split(":").map(Number)
        const [endHour, endMin] = period.endTime.split(":").map(Number)

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
            const isTooSoon = (slotStartDateTime.getTime() - now.getTime()) < requiredAdvanceNoticeMs

            if (slotStartDateTime > now && !isTooSoon) {
                // Verificar si el slot está bloqueado por un bloqueo específico
                const isBlocked = specialBlocks.some(b => timeStr < b.endTime && slotEndStr > b.startTime)

                if (!isBlocked) {
                    // Verificar si el slot solapa con una cita existente y su buffer time
                    const isOccupied = appointments.some(appt => {
                        const apptStartMins = (appt.startTime.getTime() - dayStart.getTime()) / 60000;
                        const apptEndMins = (appt.endTime.getTime() - dayStart.getTime()) / 60000 + (profile.bufferTime || 0);
                        return currentMinutes < apptEndMins && slotEndMinutes > apptStartMins;
                    })

                    if (!isOccupied) {
                        slots.push(timeStr)
                    }
                }
            }
            // Mover al siguiente slot según el método de la organización
            const method = profile.organization?.slotGenerationMethod || 'SERVICE_DURATION';
            const increment = method === 'FIXED_30_MIN' ? 30 : durationMinutes;
            currentMinutes += increment;
        }
    }

    return [...new Set(slots)].sort();
}

export async function createAppointment(data: {
    username: string,
    date: Date,
    time: string,
    clientName: string,
    clientPhone: string,
    clientEmail: string,
    serviceId?: string,
    locationId?: string
}) {
    const profile = await prisma.profile.findUnique({
        where: { username: data.username },
        include: {
            user: {
                include: {
                    memberships: {
                        include: { organization: true }
                    }
                }
            },
            availabilities: true,
            services: true
        }
    })
    if (!profile) throw new Error("Perfil no encontrado")

    const organization = profile.user.memberships[0]?.organization as any;
    const wompiSubaccountId = organization?.wompiSubaccountId;
    const orgPhone = organization?.phone;
    const orgWhatsapp = organization?.whatsapp;

    // Get duration and service info if provided
    let durationMinutes = 30
    let serviceName = undefined
    let servicePrice = undefined

    // Determine locationId: 
    // 1. If explicitly provided in data
    // 2. If not, try to infer from availability for that day/time
    let finalLocationId = data.locationId;

    if (!finalLocationId) {
        const dayOfWeek = getBogotaDay(data.date);
        const availability = profile.availabilities.find((a: any) =>
            a.dayOfWeek === dayOfWeek &&
            !a.isBlocked &&
            data.time >= a.startTime && data.time < a.endTime
        );
        finalLocationId = (availability as any)?.locationId || null;
    }

    if (data.serviceId) {
        const service = await prisma.service.findUnique({ where: { id: data.serviceId } })
        if (service) {
            durationMinutes = service.durationMinutes
            serviceName = service.name
            servicePrice = service.price
        }
    }

    const isoDate = getBogotaISO(data.date); // "2026-02-28"
    const startTime = new Date(`${isoDate}T${data.time.padStart(5, '0')}:00-05:00`);

    // Explicit end time using math
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const cancelToken = randomUUID()

    const systemConfig = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
    const isPaidService = servicePrice !== undefined && servicePrice !== null && servicePrice > 0;
    const requiresPayment = isPaidService && !!wompiSubaccountId && !!systemConfig?.wompiMarketplaceEnabled;

    const paymentReference = requiresPayment ? randomUUID() : null;

    // Atomic transaction with advisory lock to prevent race condition double-bookings
    // The advisory lock serializes all booking attempts for the same profile
    const appointment = await prisma.$transaction(async (tx) => {
        // Acquire an advisory lock scoped to this profile (using a hash of the profileId)
        // This blocks concurrent booking attempts for the same professional
        const lockKey = Math.abs(hashCode(profile.id))
        await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${lockKey})`)

        // Now safely check for collisions — no other transaction can insert while we hold the lock
        // Verificación con Buffer Time: El intervalo ocupado es [start, end + buffer]
        const collision = await tx.appointment.findFirst({
            where: {
                profileId: profile.id,
                status: { not: "CANCELLED" },
                startTime: { lt: new Date(endTime.getTime() + (profile.bufferTime || 0) * 60000) },
                endTime: { gt: new Date(startTime.getTime() - (profile.bufferTime || 0) * 60000) }
            }
        })

        if (collision) throw new Error("Alguien ya reservó en este horario, por favor intenta con otra fecha u hora.")

        return tx.appointment.create({
            data: {
                profileId: profile.id,
                serviceId: data.serviceId || null,
                clientName: data.clientName,
                clientPhone: data.clientPhone,
                clientEmail: data.clientEmail,
                startTime,
                endTime,
                status: requiresPayment ? "PENDING" : "CONFIRMED",
                cancelToken,
                paymentReference,
                locationId: finalLocationId || null
            } as any
        })
    }, {
        isolationLevel: 'Serializable',
        timeout: 10000 // 10s max wait for the lock
    })

    const cancelLink = `${process.env.NEXT_PUBLIC_APP_URL}/cancelar/${cancelToken}`
    const professionalName = profile.user?.name || data.username

    if (requiresPayment && paymentReference && servicePrice) {
        // Generate Wompi transaction
        try {
            const wompiTx = await createWompiTransaction({
                amountInCents: servicePrice * 100,
                reference: paymentReference,
                customerEmail: data.clientEmail,
                subaccountId: wompiSubaccountId
            });

            await sendPaymentEmail({
                to: data.clientEmail,
                clientName: data.clientName,
                professionalName,
                serviceName,
                price: servicePrice,
                date: format(startTime, "EEEE, d 'de' MMMM", { locale: es }),
                time: data.time,
                qrImage: wompiTx.qrImage,
                paymentUrl: wompiTx.paymentUrl,
                cancelLink,
                phone: orgPhone,
                whatsapp: orgWhatsapp
            });

            return appointment; // Early return, do not create Google Calendar event yet
        } catch (error) {
            console.error("Failed to generate Wompi transaction", error);
            // Optionally, delete the pending appointment if we couldn't generate the QR
            await prisma.appointment.delete({ where: { id: appointment.id } });
            throw new Error("No se pudo generar el cobro para la cita.");
        }
    }

    // Get professional name for email
    const user = profile.user // Ya lo tenemos eagerly loaded

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

    // Trigger Realtime Dashboard Update
    await pusherServer.trigger(`profile-${profile.id}`, "appointments-updated", {
        appointmentId: appointment.id
    }).catch(console.error)

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

/**
 * Gets available slots for a professional at a specific location.
 */
export async function getAvailableSlotsForLocation(profileId: string, locationId: string, date: Date, serviceId?: string) {
    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: { availabilities: true }
    })
    if (!profile) throw new Error("Perfil no encontrado")

    // Get service duration if provided
    let durationMinutes = 30
    if (serviceId) {
        const service = await prisma.service.findUnique({ where: { id: serviceId } })
        if (service) durationMinutes = service.durationMinutes
    }

    return await getAvailableSlots(profile.username, date, durationMinutes, locationId)
}

