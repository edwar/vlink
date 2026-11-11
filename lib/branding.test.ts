import { describe, it, expect, vi } from "vitest"

vi.mock("@/lib/prisma", () => ({ default: {} }))

import { isBrandingRemoved, reachedMilestone } from "./branding"

describe("isBrandingRemoved", () => {
    const now = new Date("2026-11-11T12:00:00Z")
    it("es false sin fecha", () => {
        expect(isBrandingRemoved(null, now)).toBe(false)
        expect(isBrandingRemoved(undefined, now)).toBe(false)
    })
    it("es true mientras la fecha no ha vencido", () => {
        expect(isBrandingRemoved(new Date("2026-12-11T00:00:00Z"), now)).toBe(true)
    })
    it("vuelve a mostrar la marca al vencer", () => {
        expect(isBrandingRemoved(new Date("2026-11-10T00:00:00Z"), now)).toBe(false)
    })
})

describe("reachedMilestone", () => {
    it("devuelve 0 antes del primer hito", () => {
        expect(reachedMilestone(0)).toBe(0)
        expect(reachedMilestone(24)).toBe(0)
    })
    it("devuelve el mayor hito alcanzado", () => {
        expect(reachedMilestone(25)).toBe(25)
        expect(reachedMilestone(99)).toBe(25)
        expect(reachedMilestone(100)).toBe(100)
        expect(reachedMilestone(5000)).toBe(1000)
    })
})
