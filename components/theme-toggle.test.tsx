import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeToggle } from './theme-toggle'

// Mock next-themes
const setThemeMock = vi.fn()
let currentTheme = 'light'

vi.mock('next-themes', () => ({
    useTheme: () => ({
        theme: currentTheme,
        setTheme: setThemeMock
    })
}))

describe('ThemeToggle', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        currentTheme = 'light'
    })

    it('renders correctly after hydration', () => {
        render(<ThemeToggle />)
        // Since the component uses useEffect for hydration, it will render the spacer first,
        // but React Testing Library flushes effects synchronously by default in modern versions,
        // so it should render the button immediately.
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
    })

    it('displays moon icon when theme is light', () => {
        currentTheme = 'light'
        const { container } = render(<ThemeToggle />)
        const button = screen.getByRole('button', { name: /toggle theme/i })

        // Lucide icons add lucide class
        expect(container.querySelector('.lucide-moon')).toBeInTheDocument()
        expect(container.querySelector('.lucide-sun')).not.toBeInTheDocument()
    })

    it('displays sun icon when theme is dark', () => {
        currentTheme = 'dark'
        const { container } = render(<ThemeToggle />)
        const button = screen.getByRole('button', { name: /toggle theme/i })

        expect(container.querySelector('.lucide-sun')).toBeInTheDocument()
        expect(container.querySelector('.lucide-moon')).not.toBeInTheDocument()
    })

    it('toggles theme when clicked', () => {
        currentTheme = 'light'
        render(<ThemeToggle />)

        const button = screen.getByRole('button', { name: /toggle theme/i })
        fireEvent.click(button)

        expect(setThemeMock).toHaveBeenCalledWith('dark')
    })

    it('toggles to light theme when dark is active', () => {
        currentTheme = 'dark'
        render(<ThemeToggle />)

        const button = screen.getByRole('button', { name: /toggle theme/i })
        fireEvent.click(button)

        expect(setThemeMock).toHaveBeenCalledWith('light')
    })
})
