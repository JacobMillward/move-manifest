import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AddBoxTab from '../src/components/dashboard/AddBoxTab'

describe('AddBoxTab', () => {
  it('submits a box and clears fields on success', async () => {
    const onAddBox = vi.fn().mockReturnValue({
      success: true,
      message: 'Box added.',
      nextSuggestedNumber: 4,
    })
    const onStatusMessage = vi.fn()

    render(
      <AddBoxTab
        nextSuggestedNumber={3}
        rooms={['Kitchen', 'Office']}
        onAddBox={onAddBox}
        onStatusMessage={onStatusMessage}
      />,
    )

    const user = userEvent.setup()

    const roomInput = screen.getByPlaceholderText('Room')
    const numberInput = screen.getByRole('spinbutton')
    const itemsInput = screen.getByPlaceholderText(/plates/i)

    await user.clear(roomInput)
    await user.type(roomInput, 'Kitchen')
    await user.clear(numberInput)
    await user.type(numberInput, '3')
    await user.type(itemsInput, 'Plates\nCups')

    await user.click(screen.getByRole('button', { name: /add box/i }))

    expect(onAddBox).toHaveBeenCalledWith({
      room: 'Kitchen',
      numberInput: '3',
      itemsInput: 'Plates\nCups',
    })
    expect(onStatusMessage).toHaveBeenCalledWith('Box added.')

    expect(roomInput).toHaveValue('')
    expect(itemsInput).toHaveValue('')
    expect(numberInput).toHaveValue(4)
  })
})
