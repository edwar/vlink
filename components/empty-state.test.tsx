import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmptyState } from './empty-state'
import { Settings } from 'lucide-react'

describe('EmptyState', () => {
    it('renders with title and description', () => {
        render(<EmptyState title="No items found" description="Try adding some items to see them here." />)

        expect(screen.getByText('No items found')).toBeInTheDocument()
        expect(screen.getByText('Try adding some items to see them here.')).toBeInTheDocument()
    })

    it('renders default icon when no icon is provided', () => {
        const { container } = render(<EmptyState title="No items" description="Description" />)
        // Default is CalendarIcon which has the lucide-calendar class
        expect(container.querySelector('.lucide-calendar')).toBeInTheDocument()
    })

    it('renders custom icon when provided', () => {
        const { container } = render(
            <EmptyState
                title="No items"
                description="Description"
                icon={Settings}
            />
        )
        expect(container.querySelector('.lucide-settings')).toBeInTheDocument()
    })

    it('does not render action button if text and href are not provided', () => {
        render(<EmptyState title="No items" description="Description" />)
        expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('renders action link when actionText and actionHref are provided', () => {
        render(
            <EmptyState
                title="No items"
                description="Description"
                actionText="Add Item"
                actionHref="/add-item"
            />
        )
        const link = screen.getByRole('link', { name: "Add Item" })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/add-item')
    })
})
