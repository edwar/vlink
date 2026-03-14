import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processGracePeriods } from './billing-maintenance'
import prisma from '@/lib/prisma'
import { sendSubscriptionEmail } from '@/lib/resend'

vi.mock('@/lib/prisma', () => ({
    default: {
        organization: {
            findMany: vi.fn(),
            update: vi.fn(),
        }
    }
}))

vi.mock('@/lib/resend', () => ({
    sendSubscriptionEmail: vi.fn()
}))

describe('billing-maintenance server actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('processGracePeriods', () => {
        it('degrades overdue organizations and sends emails', async () => {
            const mockOrgs = [
                {
                    id: 'org-1',
                    name: 'Test Org 1',
                    subscriptionPlan: 'TEAM',
                    members: [
                        {
                            user: { email: 'owner@test.com' }
                        }
                    ]
                }
            ]

            vi.mocked(prisma.organization.findMany).mockResolvedValue(mockOrgs as any)
            vi.mocked(prisma.organization.update).mockResolvedValue({} as any)

            const result = await processGracePeriods()

            expect(result.success).toBe(true)
            expect(result.degradedCount).toBe(1)

            // Verify the find query params (we don't check exact date object strictly)
            expect(prisma.organization.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        billingStatus: "OVERDUE",
                        subscriptionPlan: { not: "BASIC" }
                    })
                })
            )

            // Verify the update action
            expect(prisma.organization.update).toHaveBeenCalledWith({
                where: { id: 'org-1' },
                data: {
                    subscriptionPlan: "BASIC",
                    billingStatus: "DEGRADED",
                    gracePeriodEnd: null
                }
            })

            // Verify email was sent
            expect(sendSubscriptionEmail).toHaveBeenCalledWith({
                to: 'owner@test.com',
                organizationName: 'Test Org 1',
                type: 'DEGRADED',
                planName: 'TEAM'
            })
        })

        it('returns 0 degraded if no overdue orgs', async () => {
            vi.mocked(prisma.organization.findMany).mockResolvedValue([])

            const result = await processGracePeriods()

            expect(result.success).toBe(true)
            expect(result.degradedCount).toBe(0)
            expect(prisma.organization.update).not.toHaveBeenCalled()
            expect(sendSubscriptionEmail).not.toHaveBeenCalled()
        })

        it('handles exceptions gracefully', async () => {
            vi.mocked(prisma.organization.findMany).mockRejectedValue(new Error('DB Error'))

            const result = await processGracePeriods()

            expect(result.success).toBe(false)
            expect(result.error).toBe('Error procesando periodos de gracia')
        })
    })
})
