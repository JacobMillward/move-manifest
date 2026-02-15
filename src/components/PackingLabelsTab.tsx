import type { Box } from '../lib/boxes'

type PackingLabelsTabProps = {
  boxes: Box[]
  labelsMaxHeightCm: string
  excludedLabelBoxIds: string[]
  onLabelsMaxHeightCmChange: (value: string) => void
  onSelectAllLabelBoxes: () => void
  onClearAllLabelBoxes: () => void
  onToggleLabelBoxSelection: (boxId: string) => void
  onGeneratePackingLabels: () => void
}

function PackingLabelsTab({
  boxes,
  labelsMaxHeightCm,
  excludedLabelBoxIds,
  onLabelsMaxHeightCmChange,
  onSelectAllLabelBoxes,
  onClearAllLabelBoxes,
  onToggleLabelBoxSelection,
  onGeneratePackingLabels,
}: PackingLabelsTabProps) {
  return (
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
            onChange={(event) => onLabelsMaxHeightCmChange(event.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">Boxes to include</legend>
          <div className="mb-2 flex flex-wrap gap-2">
            <button type="button" className="btn btn-sm btn-outline" onClick={onSelectAllLabelBoxes}>
              Select All
            </button>
            <button type="button" className="btn btn-sm btn-outline" onClick={onClearAllLabelBoxes}>
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
                      onChange={() => onToggleLabelBoxSelection(box.id)}
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
        <button type="button" className="btn btn-primary" onClick={onGeneratePackingLabels}>
          Generate Labels
        </button>
      </div>
    </>
  )
}

export default PackingLabelsTab
