import { sanitizeBoxes, sortBoxes, type Box } from './boxes'

export const STORAGE_KEY = 'move-manifest-boxes'

export function loadBoxes(storage: Storage = localStorage): Box[] {
  const stored = storage.getItem(STORAGE_KEY)

  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored) as Box[]
    return sortBoxes(sanitizeBoxes(parsed))
  } catch {
    return []
  }
}

export function saveBoxes(boxes: Box[], storage: Storage = localStorage): Box[] {
  const sorted = sortBoxes(boxes)
  storage.setItem(STORAGE_KEY, JSON.stringify(sorted))
  return sorted
}
