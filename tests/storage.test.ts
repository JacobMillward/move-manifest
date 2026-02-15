import { beforeEach, describe, expect, it } from 'vitest'
import type { Box } from '../src/lib/boxes'
import { loadBoxes, saveBoxes, STORAGE_KEY } from '../src/lib/storage'

function createMemoryStorage(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }
}

describe('localStorage persistence', () => {
  let storage: Storage

  beforeEach(() => {
    storage = createMemoryStorage()
  })

  it('saves sorted boxes and loads them back', () => {
    const boxes: Box[] = [
      { id: 'b', number: 2, room: 'Kitchen', items: ['Plates'] },
      { id: 'a', number: 1, room: 'Bedroom', items: ['Lamp'] },
    ]

    const saved = saveBoxes(boxes, storage)

    expect(saved.map((box) => box.number)).toEqual([1, 2])

    const storedRaw = storage.getItem(STORAGE_KEY)
    expect(storedRaw).not.toBeNull()

    const loaded = loadBoxes(storage)
    expect(loaded).toEqual([
      { id: 'a', number: 1, room: 'Bedroom', items: ['Lamp'] },
      { id: 'b', number: 2, room: 'Kitchen', items: ['Plates'] },
    ])
  })

  it('loads empty array when storage is missing or invalid JSON', () => {
    expect(loadBoxes(storage)).toEqual([])

    storage.setItem(STORAGE_KEY, 'not-json')
    expect(loadBoxes(storage)).toEqual([])
  })

  it('sanitizes invalid box records and empty items while loading', () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 'ok', number: '1', room: 'Office', items: ['Laptop', '', '   '] },
        { id: 'bad-number', number: 0, room: 'Garage', items: ['Tool'] },
        { id: 'also-bad', number: 'abc', room: 'Attic', items: ['Box'] },
      ]),
    )

    expect(loadBoxes(storage)).toEqual([
      { id: 'ok', number: 1, room: 'Office', items: ['Laptop'] },
    ])
  })
})
