import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BoxesSection from '../src/components/dashboard/BoxesSection'
import type { Box } from '../src/lib/boxes'

describe('BoxesSection', () => {
  it('adds an item and clears the input on success', async () => {
    const boxes: Box[] = [
      { id: 'box-1', number: 1, room: 'Office', items: [] },
    ]

    const onAddItemToBox = vi.fn().mockReturnValue({
      success: true,
      message: 'Item added.',
    })

    render(
      <BoxesSection
        boxes={boxes}
        rooms={['Office']}
        onStatusMessage={vi.fn()}
        onUpdateBoxRoom={vi.fn()}
        onUpdateBoxNumber={vi.fn().mockReturnValue({ success: true, message: '' })}
        onRemoveBox={vi.fn().mockReturnValue({ success: true, message: '' })}
        onRemoveItemFromBox={vi.fn().mockReturnValue({ success: true, message: '' })}
        onAddItemToBox={onAddItemToBox}
      />,
    )

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText('Add an item')

    await user.type(input, 'Notebook')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(onAddItemToBox).toHaveBeenCalledWith('box-1', 'Notebook')
    expect(input).toHaveValue('')
  })
})
