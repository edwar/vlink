import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getGlobalStats, getAllOrganizations, getAllUsers, updateUserRole, getSystemConfig, updateSystemConfig, getPlanConfigs, updatePlanConfig, supportOrganization } from './admin'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
    default: {
        organization: { count: vi.fn(), groupBy: vi.fn(), findMany: vi.fn() },
        user: { count: vi.fn(), findMany: vi.fn(), update: vi.fn() },
        appointment: { count: vi.fn(), groupBy: vi.fn() },
        member: { count: vi.fn(), create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
        service: { findMany: vi.fn() },
        systemConfig: { findUnique: vi.fn(), create: vi.fn(), upsert: vi.fn() },
        planConfig: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() }
    }
}))

vi.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn()
        }
    }
}))

vi.mock('next/headers', () => ({
    headers: vi.fn().mockReturnValue(new Map())
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('admin server actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('ensureAdmin (Internal Check)', () => {
        it('throws Unauthorized if no session', async () => {
            vi.mocked(auth.api.getSession).mockResolvedValue(null)
            await expect(getGlobalStats()).rejects.toThrow("Unauthorized")
        })

        it('throws Unauthorized if role is not ADMIN', async () => {
            vi.mocked(auth.api.getSession).mockResolvedValue({ user: { role: 'USER', id: '1' } } as any)
            await expect(getGlobalStats()).rejects.toThrow("Unauthorized")
        })
    })

    describe('with ADMIN session', () => {
        beforeEach(() => {
            vi.mocked(auth.api.getSession).mockResolvedValue({ user: { role: 'ADMIN', id: 'admin-1' } } as any)
        })

        describe('getAllUsers', () => {
            it('returns list of users', async () => {
                vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: 'usr1', name: 'John' }] as any)

                const users = await getAllUsers()
                expect(users).toHaveLength(1)
                expect(users[0].name).toBe('John')
                expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
                    where: { role: "USER" }
                }))
            })
        })

        describe('updateUserRole', () => {
            it('updates user role', async () => {
                await updateUserRole('usr1', 'ADMIN')

                expect(prisma.user.update).toHaveBeenCalledWith({
                    where: { id: 'usr1' },
                    data: { role: 'ADMIN' }
                })
            })
        })

        describe('supportOrganization', () => {
            it('creates member record as OWNER if not existing', async () => {
                vi.mocked(prisma.member.findUnique).mockResolvedValue(null)

                await supportOrganization('org-1')

                expect(prisma.member.create).toHaveBeenCalledWith({
                    data: { userId: 'admin-1', organizationId: 'org-1', role: 'OWNER' }
                })
            })

            it('updates member record to OWNER if already member', async () => {
                vi.mocked(prisma.member.findUnique).mockResolvedValue({ id: 'mem-1', role: 'MANAGER' } as any)

                await supportOrganization('org-1')

                expect(prisma.member.update).toHaveBeenCalledWith({
                    where: { id: 'mem-1' },
                    data: { role: 'OWNER' }
                })
            })
        })
    })
})
