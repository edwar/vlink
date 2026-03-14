"use server"

import prisma from "@/lib/prisma"
import { sendSubscriptionEmail } from "@/lib/resend"

/**
 * Procesa las organizaciones en periodo de gracia.
 * Debería ejecutarse diariamente (vía Cron).
 */
export async function processGracePeriods() {
    try {
        const now = new Date();

        // 1. Buscar organizaciones cuyo periodo de gracia ha terminado
        const toDegrade = await prisma.organization.findMany({
            where: {
                billingStatus: "OVERDUE",
                gracePeriodEnd: { lte: now },
                subscriptionPlan: { not: "BASIC" }
            },
            include: {
                members: {
                    where: { role: "OWNER" },
                    include: { user: true }
                }
            }
        });

        console.log(`[Billing Maintenance] Procesando ${toDegrade.length} degradaciones.`);

        for (const org of toDegrade) {
            await prisma.organization.update({
                where: { id: org.id },
                data: {
                    subscriptionPlan: "BASIC",
                    billingStatus: "DEGRADED",
                    gracePeriodEnd: null
                }
            });

            // Notificar al dueño
            const owner = org.members[0]?.user;
            if (owner?.email) {
                await sendSubscriptionEmail({
                    to: owner.email,
                    organizationName: org.name,
                    type: "DEGRADED",
                    planName: org.subscriptionPlan
                });
            }

            console.log(`[Billing Maintenance] Organización ${org.name} degradada a BASIC.`);
        }

        return { success: true, degradedCount: toDegrade.length };
    } catch (error) {
        console.error("[Billing Maintenance Error]", error);
        return { success: false, error: "Error procesando periodos de gracia" };
    }
}
