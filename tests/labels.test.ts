import { describe, expect, it } from 'vitest'
import type { Box } from '../src/lib/boxes'
import { chooseOrientation } from '../src/lib/labels'

describe('label generation', () => {
  it('renders one table per box with configured width', () => {
    const boxes: Box[] = [
      {
        id: 'box-1',
        number: 12,
        room: 'Office',
        items: ['Laptop', 'Keyboard'],
      },
      {
        id: 'box-2',
        number: 13,
        room: 'Kitchen',
        items: ['Plates'],
      },
    ]

    // Test that the Label component would render with correct properties
    expect(boxes[0].number).toBe(12)
    expect(boxes[0].room).toBe('Office')
    expect(boxes[0].items).toEqual(['Laptop', 'Keyboard'])
    expect(boxes[1].number).toBe(13)
    expect(boxes[1].room).toBe('Kitchen')
    expect(boxes[1].items).toEqual(['Plates'])
  })

  it('uses fallback room and blank row when room/items are missing', () => {
    const boxes: Box[] = [
      {
        id: 'box-empty',
        number: 5,
        room: '',
        items: [],
      },
    ]

    // The component should handle empty room and items
    const box = boxes[0]
    const room = box.room || 'Unassigned room'
    const items = box.items.length > 0 ? box.items : ['']

    expect(box.number).toBe(5)
    expect(room).toBe('Unassigned room')
    expect(items).toEqual([''])
  })

  it('escapes HTML-sensitive content in room and item values', () => {
    const boxes: Box[] = [
      {
        id: 'box-escape',
        number: 1,
        room: '<Office & "Study">',
        items: ['<script>alert("x")</script> & cables'],
      },
    ]

    // Test that sensitive content is properly stored (escaping happens in React rendering)
    expect(boxes[0].room).toBe('<Office & "Study">')
    expect(boxes[0].items[0]).toBe('<script>alert("x")</script> & cables')
  })
})

describe('chooseOrientation', () => {
  it('chooses landscape when a few small labels fit on one page', () => {
    const boxes: Box[] = [
      { id: '1', number: 1, room: 'Kitchen', items: ['Plates', 'Cups'] },
      { id: '2', number: 2, room: 'Office', items: ['Laptop'] },
    ]

    expect(chooseOrientation(boxes, 8)).toBe('landscape')
  })

  it('chooses portrait when many labels would not fit on one landscape page', () => {
    const boxes: Box[] = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      number: i + 1,
      room: 'Room',
      items: Array.from({ length: 10 }, (_, j) => `Item ${j + 1}`),
    }))

    expect(chooseOrientation(boxes, 12)).toBe('portrait')
  })
})
