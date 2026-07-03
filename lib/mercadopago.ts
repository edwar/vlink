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
    BASIC: {
        title: "Plan Básico",
        price: 25000,
        reason: "Suscripción VLink Básico",
    },
    TEAM: {
        title: "Plan Equipos (Hasta 5 miembros)",
        price: 50000,
        reason: "Suscripción VLink Equipos",
    },
    CORPORATE: {
        title: "Plan Corporativo (Ilimitado)",
        price: 100000,
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
export async function generateSubscriptionLink(planType: "BASIC" | "TEAM" | "CORPORATE", organizationId: string, userEmail: string, planPrice?: number) {
    const preApproval = new PreApproval(client);
    const targetPlan = VLINK_PLANS[planType];
    const rawUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "")
    const backUrlBase = rawUrl.startsWith("https://") ? rawUrl : "https://vlink.cognilab.dev"
    const backUrl = `${backUrlBase}/dashboard/organizacion/planes`
    const transactionAmount = planPrice ?? targetPlan.price

    try {
        const response = await preApproval.create({
            body: {
                reason: targetPlan.reason,
                auto_recurring: {
                    frequency: 1,
                    frequency_type: "months",
                    transaction_amount: transactionAmount,
                    currency_id: "COP"
                },
                back_url: backUrl,
                payer_email: userEmail,
                external_reference: organizationId,
                status: "pending"
            }
        });

        return response.init_point;
    } catch (error: any) {
        console.error("Error generando suscripción a MP", JSON.stringify(error, null, 2));
        console.error("back_url enviado:", backUrl);
        console.error("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
        throw new Error(error.message || "Error contactando a MercadoPago");
    }
}
