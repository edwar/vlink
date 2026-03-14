"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { generateSubscriptionLink } from "@/lib/mercadopago"
import { revalidatePath } from "next/cache"

export async function createCheckoutSession(organizationId: string, planType: "TEAM" | "CORPORATE") {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            throw new Error("No autenticado")
        }

        // Validate that user is owner/manager of organization
        const membership = await prisma.member.findFirst({
            where: {
                organizationId,
                userId: session.user.id,
                role: { in: ["OWNER"] }
            }
        });

        if (!membership) throw new Error("Acceso denegado: Necesitas ser Administrador o Propietario para gestionar pagos.")

        const org = await prisma.organization.findUnique({
            where: { id: organizationId }
        });

        if (!org) throw new Error("Organización no encontrada");

        // Use Mercadopago to generate checkout URL for subscriptions
        const initPoint = await generateSubscriptionLink(planType, organizationId, session.user.email);

        if (!initPoint) {
            throw new Error("No se pudo iniciar el flujo de pago con Mercado Pago")
        }

        return { success: true, url: initPoint }
    } catch (error: any) {
        console.error("Billing action error:", error)
        return { success: false, error: error.message || "Error configurando el checkout" }
    }
}

/**
 * Solo por propósitos de prueba de UI, para poder cambiar de plan sin tarjeta
 */
export async function testSetPlan(organizationId: string, plan: "BASIC" | "TEAM" | "CORPORATE") {
    await prisma.organization.update({
        where: { id: organizationId },
        data: { subscriptionPlan: plan }
    })
    revalidatePath("/dashboard/organizacion")
    revalidatePath("/dashboard/organizacion/planes")
    return { success: true }
}

/**
 * Returns the payment/trial status for the user's primary organization.
 * Used to show upgrade banners and gate premium features.
 */
export async function getOrgPaymentStatus() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) return null

    const membership = await prisma.member.findFirst({
        where: { userId: session.user.id },
        include: { organization: true },
        orderBy: { createdAt: "asc" }
    })

    if (!membership) return null

    const org = membership.organization
    const hasPaymentMethod = !!org.mpCustomerId
    const plan = org.subscriptionPlan

    let daysRemaining: number | null = null
    if (org.gracePeriodEnd) {
        const now = new Date()
        const diff = org.gracePeriodEnd.getTime() - now.getTime()
        daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    const trialExpired = daysRemaining !== null && daysRemaining <= 0

    return {
        hasPaymentMethod,
        plan,
        planName: plan === "BASIC" ? "Básico" : plan === "TEAM" ? "Equipos" : "Corporativo",
        daysRemaining,
        trialExpired,
        needsPaymentBanner: !hasPaymentMethod && plan !== "BASIC",
        organizationId: org.id,
    }
}

