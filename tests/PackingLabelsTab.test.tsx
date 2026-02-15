import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PackingLabelsTab from '../src/components/dashboard/PackingLabelsTab'
import type { Box } from '../src/lib/boxes'

describe('PackingLabelsTab', () => {
  const boxes: Box[] = [
    { id: 'a', number: 1, room: 'Kitchen', items: ['Plates'] },
    { id: 'b', number: 2, room: 'Office', items: ['Laptop'] },
  ]

  let originalLocation: Location

  beforeEach(() => {
    originalLocation = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'http://localhost/',
      },
    })
    localStorage.clear()
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('shows validation when width is invalid', async () => {
    const onStatusMessage = vi.fn()

    render(<PackingLabelsTab boxes={boxes} onStatusMessage={onStatusMessage} />)

    const user = userEvent.setup()
    const widthInput = screen.getByRole('spinbutton')

    await user.clear(widthInput)
    await user.type(widthInput, '0')
    await user.click(screen.getByRole('button', { name: /generate labels/i }))

    expect(onStatusMessage).toHaveBeenCalledWith('Max width must be a positive number in centimeters.')
  })

  it('shows validation when no boxes are selected', async () => {
    const onStatusMessage = vi.fn()

    render(<PackingLabelsTab boxes={boxes} onStatusMessage={onStatusMessage} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /clear all/i }))
    await user.click(screen.getByRole('button', { name: /generate labels/i }))

    expect(onStatusMessage).toHaveBeenCalledWith('Select at least one box to generate labels.')
  })

  it('navigates to the labels page with selected ids', async () => {
    const onStatusMessage = vi.fn()

    render(<PackingLabelsTab boxes={boxes} onStatusMessage={onStatusMessage} />)

    const user = userEvent.setup()
    const widthInput = screen.getByRole('spinbutton')

    await user.clear(widthInput)
    await user.type(widthInput, '12')
    await user.click(screen.getByRole('button', { name: /generate labels/i }))

    expect(window.location.href).toContain('/labels?width=12&ids=a,b')
  })
})
