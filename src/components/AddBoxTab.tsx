import { useEffect, useState } from 'react'

type AddBoxSubmitResult = {
  success: boolean
  message: string
  nextSuggestedNumber: number
}

type AddBoxTabProps = {
  nextSuggestedNumber: number
  onAddBox: (input: {
    room: string
    numberInput: string
    itemsInput: string
  }) => AddBoxSubmitResult
  onStatusMessage: (message: string) => void
}

function AddBoxTab({
  nextSuggestedNumber,
  onAddBox,
  onStatusMessage,
}: AddBoxTabProps) {
  const [roomInput, setRoomInput] = useState('')
  const [numberInput, setNumberInput] = useState(String(nextSuggestedNumber))
  const [itemsInput, setItemsInput] = useState('')

  useEffect(() => {
    setNumberInput(String(nextSuggestedNumber))
  }, [nextSuggestedNumber])

  const handleSubmit = () => {
    const result = onAddBox({
      room: roomInput,
      numberInput,
      itemsInput,
    })

    onStatusMessage(result.message)

    if (result.success) {
      setRoomInput('')
      setItemsInput('')
      setNumberInput(String(result.nextSuggestedNumber))
    }
  }

  return (
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
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          Add Box
        </button>
      </div>
    </>
  )
}

export default AddBoxTab
