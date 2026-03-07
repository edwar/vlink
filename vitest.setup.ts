import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Setup window.matchMedia if needed
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Setup Next.js router mock
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}))

vi.mock('next/font/google', () => ({
    Inter: () => ({ style: { fontFamily: 'Inter' } }),
    Outfit: () => ({ style: { fontFamily: 'Outfit' } }),
}))
