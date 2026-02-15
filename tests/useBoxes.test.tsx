import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import useBoxes from '../src/hooks/useBoxes'

function addBox(result: { current: ReturnType<typeof useBoxes> }, input: {
  room: string
  numberInput: string
  itemsInput: string
}) {
  act(() => {
    result.current.addBoxFromForm(input)
  })
}

describe('useBoxes', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a box from form input', () => {
    const { result } = renderHook(() => useBoxes())

    addBox(result, {
      room: 'Kitchen',
      numberInput: '2',
      itemsInput: 'Plates\n\nCups',
    })

    expect(result.current.boxes).toHaveLength(1)
    expect(result.current.boxes[0]).toMatchObject({
      number: 2,
      room: 'Kitchen',
      items: ['Plates', 'Cups'],
    })
    expect(result.current.nextSuggestedBoxNumber).toBe(3)
  })

  it('rejects duplicate and invalid box numbers', () => {
    const { result } = renderHook(() => useBoxes())

    let addResult = result.current.addBoxFromForm({
      room: 'Office',
      numberInput: '0',
      itemsInput: '',
    })
    expect(addResult.success).toBe(false)
    expect(result.current.boxes).toHaveLength(0)

    addBox(result, {
      room: 'Office',
      numberInput: '1',
      itemsInput: 'Laptop',
    })

    addResult = result.current.addBoxFromForm({
      room: 'Garage',
      numberInput: '1',
      itemsInput: 'Tools',
    })

    expect(addResult.success).toBe(false)
    expect(result.current.boxes).toHaveLength(1)
  })

  it('updates box numbers and rejects duplicates', () => {
    const { result } = renderHook(() => useBoxes())

    addBox(result, {
      room: 'Office',
      numberInput: '1',
      itemsInput: 'Laptop',
    })
    addBox(result, {
      room: 'Bedroom',
      numberInput: '2',
      itemsInput: 'Lamp',
    })

    const firstId = result.current.boxes[0].id
    const secondId = result.current.boxes[1].id

    let updateResult: ReturnType<typeof result.current.updateBoxNumber>
    updateResult = result.current.updateBoxNumber(firstId, '2')
    expect(updateResult.success).toBe(false)

    updateResult = result.current.updateBoxNumber(secondId, '2')
    expect(updateResult.success).toBe(true)
    expect(updateResult.message).toBe('')

    act(() => {
      updateResult = result.current.updateBoxNumber(secondId, '3')
    })
    expect(updateResult.success).toBe(true)
    expect(updateResult.message).toBe('Box number updated.')

    expect(result.current.boxes.map((box) => box.number)).toEqual([1, 3])
  })

  it('adds and removes items', () => {
    const { result } = renderHook(() => useBoxes())

    addBox(result, {
      room: 'Basement',
      numberInput: '1',
      itemsInput: '',
    })

    const boxId = result.current.boxes[0].id

    let itemResult: ReturnType<typeof result.current.addItemToBox>
    itemResult = result.current.addItemToBox(boxId, '  ')
    expect(itemResult.success).toBe(false)

    act(() => {
      itemResult = result.current.addItemToBox(boxId, 'Toolbox')
    })
    expect(itemResult.success).toBe(true)
    expect(result.current.boxes[0].items).toEqual(['Toolbox'])

    let removeResult: ReturnType<typeof result.current.removeItemFromBox>
    act(() => {
      removeResult = result.current.removeItemFromBox(boxId, 0)
    })
    expect(removeResult.success).toBe(true)
    expect(result.current.boxes[0].items).toEqual([])
  })

  it('imports boxes from CSV content', async () => {
    const { result } = renderHook(() => useBoxes())

    const csv = ['number,room,item', '2,Kitchen,Plates', '1,Bedroom,Lamp'].join('\n')
    const file = new File([csv], 'boxes.csv', { type: 'text/csv' })

    await act(async () => {
      await result.current.importBoxesCsv(file)
    })

    expect(result.current.boxes.map((box) => box.number)).toEqual([1, 2])
    expect(result.current.boxes[0].room).toBe('Bedroom')
  })
})
