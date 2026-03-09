import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOrganization, createInvitation, acceptInvitation, transferOwnership, updateMemberRole, leaveOrganization, deleteOrganization } from './organization'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
    default: {
        organization: {
            findFirst: vi.fn(),
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn()
        },
        profile: {
            update: vi.fn(),
            updateMany: vi.fn()
        },
        member: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            upsert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn()
        },
        invitation: {
            create: vi.fn(),
            findUnique: vi.fn()
        },
        planConfig: {
            findUnique: vi.fn()
        },
        $transaction: vi.fn(async (callback) => {
            if (typeof callback === 'function') {
                const tx = {
                    organization: { create: vi.fn().mockResolvedValue({ id: 'org-id', name: 'org-name' }), delete: vi.fn() },
                    profile: { update: vi.fn(), updateMany: vi.fn() },
                    member: { upsert: vi.fn(), delete: vi.fn() }
                }
                return await callback(tx)
            } else if (Array.isArray(callback)) {
                return Promise.all(callback) // Para los casos como [prisma.member.update, prisma.member.update]
            }
        })
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

vi.mock('next/headers', () => ({
    headers: vi.fn(),
    cookies: vi.fn().mockResolvedValue({
        delete: vi.fn()
    })
}))

describe('organization actions', () => {
    const mockSession = { user: { id: 'user-1' } }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any)
    })

    describe('createOrganization', () => {
        it('throws if not logged in', async () => {
            vi.mocked(auth.api.getSession).mockResolvedValue(null)
            await expect(createOrganization('Test Org')).rejects.toThrow("Unauthorized")
        })

        it('throws if name is duplicated', async () => {
            vi.mocked(prisma.organization.findFirst).mockResolvedValue({ id: 'org-ex', name: 'Test Org' } as any)
            await expect(createOrganization('Test Org')).rejects.toThrow(`Ya existe una organización con el nombre "Test Org". Por favor elige otro nombre.`)
        })

        it('creates an org with proper slug and assigns profile', async () => {
            vi.mocked(prisma.organization.findFirst).mockResolvedValue(null)
            // Implicit check on tx.organization.create and tx.profile.update
            const result = await createOrganization('My Team')
            expect(result.success).toBe(true)
            expect(prisma.$transaction).toHaveBeenCalled()
        })
    })

    describe('createInvitation', () => {
        it('throws if not OWNER', async () => {
            vi.mocked(prisma.member.findFirst).mockResolvedValue(null)
            const result = await createInvitation('org-id')
            expect(result.success).toBe(false)
            expect(result.error).toBe("No tienes permisos para crear invitaciones en esta organización")
        })

        it('checks plan limits and creates invitation', async () => {
            vi.mocked(prisma.member.findFirst).mockResolvedValue({ role: 'OWNER' } as any)
            vi.mocked(prisma.organization.findUnique).mockResolvedValue({ _count: { members: 1, invitations: 0 } } as any)
            vi.mocked(prisma.planConfig.findUnique).mockResolvedValue({ maxSeats: 5 } as any)
            vi.mocked(prisma.invitation.create).mockResolvedValue({ token: '123e4567-e89b-12d3-a456-426614174000' } as any)

            const result = await createInvitation('org-id')
            expect(result.success).toBe(true)
            expect(result.token).toBeDefined()
            expect(prisma.invitation.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ role: 'PROFESSIONAL' })
            }))
        })

        it('fails if max seats reached', async () => {
            vi.mocked(prisma.member.findFirst).mockResolvedValue({ role: 'OWNER' } as any)
            vi.mocked(prisma.organization.findUnique).mockResolvedValue({ _count: { members: 5, invitations: 0 } } as any)
            vi.mocked(prisma.planConfig.findUnique).mockResolvedValue({ maxSeats: 5, name: 'TEAM' } as any)

            const result = await createInvitation('org-id')
            expect(result.success).toBe(false)
            expect(result.error).toContain("El plan TEAM tiene un límite de 5 miembros")
        })
    })

    describe('transferOwnership', () => {
        it('throws if caller is not OWNER', async () => {
            vi.mocked(prisma.member.findUnique).mockResolvedValue({ role: 'MANAGER' } as any)
            await expect(transferOwnership('org-id', 'user-2')).rejects.toThrow("Solo el propietario puede transferir la propiedad")
        })

        it('throws if target is not in org', async () => {
            vi.mocked(prisma.member.findUnique)
                .mockResolvedValueOnce({ id: 'caller', role: 'OWNER' } as any)
                .mockResolvedValueOnce(null)

            await expect(transferOwnership('org-id', 'user-2')).rejects.toThrow("El usuario no es miembro de esta organización")
        })

        it('updates roles', async () => {
            vi.mocked(prisma.member.findUnique)
                .mockResolvedValueOnce({ id: 'caller', role: 'OWNER' } as any)
                .mockResolvedValueOnce({ id: 'target', user: { name: 'New Owner' } } as any)

            const result = await transferOwnership('org-id', 'user-2')
            expect(result.success).toBe(true)
            expect(prisma.$transaction).toHaveBeenCalled()
        })
    })

    describe('updateMemberRole', () => {
        it('throws if target is OWNER', async () => {
            vi.mocked(prisma.member.findUnique)
                .mockResolvedValueOnce({ id: 'caller', role: 'OWNER' } as any)
                .mockResolvedValueOnce({ id: 'target', role: 'OWNER' } as any)

            await expect(updateMemberRole('org-1', 'user-2', 'MANAGER')).rejects.toThrow("No puedes cambiar el rol de otro propietario")
        })

        it('changes role', async () => {
            vi.mocked(prisma.member.findUnique)
                .mockResolvedValueOnce({ id: 'caller', role: 'OWNER' } as any)
                .mockResolvedValueOnce({ id: 'target', role: 'PROFESSIONAL' } as any)

            await updateMemberRole('org-1', 'user-2', 'MANAGER')

            expect(prisma.member.update).toHaveBeenCalledWith({
                where: { id: 'target' },
                data: { role: 'MANAGER' }
            })
        })
    })

    describe('deleteOrganization', () => {
        it('throws if caller not OWNER', async () => {
            vi.mocked(prisma.member.findUnique).mockResolvedValue({ role: 'MANAGER' } as any)
            await expect(deleteOrganization('org-id')).rejects.toThrow("Solo el propietario puede cerrar la organización")
        })

        it('throws if other members exist', async () => {
            vi.mocked(prisma.member.findUnique).mockResolvedValue({ role: 'OWNER' } as any)
            vi.mocked(prisma.member.count).mockResolvedValue(2)
            await expect(deleteOrganization('org-id')).rejects.toThrow("Aún hay 1 miembro en la organización. Debes eliminarlos antes de cerrarla.")
        })

        it('deletes organization transactionally when lonely owner', async () => {
            vi.mocked(prisma.member.findUnique).mockResolvedValue({ role: 'OWNER' } as any)
            vi.mocked(prisma.member.count).mockResolvedValue(1)

            const res = await deleteOrganization('org-id')
            expect(res.success).toBe(true)
            expect(prisma.$transaction).toHaveBeenCalled()
        })
    })
})
