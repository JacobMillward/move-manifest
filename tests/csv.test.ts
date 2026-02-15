import { describe, expect, it } from 'vitest'
import type { Box } from '../src/lib/boxes'
import { boxesToCsv, parseBoxesFromCsv } from '../src/lib/csv'

function withoutIds(boxes: Box[]): Omit<Box, 'id'>[] {
  return boxes.map(({ id: _id, ...box }) => box)
}

describe('csv import/export', () => {
  it('exports boxes to CSV with header and escaped values', () => {
    const boxes: Box[] = [
      {
        id: 'a',
        number: 2,
        room: 'Kitchen, Main',
        items: ['Plate "set"'],
      },
      {
        id: 'b',
        number: 1,
        room: 'Bedroom',
        items: [],
      },
    ]

    const csv = boxesToCsv(boxes)

    expect(csv).toBe(
      [
        'number,room,item',
        '1,Bedroom,',
        '2,"Kitchen, Main","Plate ""set"""',
      ].join('\n'),
    )
  })

  it('imports CSV rows grouped by box number', () => {
    const csv = [
      'number,room,item',
      '2,Kitchen,Plates',
      '2,Kitchen,Cups',
      '1,Bedroom,Lamp',
      '1,Bedroom,',
    ].join('\n')

    const result = parseBoxesFromCsv(csv)

    expect(withoutIds(result)).toEqual([
      { number: 1, room: 'Bedroom', items: ['Lamp'] },
      { number: 2, room: 'Kitchen', items: ['Plates', 'Cups'] },
    ])
  })

  it('round-trips export then import', () => {
    const boxes: Box[] = [
      {
        id: 'x',
        number: 3,
        room: 'Hallway',
        items: ['Shoes', 'Coats'],
      },
      {
        id: 'y',
        number: 4,
        room: 'Office',
        items: [],
      },
    ]

    const csv = boxesToCsv(boxes)
    const imported = parseBoxesFromCsv(csv)

    expect(withoutIds(imported)).toEqual([
      { number: 3, room: 'Hallway', items: ['Shoes', 'Coats'] },
      { number: 4, room: 'Office', items: [] },
    ])
  })
})
