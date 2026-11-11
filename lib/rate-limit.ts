import { headers } from "next/headers"
import prisma from "@/lib/prisma"

export class RateLimitError extends Error {
    constructor(message = "Demasiadas solicitudes. Intenta de nuevo en unos minutos.") {
        super(message)
        this.name = "RateLimitError"
    }
}

type Limit = {
    /** Identificador lógico del límite, p. ej. "booking:ip" */
    name: string
    /** Valor a limitar (IP, email, etc.) */
    id: string
    max: number
    windowSeconds: number
}

/**
 * Incrementa atómicamente un contador de ventana fija en Postgres y devuelve
 * true si la solicitud está dentro del límite. Funciona entre instancias
 * serverless porque el estado vive en la base de datos.
 */
export async function hitRateLimit({ name, id, max, windowSeconds }: Limit): Promise<boolean> {
    const key = `${name}:${id.toLowerCase().slice(0, 200)}`

    const rows = await prisma.$queryRaw<{ count: number }[]>`
        INSERT INTO "rate_limit" ("key", "count", "windowStart")
        VALUES (${key}, 1, NOW())
        ON CONFLICT ("key") DO UPDATE SET
            "count" = CASE
                WHEN "rate_limit"."windowStart" < NOW() - make_interval(secs => ${windowSeconds}::int)
                THEN 1 ELSE "rate_limit"."count" + 1 END,
            "windowStart" = CASE
                WHEN "rate_limit"."windowStart" < NOW() - make_interval(secs => ${windowSeconds}::int)
                THEN NOW() ELSE "rate_limit"."windowStart" END
        RETURNING "count"
    `

    return (rows[0]?.count ?? 0) <= max
}

/**
 * Aplica varios límites; lanza RateLimitError si alguno se supera.
 * Si la base de datos falla, se deja pasar la solicitud (fail-open) para no
 * bloquear reservas legítimas por un problema de infraestructura.
 */
export async function enforceRateLimits(limits: Limit[]) {
    for (const limit of limits) {
        let allowed = true
        try {
            allowed = await hitRateLimit(limit)
        } catch (error) {
            console.error(`[rate-limit] Error evaluando ${limit.name}:`, error)
        }
        if (!allowed) throw new RateLimitError()
    }
}

/**
 * IP del cliente. En Vercel, `x-forwarded-for` lo fija la plataforma y su
 * primer valor es la IP real; `x-real-ip` como respaldo.
 */
export async function getClientIp(): Promise<string> {
    const h = await headers()
    const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim()
    return forwarded || h.get("x-real-ip") || "unknown"
}

/** Borra contadores viejos; se llama desde el cron diario. */
export async function purgeExpiredRateLimits(olderThanSeconds = 2 * 24 * 60 * 60) {
    return prisma.rateLimit.deleteMany({
        where: { windowStart: { lt: new Date(Date.now() - olderThanSeconds * 1000) } }
    })
}
