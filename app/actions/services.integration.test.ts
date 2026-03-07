import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getConfiguration, updateConfiguration, createService, updateService, deleteService } from './services'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
    default: {
        service: {
            findMany: vi.fn(),
            create: vi.fn(),
            findFirst: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        profile: {
            update: vi.fn(),
        }
    }
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

vi.mock('@/lib/permissions', () => ({
    getEffectiveProfile: vi.fn().mockResolvedValue({
        id: 'test-profile-id',
        username: 'testuser',
        displayName: 'Test User',
        advanceNoticeHours: 24,
        expertise: ['Testing']
    })
}))

describe('services server actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getConfiguration', () => {
        it('returns profile and mapped services', async () => {
            vi.mocked(prisma.service.findMany).mockResolvedValue([
                { id: '1', name: 'Service 1', durationMinutes: 30, isActive: true, price: 100 } as any
            ])

            const config = await getConfiguration()

            expect(config.displayName).toBe('Test User')
            expect(config.advanceNoticeHours).toBe(24)
            expect(config.services).toHaveLength(1)
            expect(config.services[0].name).toBe('Service 1')
            expect(config.services[0].price).toBe(100)
        })
    })

    describe('updateConfiguration', () => {
        it('updates profile specific fields', async () => {
            await updateConfiguration({ displayName: 'New Name', advanceNoticeHours: 48, expertise: ['New Skill'] })

            expect(prisma.profile.update).toHaveBeenCalledWith({
                where: { id: 'test-profile-id' },
                data: {
                    displayName: 'New Name',
                    advanceNoticeHours: 48,
                    expertise: ['New Skill']
                }
            })
        })

        it('throws if displayName is empty', async () => {
            await expect(updateConfiguration({ displayName: '   ' })).rejects.toThrow("El nombre no puede estar vacío")
        })

        it('throws if advanceNoticeHours is negative', async () => {
            await expect(updateConfiguration({ advanceNoticeHours: -1 })).rejects.toThrow("La antelación debe ser mayor o igual a 0")
        })
    })

    describe('createService', () => {
        it('creates a service', async () => {
            await createService({ name: 'New Service', durationMinutes: 60, price: 50 })

            expect(prisma.service.create).toHaveBeenCalledWith({
                data: {
                    profileId: 'test-profile-id',
                    name: 'New Service',
                    durationMinutes: 60,
                    price: 50
                }
            })
        })

        it('throws if name is empty', async () => {
            await expect(createService({ name: ' ', durationMinutes: 60 })).rejects.toThrow("El nombre del servicio es requerido")
        })
    })

    describe('updateService', () => {
        it('updates service after checking ownership', async () => {
            vi.mocked(prisma.service.findFirst).mockResolvedValue({ id: 'srv-1' } as any)

            await updateService('srv-1', { name: 'Updated' })

            expect(prisma.service.update).toHaveBeenCalledWith({
                where: { id: 'srv-1' },
                data: { name: 'Updated' }
            })
        })

        it('throws if service not found or not owned', async () => {
            vi.mocked(prisma.service.findFirst).mockResolvedValue(null)

            await expect(updateService('srv-1', { name: 'Updated' })).rejects.toThrow("Servicio no encontrado")
        })
    })

    describe('deleteService', () => {
        it('deletes service after checking ownership', async () => {
            vi.mocked(prisma.service.findFirst).mockResolvedValue({ id: 'srv-1' } as any)

            await deleteService('srv-1')

            expect(prisma.service.delete).toHaveBeenCalledWith({
                where: { id: 'srv-1' }
            })
        })

        it('throws if service not found or not owned before deleting', async () => {
            vi.mocked(prisma.service.findFirst).mockResolvedValue(null)

            await expect(deleteService('srv-1')).rejects.toThrow("Servicio no encontrado")
        })
    })
})
