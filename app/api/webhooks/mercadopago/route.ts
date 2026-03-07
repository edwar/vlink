import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

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

        // Validación de firma (Security) si MP te la proporciona en headers `x-signature`
        // Esto previene que alguien invente peticiones a tu servidor.

        switch (topic) {
            case "subscription":
            case "preapproval":
                // Aquí, VLink con ID = "id", llamaría a la API de MP `client.preapproval.get({ id })`
                // Para validar el estado de la suscripción y el "external_reference" (nuestro OrgID)

                // Si la suscripción fue pagada con éxito (status = "authorized"),
                // Y extraemos el orgId del payload:

                // await prisma.organization.update({ 
                //    where: { id: orgId },
                //    data: { subscriptionPlan: planEscogido, mpSubscriptionId: id }
                // })
                console.log(`[Mercado Pago Webhook] Suscripción actualizada o creada: ${id}`);
                break;
            case "payment":
                console.log(`[Mercado Pago Webhook] Pago registrado con ID: ${id}`);
                break;
            default:
                console.log(`[Mercado Pago] Webhook descartado por tópico irrelevante: ${topic}`)
        }

        return new NextResponse("OK", { status: 200 })
    } catch (error) {
        console.error("Error processando webhook de Mercado Pago", error)
        return new NextResponse("Webhook error", { status: 500 })
    }
}
