import { describe, it, expect } from 'vitest'
import { formatPrice, parsePrice, cn } from './utils'

describe('utils', () => {
    describe('formatPrice', () => {
        it('formats numbers with thousands separators', () => {
            expect(formatPrice(1000)).toBe('1.000')
            expect(formatPrice(1000000)).toBe('1.000.000')
            expect(formatPrice(500)).toBe('500')
        })

        it('formats strings with thousands separators', () => {
            expect(formatPrice('1000')).toBe('1.000')
            expect(formatPrice('1000000')).toBe('1.000.000')
        })

        it('handles alphanumeric strings by stripping non-digits', () => {
            expect(formatPrice('1000abc')).toBe('1.000')
            expect(formatPrice('a1b2c3')).toBe('123')
        })

        it('handles empty inputs', () => {
            expect(formatPrice('')).toBe('')
        })
    })

    describe('parsePrice', () => {
        it('strips non-digits from strings', () => {
            expect(parsePrice('1.000')).toBe('1000')
            expect(parsePrice('1,000')).toBe('1000')
            expect(parsePrice('1000abc')).toBe('1000')
            expect(parsePrice('')).toBe('')
        })
    })

    describe('cn', () => {
        it('merges tailwind classes correctly', () => {
            expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
            expect(cn('px-2 py-1', 'p-4')).toBe('p-4') // twMerge handles conflicts
            expect(cn('px-2', false && 'py-1', 'text-sm')).toBe('px-2 text-sm') // clsx handles conditionals
        })
    })
})
