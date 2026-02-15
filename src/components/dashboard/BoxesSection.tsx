import { useState } from 'react'
import type { Box } from '../../lib/boxes'
import RoomInput from '../shared/RoomInput'

type ActionResult = {
  success: boolean
  message: string
}

type BoxesSectionProps = {
  boxes: Box[]
  rooms: string[]
  onStatusMessage: (message: string) => void
  onUpdateBoxRoom: (boxId: string, room: string) => void
  onUpdateBoxNumber: (boxId: string, nextNumberText: string) => ActionResult
  onRemoveBox: (boxId: string) => ActionResult
  onRemoveItemFromBox: (boxId: string, itemIndex: number) => ActionResult
  onAddItemToBox: (boxId: string, itemText: string) => ActionResult
}

function BoxesSection({
  boxes,
  rooms,
  onStatusMessage,
  onUpdateBoxRoom,
  onUpdateBoxNumber,
  onRemoveBox,
  onRemoveItemFromBox,
  onAddItemToBox,
}: BoxesSectionProps) {
  const [newItemByBox, setNewItemByBox] = useState<Record<string, string>>({})

  const handleUpdateNumber = (boxId: string, nextNumberText: string) => {
    const result = onUpdateBoxNumber(boxId, nextNumberText)
    if (result.message) {
      onStatusMessage(result.message)
    }
  }

  const handleRemoveBox = (boxId: string) => {
    const result = onRemoveBox(boxId)
    if (result.message) {
      onStatusMessage(result.message)
    }
  }

  const handleRemoveItem = (boxId: string, itemIndex: number) => {
    const result = onRemoveItemFromBox(boxId, itemIndex)
    if (result.message) {
      onStatusMessage(result.message)
    }
  }

  const handleAddItem = (boxId: string) => {
    const result = onAddItemToBox(boxId, newItemByBox[boxId] ?? '')
    if (result.message) {
      onStatusMessage(result.message)
    }
    if (result.success) {
      setNewItemByBox((current) => ({ ...current, [boxId]: '' }))
    }
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {boxes.map((box) => (
        <article key={box.id} className="card bg-base-100 shadow flex flex-col">
          <div className="card-body flex flex-col gap-3 p-4">
            {/* Header: Box <number input> [Delete] */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Box</span>
              <input
                className="input input-bordered input-sm w-20 text-center"
                type="number"
                min={1}
                title="Box number"
                value={box.number}
                onChange={(event) => handleUpdateNumber(box.id, event.target.value)}
              />
              <div className="flex-1" />
              <button
                type="button"
                className="btn btn-error btn-outline btn-xs"
                onClick={() => handleRemoveBox(box.id)}
              >
                Delete
              </button>
            </div>
            {/* Room */}
            <RoomInput
              value={box.room}
              rooms={rooms}
              onChange={(room) => onUpdateBoxRoom(box.id, room)}
            />

            {/* Scrollable items list */}
            <div className="flex-1 overflow-hidden">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                Contents ({box.items.length})
              </p>
              {box.items.length === 0 ? (
                <p className="py-2 text-sm text-base-content/50">No items yet.</p>
              ) : (
                <ul className="max-h-48 overflow-y-auto rounded-box bg-base-200 text-sm">
                  {box.items.map((item, index) => (
                    <li
                      key={`${box.id}-${item}-${index}`}
                      className="flex items-center justify-between gap-2 border-b border-base-300 px-3 py-1.5 last:border-b-0"
                    >
                      <span className="min-w-0 break-words">{item}</span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs shrink-0"
                        onClick={() => handleRemoveItem(box.id, index)}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add item */}
            <div className="join w-full">
              <input
                className="input input-bordered input-sm join-item w-full"
                placeholder="Add an item"
                value={newItemByBox[box.id] ?? ''}
                onChange={(event) =>
                  setNewItemByBox((current) => ({
                    ...current,
                    [box.id]: event.target.value,
                  }))
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleAddItem(box.id)
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm join-item"
                onClick={() => handleAddItem(box.id)}
              >
                Add
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}

export default BoxesSection
