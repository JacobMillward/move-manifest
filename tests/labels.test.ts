import { describe, expect, it } from 'vitest'
import type { Box } from '../src/lib/boxes'
import { buildPrintableLabelsHtml, chooseOrientation } from '../src/lib/labels'

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

    const html = buildPrintableLabelsHtml(boxes, 15)

    expect(html).toContain('style="width:15cm; max-width:15cm;"')
    expect(html).toContain('BOX 12')
    expect(html).toContain('Office')
    expect(html).toContain('BOX 13')
    expect(html).toContain('Kitchen')
    expect(html).toContain('<li>Laptop</li>')
    expect(html).toContain('<li>Keyboard</li>')
    expect(html).toContain('<li>Plates</li>')
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

    const html = buildPrintableLabelsHtml(boxes, 10)

    expect(html).toContain('BOX 5')
    expect(html).toContain('Unassigned room')
    expect(html).toContain('<li></li>')
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

    const html = buildPrintableLabelsHtml(boxes, 15)

    expect(html).toContain('&lt;Office &amp; &quot;Study&quot;&gt;')
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; cables')
    expect(html).not.toContain('<script>alert("x")</script>')
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
