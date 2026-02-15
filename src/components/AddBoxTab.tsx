type AddBoxTabProps = {
  roomInput: string
  numberInput: string
  itemsInput: string
  onRoomInputChange: (value: string) => void
  onNumberInputChange: (value: string) => void
  onItemsInputChange: (value: string) => void
  onAddBox: () => void
}

function AddBoxTab({
  roomInput,
  numberInput,
  itemsInput,
  onRoomInputChange,
  onNumberInputChange,
  onItemsInputChange,
  onAddBox,
}: AddBoxTabProps) {
  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
        <fieldset className="fieldset w-full md:flex-1">
          <legend className="fieldset-legend">Room</legend>
          <input
            className="input input-bordered w-full"
            placeholder="Kitchen"
            value={roomInput}
            onChange={(event) => onRoomInputChange(event.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset w-full md:w-40">
          <legend className="fieldset-legend">Number</legend>
          <input
            className="input input-bordered w-full"
            type="number"
            min={1}
            value={numberInput}
            onChange={(event) => onNumberInputChange(event.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">Items (one per line)</legend>
          <textarea
            className="textarea textarea-bordered"
            value={itemsInput}
            onChange={(event) => onItemsInputChange(event.target.value)}
            placeholder={'Plates\nCups\nPans'}
          />
        </fieldset>
      </div>

      <div className="card-actions justify-end">
        <button type="button" className="btn btn-primary" onClick={onAddBox}>
          Add Box
        </button>
      </div>
    </>
  )
}

export default AddBoxTab
