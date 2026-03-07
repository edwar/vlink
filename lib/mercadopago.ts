import { MercadoPagoConfig, PreApprovalPlan, PreApproval } from 'mercadopago';

// Configurar con el Access Token extraído de las variables de entorno
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    options: { timeout: 5000 }
});

export const mpClient = client;

// Planes base de VLink (los precios deben configurarse desde tu panel de Mercado Pago
// pero la API permite consultarlos o crearlos dinámicamente)
export const VLINK_PLANS = {
    TEAM: {
        title: "Plan Equipos (Hasta 5 miembros)",
        price: 49000, // COP
        reason: "Suscripción VLink Equipos",
    },
    CORPORATE: {
        title: "Plan Corporativo (Ilimitado)",
        price: 99000, // COP
        reason: "Suscripción VLink Corporativo",
    }
}

/**
 * Crea o obtiene un plan de suscripción en Mercado Pago
 */
export async function getOrCreatePlan(planType: "TEAM" | "CORPORATE") {
    // Nota: en un entorno real, preferirías crear estos planes a través del Dashboard de MP 
    // y almacenar los "preapproval_plan_id" en .env
    // Por motivos demostrativos crearemos la intención de suscripción on the fly.

    const targetPlan = VLINK_PLANS[planType];
    const preApprovalPlan = new PreApprovalPlan(client);

    try {
        const response = await preApprovalPlan.create({
            body: {
                reason: targetPlan.reason,
                auto_recurring: {
                    frequency: 1,
                    frequency_type: "months",
                    transaction_amount: targetPlan.price,
                    currency_id: "COP"
                },
                back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/organizacion/planes?success=true`,
            }
        });

        return response.id;
    } catch (error) {
        console.error("Error creando plan en Mercado Pago", error);
        return null;
    }
}

/**
 * Genera el Link de suscripción (Init Point) para el Frontend
 */
export async function generateSubscriptionLink(planType: "TEAM" | "CORPORATE", organizationId: string, userEmail: string) {
    const preApproval = new PreApproval(client);
    const targetPlan = VLINK_PLANS[planType];

    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

        const response = await preApproval.create({
            body: {
                reason: targetPlan.reason,
                auto_recurring: {
                    frequency: 1,
                    frequency_type: "months",
                    transaction_amount: targetPlan.price,
                    currency_id: "COP"
                },
                // MP Subscriptions can be picky with query params in back_url. 
                // We'll rely on our DB status and webhooks for the final truth.
                back_url: `${appUrl}/dashboard/organizacion/planes`,
                payer_email: userEmail,
                external_reference: organizationId // Vínculamos esta suscripción con la organización
            }
        });

        return response.init_point;
    } catch (error: any) {
        console.error("Error generando suscripción a MP", JSON.stringify(error, null, 2));
        throw new Error(error.message || "Error contactando a MercadoPago");
    }
}
