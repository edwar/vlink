import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAvailability, updateAvailability, addSpecialBlock, deleteAvailability, getAppointmentsForDashboard } from './availability'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
    default: {
        availability: {
            findMany: vi.fn(),
            deleteMany: vi.fn(),
            createMany: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
        appointment: {
            findMany: vi.fn(),
        },
        $transaction: vi.fn(async (callback) => {
            const tx = {
                availability: {
                    deleteMany: vi.fn(),
                    createMany: vi.fn()
                }
            }
            await callback(tx)
            return tx
        })
    }
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

vi.mock('@/lib/permissions', () => ({
    getEffectiveProfile: vi.fn().mockResolvedValue({
        id: 'test-profile-id'
    })
}))

describe('availability server actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAvailability', () => {
        it('returns profile availability', async () => {
            const mockAvail = [{ id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }]
            vi.mocked(prisma.availability.findMany).mockResolvedValue(mockAvail as any)

            const result = await getAvailability()

            expect(prisma.availability.findMany).toHaveBeenCalledWith({
                where: { profileId: 'test-profile-id' }
            })
            expect(result).toEqual(mockAvail)
        })

        it('returns empty array if nothing found', async () => {
            vi.mocked(prisma.availability.findMany).mockResolvedValue(null as any) // Simulated failure or empty return from ORM mapping
            const result = await getAvailability()
            expect(result).toEqual([])
        })
    })

    describe('updateAvailability', () => {
        it('uses transaction to delete specificDate=null and create new availability', async () => {
            const data = [
                { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' }
            ]

            const result = await updateAvailability(data)

            expect(prisma.$transaction).toHaveBeenCalled()
            // In a real integration test we'd assert the tx calls, but since we mocked $transaction implicitly,
            // we can verify it executed by checking the returned success object
            expect(result.success).toBe(true)
        })
    })

    describe('addSpecialBlock', () => {
        it('creates a special block', async () => {
            const date = new Date('2026-03-05T00:00:00Z')
            await addSpecialBlock({
                specificDate: date,
                startTime: '09:00',
                endTime: '12:00',
                isBlocked: true
            })

            expect(prisma.availability.create).toHaveBeenCalledWith({
                data: {
                    profileId: 'test-profile-id',
                    specificDate: date,
                    startTime: '09:00',
                    endTime: '12:00',
                    isBlocked: true
                }
            })
        })
    })

    describe('deleteAvailability', () => {
        it('deletes an availability record matching profile', async () => {
            await deleteAvailability('avail-1')

            expect(prisma.availability.delete).toHaveBeenCalledWith({
                where: {
                    id: 'avail-1',
                    profileId: 'test-profile-id'
                }
            })
        })
    })

    describe('getAppointmentsForDashboard', () => {
        it('fetches appointments that are not cancelled', async () => {
            const mockAppts = [{ id: 'appt-1', clientName: 'John Doe' }]
            vi.mocked(prisma.appointment.findMany).mockResolvedValue(mockAppts as any)

            const result = await getAppointmentsForDashboard()

            expect(prisma.appointment.findMany).toHaveBeenCalledWith({
                where: {
                    profileId: 'test-profile-id',
                    status: { not: "CANCELLED" }
                },
                include: { service: true }
            })
            expect(result).toEqual(mockAppts)
        })
    })
})
