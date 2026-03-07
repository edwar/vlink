import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAvailableSlots } from './booking'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
    default: {
        profile: {
            findUnique: vi.fn(),
        },
        appointment: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        }
    }
}))

vi.mock('@/lib/resend', () => ({
    sendAppointmentEmail: vi.fn()
}))

describe('booking actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('getAvailableSlots', () => {
        const mockProfile = {
            id: 'profile-id',
            username: 'testuser',
            advanceNoticeHours: 24,
            availabilities: []
        }

        it('throws if profile not found', async () => {
            vi.mocked(prisma.profile.findUnique).mockResolvedValue(null)
            await expect(getAvailableSlots('testuser', new Date())).rejects.toThrow('Perfil no encontrado')
        })

        it('returns empty array if no recurring availability for the given day', async () => {
            vi.mocked(prisma.profile.findUnique).mockResolvedValue(mockProfile as any)
            // Date is a Monday (1)
            const date = new Date('2026-03-02T12:00:00Z')
            const slots = await getAvailableSlots('testuser', date)
            expect(slots).toEqual([])
        })

        it('generates slots correctly based on recurring availability', async () => {
            const profileWithAvailability = {
                ...mockProfile,
                advanceNoticeHours: 0, // No advance notice needed for this test
                availabilities: [
                    { dayOfWeek: 1, startTime: '09:00', endTime: '11:00', isBlocked: false }
                ]
            }
            vi.mocked(prisma.profile.findUnique).mockResolvedValue(profileWithAvailability as any)
            vi.mocked(prisma.appointment.findMany).mockResolvedValue([])

            // Set current time to a past date so advance notice doesn't block slots
            vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

            // Monday
            const date = new Date('2026-03-02T12:00:00Z')
            // With 30 min duration (default)
            const slots = await getAvailableSlots('testuser', date)
            expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30'])
        })

        it('filters out blocks and appointments correctly', async () => {
            const profileWithBlocks = {
                ...mockProfile,
                advanceNoticeHours: 0,
                availabilities: [
                    { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isBlocked: false },
                    // Specific block from 09:30 to 10:00
                    { dayOfWeek: null, specificDate: new Date('2026-03-02T05:00:00Z'), startTime: '09:30', endTime: '10:00', isBlocked: true }
                ]
            }
            vi.mocked(prisma.profile.findUnique).mockResolvedValue(profileWithBlocks as any)

            // Existing appointment from 10:30 to 11:30
            vi.mocked(prisma.appointment.findMany).mockResolvedValue([
                { startTime: new Date('2026-03-02T10:30:00-05:00'), endTime: new Date('2026-03-02T11:30:00-05:00') } as any
            ])

            vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

            const date = new Date('2026-03-02T12:00:00Z')
            const slots = await getAvailableSlots('testuser', date)

            // Expected slots: 09:00 (09:30 blocked), 10:00 (10:30 to 11:30 appointment so 10:30 and 11:00 omitted), 11:30
            expect(slots).toEqual(['09:00', '10:00', '11:30'])
        })

        it('respects advanceNoticeHours', async () => {
            const profileWithAvailability = {
                ...mockProfile,
                advanceNoticeHours: 24, // Requires 24h notice
                availabilities: [
                    { dayOfWeek: 1, startTime: '09:00', endTime: '11:00', isBlocked: false }
                ]
            }
            vi.mocked(prisma.profile.findUnique).mockResolvedValue(profileWithAvailability as any)
            vi.mocked(prisma.appointment.findMany).mockResolvedValue([])

            // System time is March 1st at 10:00 AM (local/UTC difference handled via isoDate, let's assume same timezone for simplicity)
            vi.setSystemTime(new Date('2026-03-01T10:00:00-05:00'))

            // Booking for March 2nd. Slots before 10:00 AM should be denied (less than 24h notice)
            const date = new Date('2026-03-02T12:00:00Z')
            const slots = await getAvailableSlots('testuser', date)

            // 09:00 and 09:30 are <= 24 hours away from March 1st 10:00.
            // 10:00 is exactly 24 hours away (might be blocked depending on comparison, but < required is used)
            // Actually (slotStartDateTime.getTime() - now.getTime()) < requiredAdvanceNoticeMs
            // for 09:00 it's 23h -> blocked
            // for 09:30 it's 23.5h -> blocked
            // for 10:00 it's 24h -> allowed
            // for 10:30 it's 24.5h -> allowed
            expect(slots).toEqual(['10:00', '10:30'])
        })
    })
})
