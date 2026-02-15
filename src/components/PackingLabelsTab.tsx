import { useMemo, useState } from 'react'
import type { Box } from '../lib/boxes'

type PackingLabelsTabProps = {
  boxes: Box[]
  onStatusMessage: (message: string) => void
}

function PackingLabelsTab({
  boxes,
  onStatusMessage,
}: PackingLabelsTabProps) {
  const LABEL_WIDTH_KEY = 'move-manifest-label-width'

  const [labelsMaxWidthCm, setLabelsMaxWidthCm] = useState(
    () => localStorage.getItem(LABEL_WIDTH_KEY) || '15',
  )

  const updateLabelsMaxWidthCm = (value: string) => {
    setLabelsMaxWidthCm(value)
    localStorage.setItem(LABEL_WIDTH_KEY, value)
  }
  const [excludedLabelBoxIds, setExcludedLabelBoxIds] = useState<string[]>([])

  const selectedLabelBoxes = useMemo(
    () => boxes.filter((box) => !excludedLabelBoxIds.includes(box.id)),
    [boxes, excludedLabelBoxIds],
  )

  const selectAllLabelBoxes = () => {
    setExcludedLabelBoxIds([])
  }

  const clearAllLabelBoxes = () => {
    setExcludedLabelBoxIds(boxes.map((box) => box.id))
  }

  const toggleLabelBoxSelection = (boxId: string) => {
    setExcludedLabelBoxIds((current) => {
      if (current.includes(boxId)) {
        return current.filter((excludedId) => excludedId !== boxId)
      }

      return [...current, boxId]
    })
  }

  const generatePackingLabels = () => {
    const parsedWidth = Number(labelsMaxWidthCm)

    if (!Number.isFinite(parsedWidth) || parsedWidth <= 0) {
      onStatusMessage('Max width must be a positive number in centimeters.')
      return
    }

    if (selectedLabelBoxes.length === 0) {
      onStatusMessage('Select at least one box to generate labels.')
      return
    }

    const ids = selectedLabelBoxes.map((box) => box.id).join(',')
    window.location.href = `/labels?width=${parsedWidth}&ids=${ids}`
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <fieldset className="fieldset max-w-xs">
          <legend className="fieldset-legend">Max Width (cm)</legend>
          <input
            className="input input-bordered"
            type="number"
            min={0.5}
            step={0.1}
            value={labelsMaxWidthCm}
            onChange={(event) => updateLabelsMaxWidthCm(event.target.value)}
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
  )
}

export default PackingLabelsTab
