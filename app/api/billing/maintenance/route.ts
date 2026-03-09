import { NextRequest } from 'next/server'
import { processGracePeriods } from '@/app/actions/billing-maintenance'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Endpoint para mantenimiento de facturación (Cron Job)
 * Verifica periodos de gracia y degrada planes si es necesario.
 */
export async function GET(request: NextRequest) {
    // Verificar CRON_SECRET para evitar llamadas no autorizadas
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Billing Cron] Iniciando mantenimiento de facturación...')

    const result = await processGracePeriods();

    if (result.success) {
        console.log(`[Billing Cron] Mantenimiento completado. Organizaciones degradadas: ${result.degradedCount}`)
        return Response.json({ ok: true, ...result })
    } else {
        console.error('[Billing Cron] Fallo en el mantenimiento:', result.error)
        return Response.json({ ok: false, error: result.error }, { status: 500 })
    }
}
