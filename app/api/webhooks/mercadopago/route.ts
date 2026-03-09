import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { PreApproval } from 'mercadopago'
import { mpClient } from "@/lib/mercadopago"
import { sendSubscriptionEmail } from "@/lib/resend"

/**
 * Recibe eventos de Webhook desde Mercado Pago (Subscripciones y Pagos)
 */
export async function POST(req: Request) {
    try {
        const url = new URL(req.url)
        const topic = url.searchParams.get("topic")
        const id = url.searchParams.get("id")

        if (!topic || !id) {
            return new NextResponse("Bad request", { status: 400 })
        }

        const preApproval = new PreApproval(mpClient);

        switch (topic) {
            case "subscription":
            case "preapproval":
                // Obtener detalles de la suscripción de MP
                const subscription = await preApproval.get({ id });
                const orgId = subscription.external_reference;

                if (!orgId) {
                    console.error("[Mercado Pago Webhook] Sin external_reference (orgId)");
                    break;
                }

                const org = await prisma.organization.findUnique({
                    where: { id: orgId },
                    include: {
                        members: {
                            where: { role: "OWNER" },
                            include: { user: true }
                        }
                    }
                });

                if (!org) break;

                const status = subscription.status; // "authorized", "paused", "cancelled", etc.

                if (status === "authorized") {
                    // Pago exitoso o suscripción activa
                    const reason = subscription.reason || "";
                    await prisma.organization.update({
                        where: { id: orgId },
                        data: {
                            subscriptionPlan: reason.includes("Corporativo") ? "CORPORATE" : "TEAM",
                            mpSubscriptionId: id,
                            billingStatus: "ACTIVE",
                            lastPaymentDate: new Date(),
                            gracePeriodEnd: null
                        }
                    });
                    console.log(`[Mercado Pago Webhook] Suscripción ACTIVA para: ${org.name}`);
                } else if (status === "cancelled" || status === "rejected") {
                    // Pago fallido o suscripción cancelada
                    // Iniciamos periodo de gracia de 7 días
                    const graceEnd = new Date();
                    graceEnd.setDate(graceEnd.getDate() + 7);

                    await prisma.organization.update({
                        where: { id: orgId },
                        data: {
                            billingStatus: "OVERDUE",
                            gracePeriodEnd: graceEnd
                        }
                    });

                    // Notificar al dueño
                    const owner = org.members[0]?.user;
                    if (owner?.email) {
                        await sendSubscriptionEmail({
                            to: owner.email,
                            organizationName: org.name,
                            type: "GRACE_PERIOD",
                            planName: org.subscriptionPlan,
                            gracePeriodEnd: graceEnd.toLocaleDateString('es-CO')
                        });
                    }
                    console.log(`[Mercado Pago Webhook] Suscripción OVERDUE (Gracia) para: ${org.name}`);
                }
                break;

            case "payment":
                console.log(`[Mercado Pago Webhook] Pago registrado con ID: ${id}`);
                break;

            default:
                console.log(`[Mercado Pago] Webhook descartado por tópico irrelevante: ${topic}`)
        }

        return new NextResponse("OK", { status: 200 })
    } catch (error) {
        console.error("Error procesando webhook de Mercado Pago", error)
        return new NextResponse("Webhook error", { status: 500 })
    }
}
