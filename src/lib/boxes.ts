export type Box = {
  id: string
  number: number
  room: string
  items: string[]
}

export function getNextBoxNumber(boxes: Box[]): number {
  const maxNumber = boxes.reduce((maximum, box) => Math.max(maximum, box.number), 0)
  return maxNumber + 1
}

export function sortBoxes(boxes: Box[]): Box[] {
  return [...boxes].sort((left, right) => left.number - right.number)
}

export function sanitizeBoxes(boxes: Box[]): Box[] {
  return boxes
    .map((box) => ({
      id: box.id,
      number: Number(box.number),
      room: box.room,
      items: Array.isArray(box.items) ? box.items.filter((item) => item.trim()) : [],
    }))
    .filter((box) => Number.isFinite(box.number) && box.number > 0)
}
