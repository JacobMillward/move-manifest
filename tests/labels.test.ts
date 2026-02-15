import { describe, expect, it } from 'vitest'
import type { Box } from '../src/lib/boxes'
import { buildPrintableLabelsHtml } from '../src/lib/labels'

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
    expect(html).toContain('<tr><th>Box 12 • Office</th></tr>')
    expect(html).toContain('<tr><th>Box 13 • Kitchen</th></tr>')
    expect(html).toContain('<tr><td>Laptop</td></tr>')
    expect(html).toContain('<tr><td>Keyboard</td></tr>')
    expect(html).toContain('<tr><td>Plates</td></tr>')
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

    expect(html).toContain('<tr><th>Box 5 • Unassigned room</th></tr>')
    expect(html).toContain('<tbody><tr><td></td></tr></tbody>')
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

    expect(html).toContain('Box 1 • &lt;Office &amp; &quot;Study&quot;&gt;')
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; cables')
    expect(html).not.toContain('<script>alert("x")</script>')
  })
})
