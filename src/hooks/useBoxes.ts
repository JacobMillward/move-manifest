import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { getNextBoxNumber, type Box } from '../lib/boxes'
import { boxesToCsv, parseBoxesFromCsv } from '../lib/csv'
import { loadBoxes, saveBoxes as persistBoxes } from '../lib/storage'

function useBoxes() {
  const [boxes, setBoxes] = useState<Box[]>(() => loadBoxes())
  const [roomInput, setRoomInput] = useState('')
  const [numberInput, setNumberInput] = useState(() => String(getNextBoxNumber(loadBoxes())))
  const [itemsInput, setItemsInput] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [newItemByBox, setNewItemByBox] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalItems = useMemo(
    () => boxes.reduce((total, box) => total + box.items.length, 0),
    [boxes],
  )

  const saveBoxes = (nextBoxes: Box[]) => {
    const sorted = persistBoxes(nextBoxes)
    setBoxes(sorted)
  }

  const addBox = () => {
    const parsedNumber = Number(numberInput)

    if (!Number.isInteger(parsedNumber) || parsedNumber < 1) {
      setStatusMessage('Box number must be a positive whole number.')
      return
    }

    if (boxes.some((box) => box.number === parsedNumber)) {
      setStatusMessage('That box number already exists. Use a different number.')
      return
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
        room: roomInput.trim(),
        items: parsedItems,
      },
    ]

    saveBoxes(nextBoxes)
    setRoomInput('')
    setItemsInput('')
    setNumberInput(String(getNextBoxNumber(nextBoxes)))
    setStatusMessage('Box added.')
  }

  const updateBox = (boxId: string, updates: Partial<Box>) => {
    const nextBoxes = boxes.map((box) => (box.id === boxId ? { ...box, ...updates } : box))
    saveBoxes(nextBoxes)
  }

  const updateBoxNumber = (boxId: string, nextNumberText: string) => {
    const parsedNumber = Number(nextNumberText)
    const currentBox = boxes.find((box) => box.id === boxId)

    if (!currentBox) {
      return
    }

    if (!Number.isInteger(parsedNumber) || parsedNumber < 1) {
      setStatusMessage('Box number must be a positive whole number.')
      return
    }

    const duplicate = boxes.some(
      (box) => box.id !== boxId && box.number === parsedNumber,
    )

    if (duplicate) {
      setStatusMessage('That box number already exists.')
      return
    }

    if (currentBox.number === parsedNumber) {
      return
    }

    updateBox(boxId, { number: parsedNumber })
    setStatusMessage('Box number updated.')
  }

  const removeBox = (boxId: string) => {
    const nextBoxes = boxes.filter((box) => box.id !== boxId)
    saveBoxes(nextBoxes)
    setNumberInput(String(getNextBoxNumber(nextBoxes)))
    setStatusMessage('Box removed.')
  }

  const addItemToBox = (boxId: string) => {
    const draftItem = (newItemByBox[boxId] ?? '').trim()

    if (!draftItem) {
      return
    }

    const targetBox = boxes.find((box) => box.id === boxId)
    if (!targetBox) {
      return
    }

    updateBox(boxId, { items: [...targetBox.items, draftItem] })
    setNewItemByBox((current) => ({ ...current, [boxId]: '' }))
    setStatusMessage('Item added.')
  }

  const removeItemFromBox = (boxId: string, itemIndex: number) => {
    const targetBox = boxes.find((box) => box.id === boxId)
    if (!targetBox) {
      return
    }

    updateBox(boxId, {
      items: targetBox.items.filter((_, index) => index !== itemIndex),
    })
    setStatusMessage('Item removed.')
  }

  const exportCsv = () => {
    const blob = new Blob([boxesToCsv(boxes)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'moving-boxes.csv'
    link.click()
    URL.revokeObjectURL(url)
    setStatusMessage('CSV exported.')
  }

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    const content = await selectedFile.text()
    const importedBoxes = parseBoxesFromCsv(content)

    saveBoxes(importedBoxes)
    setNumberInput(String(getNextBoxNumber(importedBoxes)))
    setStatusMessage(`Imported ${importedBoxes.length} boxes from CSV.`)
    event.target.value = ''
  }

  const setNewItemDraft = (boxId: string, value: string) => {
    setNewItemByBox((current) => ({
      ...current,
      [boxId]: value,
    }))
  }

  return {
    boxes,
    roomInput,
    numberInput,
    itemsInput,
    statusMessage,
    newItemByBox,
    fileInputRef,
    totalItems,
    setStatusMessage,
    setRoomInput,
    setNumberInput,
    setItemsInput,
    addBox,
    updateBox,
    updateBoxNumber,
    removeBox,
    addItemToBox,
    removeItemFromBox,
    exportCsv,
    importCsv,
    setNewItemDraft,
  }
}

export default useBoxes
