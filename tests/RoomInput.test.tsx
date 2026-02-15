import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RoomInput from '../src/components/shared/RoomInput'

function RoomInputHarness({ rooms, onChange }: { rooms: string[]; onChange: (value: string) => void }) {
  const [value, setValue] = React.useState('')

  const handleChange = (next: string) => {
    setValue(next)
    onChange(next)
  }

  return <RoomInput value={value} rooms={rooms} onChange={handleChange} />
}

describe('RoomInput', () => {
  it('shows suggestions and selects a room', async () => {
    const onChange = vi.fn()

    render(<RoomInputHarness rooms={['Kitchen', 'Office']} onChange={onChange} />)

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText('Room')

    await user.click(input)
    await user.click(screen.getByRole('button', { name: 'Kitchen' }))

    expect(onChange).toHaveBeenCalledWith('Kitchen')
  })

  it('filters suggestions based on input', async () => {
    const onChange = vi.fn()

    render(<RoomInputHarness rooms={['Kitchen', 'Office']} onChange={onChange} />)

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText('Room')

    await user.type(input, 'Off')

    expect(screen.queryByRole('button', { name: 'Kitchen' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Office' })).toBeInTheDocument()
  })
})
