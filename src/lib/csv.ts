import { sortBoxes, type Box } from './boxes'

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]

    if (character === '"') {
      const nextCharacter = line[index + 1]
      if (inQuotes && nextCharacter === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (character === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += character
  }

  values.push(current)
  return values
}

function escapeCsvValue(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }

  return value
}

export function boxesToCsv(boxes: Box[]): string {
  const lines = ['number,room,item']

  sortBoxes(boxes).forEach((box) => {
    if (box.items.length === 0) {
      lines.push(`${box.number},${escapeCsvValue(box.room)},`)
      return
    }

    box.items.forEach((item) => {
      lines.push(`${box.number},${escapeCsvValue(box.room)},${escapeCsvValue(item)}`)
    })
  })

  return lines.join('\n')
}

export function parseBoxesFromCsv(content: string): Box[] {
  const rows = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (rows.length === 0) {
    return []
  }

  const firstRowColumns = parseCsvLine(rows[0]).map((column) => column.toLowerCase())
  const hasHeader =
    firstRowColumns[0] === 'number' &&
    firstRowColumns[1] === 'room' &&
    firstRowColumns[2] === 'item'

  const dataRows = hasHeader ? rows.slice(1) : rows
  const grouped = new Map<number, Box>()

  dataRows.forEach((row) => {
    const [numberText = '', roomText = '', itemText = ''] = parseCsvLine(row)
    const numberValue = Number(numberText)

    if (!Number.isInteger(numberValue) || numberValue < 1) {
      return
    }

    const existingBox = grouped.get(numberValue)
    const trimmedRoom = roomText.trim()
    const trimmedItem = itemText.trim()

    if (!existingBox) {
      grouped.set(numberValue, {
        id: crypto.randomUUID(),
        number: numberValue,
        room: trimmedRoom,
        items: trimmedItem ? [trimmedItem] : [],
      })
      return
    }

    if (!existingBox.room && trimmedRoom) {
      existingBox.room = trimmedRoom
    }

    if (trimmedItem) {
      existingBox.items.push(trimmedItem)
    }
  })

  return sortBoxes(Array.from(grouped.values()))
}
