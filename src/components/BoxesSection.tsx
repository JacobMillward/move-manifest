import type { Box } from '../lib/boxes'

type BoxesSectionProps = {
  boxes: Box[]
  newItemByBox: Record<string, string>
  onUpdateBoxRoom: (boxId: string, room: string) => void
  onUpdateBoxNumber: (boxId: string, nextNumberText: string) => void
  onRemoveBox: (boxId: string) => void
  onRemoveItemFromBox: (boxId: string, itemIndex: number) => void
  onSetNewItemByBox: (boxId: string, value: string) => void
  onAddItemToBox: (boxId: string) => void
}

function BoxesSection({
  boxes,
  newItemByBox,
  onUpdateBoxRoom,
  onUpdateBoxNumber,
  onRemoveBox,
  onRemoveItemFromBox,
  onSetNewItemByBox,
  onAddItemToBox,
}: BoxesSectionProps) {
  return (
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
                  onChange={(event) => onUpdateBoxRoom(box.id, event.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset md:w-32">
                <legend className="fieldset-legend">Number</legend>
                <input
                  className="input input-bordered"
                  type="number"
                  min={1}
                  value={box.number}
                  onChange={(event) => onUpdateBoxNumber(box.id, event.target.value)}
                />
              </fieldset>

              <button
                type="button"
                className="btn btn-error btn-outline"
                onClick={() => onRemoveBox(box.id)}
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
                      onClick={() => onRemoveItemFromBox(box.id, index)}
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
                onChange={(event) => onSetNewItemByBox(box.id, event.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary join-item"
                onClick={() => onAddItemToBox(box.id)}
              >
                Add Item
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}

export default BoxesSection
