import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppointmentCard } from './appointment-card'
import { cancelAppointmentAction } from '@/app/actions/cancel-appointment'

vi.mock('@/app/actions/cancel-appointment', () => ({
    cancelAppointmentAction: vi.fn()
}))

vi.mock('@/components/reschedule-dialog', () => ({
    RescheduleDialog: () => <div data-testid="reschedule-dialog">Reschedule</div>
}))

vi.mock('@/components/appointment-notes-dialog', () => ({
    AppointmentNotesDialog: () => <div data-testid="notes-dialog">Notes</div>
}))

vi.mock('sileo', () => ({
    sileo: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

describe('AppointmentCard', () => {
    const mockAppt = {
        id: 'appt-1',
        clientName: 'Jane Doe',
        clientPhone: '5551234567',
        startTime: new Date('2026-05-10T10:00:00Z').toISOString(),
        endTime: new Date('2026-05-10T11:00:00Z').toISOString(),
        status: 'CONFIRMED',
        service: {
            name: 'Consultation',
            price: 50000
        }
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders appointment details correctly', () => {
        render(<AppointmentCard appt={mockAppt} showDate={true} />)

        expect(screen.getByText('Jane Doe')).toBeDefined()
        expect(screen.getByText('Consultation')).toBeDefined()
        expect(screen.getByText('$ 50.000')).toBeDefined()
        expect(screen.getByTestId('reschedule-dialog')).toBeDefined()
        expect(screen.getByTestId('notes-dialog')).toBeDefined()
    })

    it('does not render reschedule dialog if cancelled', () => {
        render(<AppointmentCard appt={{ ...mockAppt, status: 'CANCELLED' }} />)
        expect(screen.queryByTestId('reschedule-dialog')).toBeNull()
    })

    it('opens cancellation dialog on click', () => {
        render(<AppointmentCard appt={mockAppt} />)

        // Find the cancel button (has title "Cancelar cita")
        const cancelBtn = screen.getByTitle('Cancelar cita')
        fireEvent.click(cancelBtn)

        expect(screen.getByText('¿Cancelar esta cita?')).toBeDefined()
    })

    it('calls cancel action when confirmed', async () => {
        vi.mocked(cancelAppointmentAction).mockResolvedValue({ success: true } as any)

        render(<AppointmentCard appt={mockAppt} />)

        const cancelBtn = screen.getByTitle('Cancelar cita')
        fireEvent.click(cancelBtn)

        const confirmBtn = screen.getByText('Sí, cancelar cita')
        fireEvent.click(confirmBtn)

        expect(cancelAppointmentAction).toHaveBeenCalledWith('appt-1')
    })
})
