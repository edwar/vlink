import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AvailabilityManagement } from './availability-management'
import * as availabilityActions from '@/app/actions/availability'
import { sileo } from 'sileo'

vi.mock('@/app/actions/availability', () => ({
    getAvailability: vi.fn(),
    updateAvailability: vi.fn(),
    addSpecialBlock: vi.fn(),
    deleteAvailability: vi.fn(),
}))

vi.mock('sileo', () => ({
    sileo: {
        success: vi.fn(),
        error: vi.fn(),
    }
}))

describe('AvailabilityManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders loading state initially', () => {
        vi.mocked(availabilityActions.getAvailability).mockImplementation(() => new Promise(() => { }))
        render(<AvailabilityManagement />)
        expect(screen.getByText(/Cargando tu configuración/i)).toBeInTheDocument()
    })

    it('loads and displays weekly schedule correctly', async () => {
        vi.mocked(availabilityActions.getAvailability).mockResolvedValue([
            {
                id: "test-id-1",
                profileId: "test-profile-id",
                createdAt: new Date(),
                updatedAt: new Date(),
                dayOfWeek: 1,
                specificDate: null,
                isBlocked: false,
                startTime: "08:00",
                endTime: "16:00"
            },
        ])

        render(<AvailabilityManagement />)

        await waitFor(() => {
            expect(screen.queryByText(/Cargando tu configuración/i)).not.toBeInTheDocument()
        })

        // Check that Lunes is correctly showing 08:00 to 16:00
        const startInputs = screen.getAllByDisplayValue("08:00")
        expect(startInputs.length).toBeGreaterThan(0)
    })

    it('can toggle a day and hit save', async () => {
        vi.mocked(availabilityActions.getAvailability).mockResolvedValue([])
        vi.mocked(availabilityActions.updateAvailability).mockResolvedValue({ success: true })

        render(<AvailabilityManagement />)

        await waitFor(() => {
            expect(screen.queryByText(/Cargando tu configuración/i)).not.toBeInTheDocument()
        })

        const saveButton = screen.getByText(/Guardar cambios/i)
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(availabilityActions.updateAvailability).toHaveBeenCalled()
            expect(sileo.success).toHaveBeenCalledWith(expect.objectContaining({
                title: "Configuración guardada"
            }))
        })
    })
})
