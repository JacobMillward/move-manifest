import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { getNextBoxNumber, type Box } from './lib/boxes'
import { boxesToCsv, parseBoxesFromCsv } from './lib/csv'
import { loadBoxes, saveBoxes as persistBoxes } from './lib/storage'

const LABEL_HEADER_HEIGHT_CM = 1.6
const LABEL_ROW_HEIGHT_CM = 0.62

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function splitItemsIntoColumns(items: string[], maxHeightCm: number): string[][] {
  const safeItems = items.length > 0 ? items : ['']
  const availableHeight = Math.max(maxHeightCm - LABEL_HEADER_HEIGHT_CM, LABEL_ROW_HEIGHT_CM)
  const maxRowsPerColumn = Math.max(1, Math.floor(availableHeight / LABEL_ROW_HEIGHT_CM))
  const columns: string[][] = []

  for (let index = 0; index < safeItems.length; index += maxRowsPerColumn) {
    columns.push(safeItems.slice(index, index + maxRowsPerColumn))
  }

  return columns
}

function buildPrintableLabelsHtml(boxes: Box[], maxHeightCm: number): string {
  const labelsHtml = boxes
    .map((box) => {
      const columns = splitItemsIntoColumns(box.items, maxHeightCm)
      const columnTables = columns
        .map((columnItems, columnIndex) => {
          const title = columnIndex === 0 ? `Box ${box.number}` : `Box ${box.number} (cont.)`
          const rows = columnItems
            .map((item) => `<tr><td>${escapeHtml(item)}</td></tr>`)
            .join('')

          return `
            <table class="label-column" style="max-height:${maxHeightCm}cm">
              <thead>
                <tr><th>${escapeHtml(title)}</th></tr>
                <tr><th class="room">${escapeHtml(box.room || 'Unassigned room')}</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          `
        })
        .join('')

      return `<section class="label-group">${columnTables}</section>`
    })
    .join('')

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Packing Labels</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #fff;
            color: #000;
          }

          .toolbar {
            position: sticky;
            top: 0;
            display: flex;
            justify-content: flex-end;
            padding: 8px 10mm;
            border-bottom: 1px solid #ddd;
            background: #fff;
          }

          .toolbar button {
            border: 1px solid #333;
            padding: 6px 10px;
            background: #fff;
            cursor: pointer;
          }

          .sheet {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
            gap: 5mm;
            padding: 10mm;
          }

          .label-group {
            display: flex;
            gap: 3mm;
            align-items: flex-start;
            width: fit-content;
          }

          .label-column {
            width: 60mm;
            border-collapse: collapse;
            table-layout: fixed;
            page-break-inside: avoid;
          }

          .label-column th,
          .label-column td {
            border: 1px solid #000;
            padding: 3mm 2.5mm;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: break-word;
            font-size: 12px;
            line-height: 1.2;
          }

          .label-column th {
            text-align: left;
            font-size: 13px;
          }

          .label-column th.room {
            font-weight: normal;
          }

          @media print {
            .toolbar {
              display: none;
            }

            .sheet {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <button onclick="window.print()">Print Labels</button>
        </div>
        <main class="sheet">${labelsHtml}</main>
      </body>
    </html>
  `
}

function App() {
  const [boxes, setBoxes] = useState<Box[]>(() => loadBoxes())
  const [roomInput, setRoomInput] = useState('')
  const [numberInput, setNumberInput] = useState(() => String(getNextBoxNumber(loadBoxes())))
  const [itemsInput, setItemsInput] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [newItemByBox, setNewItemByBox] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'add-box' | 'packing-labels'>('add-box')
  const [labelsMaxHeightCm, setLabelsMaxHeightCm] = useState('7')
  const [excludedLabelBoxIds, setExcludedLabelBoxIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalItems = useMemo(
    () => boxes.reduce((total, box) => total + box.items.length, 0),
    [boxes],
  )

  const selectedLabelBoxes = useMemo(
    () => boxes.filter((box) => !excludedLabelBoxIds.includes(box.id)),
    [boxes, excludedLabelBoxIds],
  )

  useEffect(() => {
    const existingBoxIds = new Set(boxes.map((box) => box.id))
    setExcludedLabelBoxIds((current) => current.filter((boxId) => existingBoxIds.has(boxId)))
  }, [boxes])

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

  const toggleLabelBoxSelection = (boxId: string) => {
    setExcludedLabelBoxIds((current) => {
      if (current.includes(boxId)) {
        return current.filter((excludedId) => excludedId !== boxId)
      }

      return [...current, boxId]
    })
  }

  const selectAllLabelBoxes = () => {
    setExcludedLabelBoxIds([])
  }

  const clearAllLabelBoxes = () => {
    setExcludedLabelBoxIds(boxes.map((box) => box.id))
  }

  const generatePackingLabels = () => {
    const parsedHeight = Number(labelsMaxHeightCm)

    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      setStatusMessage('Max height must be a positive number in centimeters.')
      return
    }

    if (selectedLabelBoxes.length === 0) {
      setStatusMessage('Select at least one box to generate labels.')
      return
    }

    const printWindow = window.open('', '_blank', 'noopener,noreferrer')

    if (!printWindow) {
      setStatusMessage('Unable to open print window. Allow pop-ups and try again.')
      return
    }

    printWindow.document.open()
    printWindow.document.write(buildPrintableLabelsHtml(selectedLabelBoxes, parsedHeight))
    printWindow.document.close()
    setStatusMessage(`Generated ${selectedLabelBoxes.length} packing labels.`)
  }

  return (
    <main className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h1 className="card-title text-2xl">Moving Box Tracker</h1>
            <p className="text-sm text-base-content/70">
              Keep a list of boxes, room assignments, and items while moving.
            </p>

            <div className="stats stats-vertical bg-base-200 md:stats-horizontal">
              <div className="stat py-3">
                <div className="stat-title">Boxes</div>
                <div className="stat-value text-primary">{boxes.length}</div>
              </div>
              <div className="stat py-3">
                <div className="stat-title">Items</div>
                <div className="stat-value text-secondary">{totalItems}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" onClick={exportCsv}>
                Export CSV
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Import CSV
              </button>
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept=".csv,text/csv"
                onChange={importCsv}
              />
            </div>

            {statusMessage ? <div className="alert alert-info py-2 text-sm">{statusMessage}</div> : null}
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body">
            <div role="tablist" className="tabs tabs-box mb-2">
              <button
                type="button"
                role="tab"
                className={`tab ${activeTab === 'add-box' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('add-box')}
              >
                Add Box
              </button>
              <button
                type="button"
                role="tab"
                className={`tab ${activeTab === 'packing-labels' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('packing-labels')}
              >
                Packing Labels
              </button>
            </div>

            {activeTab === 'add-box' ? (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
                  <fieldset className="fieldset w-full md:flex-1">
                    <legend className="fieldset-legend">Room</legend>
                    <input
                      className="input input-bordered w-full"
                      placeholder="Kitchen"
                      value={roomInput}
                      onChange={(event) => setRoomInput(event.target.value)}
                    />
                  </fieldset>

                  <fieldset className="fieldset w-full md:w-40">
                    <legend className="fieldset-legend">Number</legend>
                    <input
                      className="input input-bordered w-full"
                      type="number"
                      min={1}
                      value={numberInput}
                      onChange={(event) => setNumberInput(event.target.value)}
                    />
                  </fieldset>

                  <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend">Items (one per line)</legend>
                    <textarea
                      className="textarea textarea-bordered"
                      value={itemsInput}
                      onChange={(event) => setItemsInput(event.target.value)}
                      placeholder={'Plates\nCups\nPans'}
                    />
                  </fieldset>
                </div>

                <div className="card-actions justify-end">
                  <button type="button" className="btn btn-primary" onClick={addBox}>
                    Add Box
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  <fieldset className="fieldset max-w-xs">
                    <legend className="fieldset-legend">Max Height (cm)</legend>
                    <input
                      className="input input-bordered"
                      type="number"
                      min={0.5}
                      step={0.1}
                      value={labelsMaxHeightCm}
                      onChange={(event) => setLabelsMaxHeightCm(event.target.value)}
                    />
                  </fieldset>

                  <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend">Boxes to include</legend>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <button type="button" className="btn btn-sm btn-outline" onClick={selectAllLabelBoxes}>
                        Select All
                      </button>
                      <button type="button" className="btn btn-sm btn-outline" onClick={clearAllLabelBoxes}>
                        Clear All
                      </button>
                    </div>

                    {boxes.length === 0 ? (
                      <p className="text-sm text-base-content/70">No boxes available yet.</p>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2">
                        {boxes.map((box) => {
                          const isSelected = !excludedLabelBoxIds.includes(box.id)
                          return (
                            <label
                              key={box.id}
                              className="label cursor-pointer justify-start gap-3 rounded-box border border-base-300 px-3 py-2"
                            >
                              <input
                                className="checkbox checkbox-sm"
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleLabelBoxSelection(box.id)}
                              />
                              <span className="label-text">
                                Box {box.number} {box.room ? `• ${box.room}` : ''}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </fieldset>
                </div>

                <div className="card-actions justify-end">
                  <button type="button" className="btn btn-primary" onClick={generatePackingLabels}>
                    Generate Labels
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          {boxes.map((box) => (
            <article key={box.id} className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Room</legend>
                    <input
                      className="input input-bordered"
                      value={box.room}
                      onChange={(event) => updateBox(box.id, { room: event.target.value })}
                    />
                  </fieldset>

                  <fieldset className="fieldset md:w-32">
                    <legend className="fieldset-legend">Number</legend>
                    <input
                      className="input input-bordered"
                      type="number"
                      min={1}
                      value={box.number}
                      onChange={(event) => updateBoxNumber(box.id, event.target.value)}
                    />
                  </fieldset>

                  <button
                    type="button"
                    className="btn btn-error btn-outline"
                    onClick={() => removeBox(box.id)}
                  >
                    Delete Box
                  </button>
                </div>

                <div className="divider my-1">Items</div>

                {box.items.length === 0 ? (
                  <p className="text-sm text-base-content/70">No items in this box yet.</p>
                ) : (
                  <ul className="list rounded-box bg-base-200">
                    {box.items.map((item, index) => (
                      <li
                        key={`${box.id}-${item}-${index}`}
                        className="list-row flex items-center justify-between gap-3"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost"
                          onClick={() => removeItemFromBox(box.id, index)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="join w-full">
                  <input
                    className="input input-bordered join-item w-full"
                    placeholder="Add an item"
                    value={newItemByBox[box.id] ?? ''}
                    onChange={(event) =>
                      setNewItemByBox((current) => ({
                        ...current,
                        [box.id]: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-secondary join-item"
                    onClick={() => addItemToBox(box.id)}
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

export default App
