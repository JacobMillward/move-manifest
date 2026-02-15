import { useMemo, useState } from 'react'
import { getNextBoxNumber, type Box } from '../lib/boxes'
import { boxesToCsv, parseBoxesFromCsv } from '../lib/csv'
import { loadBoxes, saveBoxes as persistBoxes } from '../lib/storage'

type ActionResult = {
  success: boolean
  message: string
}

type AddBoxInput = {
  room: string
  numberInput: string
  itemsInput: string
}

type AddBoxResult = ActionResult & {
  nextSuggestedNumber: number
}

function useBoxes() {
  const [boxes, setBoxes] = useState<Box[]>(() => loadBoxes())

  const totalItems = useMemo(
    () => boxes.reduce((total, box) => total + box.items.length, 0),
    [boxes],
  )

  const nextSuggestedBoxNumber = useMemo(() => getNextBoxNumber(boxes), [boxes])

  const saveBoxes = (nextBoxes: Box[]) => {
    const sorted = persistBoxes(nextBoxes)
    setBoxes(sorted)
  }

  const addBoxFromForm = ({ room, numberInput, itemsInput }: AddBoxInput): AddBoxResult => {
    const parsedNumber = Number(numberInput)

    if (!Number.isInteger(parsedNumber) || parsedNumber < 1) {
      return {
        success: false,
        message: 'Box number must be a positive whole number.',
        nextSuggestedNumber: nextSuggestedBoxNumber,
      }
    }

    if (boxes.some((box) => box.number === parsedNumber)) {
      return {
        success: false,
        message: 'That box number already exists. Use a different number.',
        nextSuggestedNumber: nextSuggestedBoxNumber,
      }
    }

    const parsedItems = itemsInput
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    const nextBoxes = [
      ...boxes,
      {
        id: crypto.randomUUID(),
        number: parsedNumber,
        room: room.trim(),
        items: parsedItems,
      },
    ]

    saveBoxes(nextBoxes)
    return {
      success: true,
      message: 'Box added.',
      nextSuggestedNumber: getNextBoxNumber(nextBoxes),
    }
  }

  const updateBoxRoom = (boxId: string, room: string) => {
    const nextBoxes = boxes.map((box) => (box.id === boxId ? { ...box, room } : box))
    saveBoxes(nextBoxes)
  }

  const updateBoxNumber = (boxId: string, nextNumberText: string): ActionResult => {
    const parsedNumber = Number(nextNumberText)
    const currentBox = boxes.find((box) => box.id === boxId)

    if (!currentBox) {
      return {
        success: false,
        message: 'Box not found.',
      }
    }

    if (!Number.isInteger(parsedNumber) || parsedNumber < 1) {
      return {
        success: false,
        message: 'Box number must be a positive whole number.',
      }
    }

    const duplicate = boxes.some(
      (box) => box.id !== boxId && box.number === parsedNumber,
    )

    if (duplicate) {
      return {
        success: false,
        message: 'That box number already exists.',
      }
    }

    if (currentBox.number === parsedNumber) {
      return {
        success: true,
        message: '',
      }
    }

    const nextBoxes = boxes.map((box) =>
      box.id === boxId ? { ...box, number: parsedNumber } : box,
    )
    saveBoxes(nextBoxes)

    return {
      success: true,
      message: 'Box number updated.',
    }
  }

  const removeBox = (boxId: string): ActionResult => {
    const nextBoxes = boxes.filter((box) => box.id !== boxId)
    saveBoxes(nextBoxes)
    return {
      success: true,
      message: 'Box removed.',
    }
  }

  const addItemToBox = (boxId: string, draftItem: string): ActionResult => {
    const trimmedItem = draftItem.trim()

    if (!trimmedItem) {
      return {
        success: false,
        message: 'Item cannot be empty.',
      }
    }

    const targetBox = boxes.find((box) => box.id === boxId)
    if (!targetBox) {
      return {
        success: false,
        message: 'Box not found.',
      }
    }

    const nextBoxes = boxes.map((box) =>
      box.id === boxId ? { ...box, items: [...targetBox.items, trimmedItem] } : box,
    )
    saveBoxes(nextBoxes)
    return {
      success: true,
      message: 'Item added.',
    }
  }

  const removeItemFromBox = (boxId: string, itemIndex: number): ActionResult => {
    const targetBox = boxes.find((box) => box.id === boxId)
    if (!targetBox) {
      return {
        success: false,
        message: 'Box not found.',
      }
    }

    const nextBoxes = boxes.map((box) =>
      box.id === boxId
        ? { ...box, items: targetBox.items.filter((_, index) => index !== itemIndex) }
        : box,
    )
    saveBoxes(nextBoxes)
    return {
      success: true,
      message: 'Item removed.',
    }
  }

  const exportBoxesCsv = (): ActionResult => {
    const blob = new Blob([boxesToCsv(boxes)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'moving-boxes.csv'
    link.click()
    URL.revokeObjectURL(url)
    return {
      success: true,
      message: 'CSV exported.',
    }
  }

  const importBoxesCsv = async (selectedFile: File): Promise<ActionResult> => {
    const content = await selectedFile.text()
    const importedBoxes = parseBoxesFromCsv(content)

    saveBoxes(importedBoxes)
    return {
      success: true,
      message: `Imported ${importedBoxes.length} boxes from CSV.`,
    }
  }

  return {
    boxes,
    totalItems,
    nextSuggestedBoxNumber,
    addBoxFromForm,
    updateBoxRoom,
    updateBoxNumber,
    removeBox,
    addItemToBox,
    removeItemFromBox,
    exportBoxesCsv,
    importBoxesCsv,
  }
}

export default useBoxes
