import { describe, expect, it } from 'vitest'
import type { Box } from '../src/lib/boxes'
import { getNextBoxNumber, sanitizeBoxes, sortBoxes } from '../src/lib/boxes'

describe('box utilities', () => {
  it('gets next box number from empty and populated arrays', () => {
    expect(getNextBoxNumber([])).toBe(1)

    const boxes: Box[] = [
      { id: 'a', number: 2, room: 'Kitchen', items: [] },
      { id: 'b', number: 7, room: 'Bedroom', items: ['Lamp'] },
    ]

    expect(getNextBoxNumber(boxes)).toBe(8)
  })

  it('sorts boxes by numeric order', () => {
    const boxes: Box[] = [
      { id: 'a', number: 3, room: 'Office', items: [] },
      { id: 'b', number: 1, room: 'Garage', items: [] },
      { id: 'c', number: 2, room: 'Hallway', items: [] },
    ]

    const sorted = sortBoxes(boxes)
    expect(sorted.map((box) => box.number)).toEqual([1, 2, 3])
  })

  it('sanitizes invalid numbers and empty items', () => {
    const boxes = [
      { id: 'ok', number: '2', room: 'Office', items: ['Laptop', '  ', ''] },
      { id: 'bad-number', number: 0, room: 'Garage', items: ['Tool'] },
      { id: 'not-a-number', number: 'abc', room: 'Attic', items: ['Box'] },
      { id: 'negative', number: -3, room: 'Basement', items: ['Paint'] },
      { id: 'no-items', number: 5, room: 'Porch', items: 'invalid' },
    ] as unknown as Box[]

    const sanitized = sanitizeBoxes(boxes)

    expect(sanitized).toEqual([
      { id: 'ok', number: 2, room: 'Office', items: ['Laptop'] },
      { id: 'no-items', number: 5, room: 'Porch', items: [] },
    ])
  })
})
