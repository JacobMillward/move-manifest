import { useEffect, useMemo, useState } from 'react'
import { parseAsFloat, useQueryState } from 'nuqs'
import { chooseOrientation } from '../../lib/labels'
import type { Box } from '../../lib/boxes'
import { loadBoxes } from '../../lib/storage'

const LABEL_WIDTH_KEY = 'move-manifest-label-width'

function parseSearchParams(): { boxIds: string[] } {
  const params = new URLSearchParams(window.location.search)
  const idsParam = params.get('ids') || ''
  const boxIds = idsParam ? idsParam.split(',') : []
  return { boxIds }
}

function Label({ box, widthCm }: { box: Box; widthCm: number }) {
  const items = box.items.length > 0 ? box.items : ['']
  const room = box.room || 'Unassigned room'

  return (
    <article
      className="border border-base-300"
      style={{ width: `${widthCm}cm`, maxWidth: `${widthCm}cm`, flexShrink: 0 }}
    >
      <div className="p-3 bg-neutral text-white">
        <div className="flex justify-between items-baseline gap-1">
          <span className="text-lg font-bold">BOX {box.number}</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-right">{room}</span>
        </div>
      </div>
      <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-gray-200">
        Contents
      </div>
      <ul className="list-none">
        {items.map((item, idx) => (
          <li key={idx} className="px-3 py-1.3 text-xs leading-tight border-b border-gray-300 last:border-b-0">
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}

function PrintLabelsPage() {
  const initialParams = useMemo(() => parseSearchParams(), [])
  const allBoxes = useMemo(() => loadBoxes(), [])
  const defaultWidth = useMemo(() => {
    const stored = Number(localStorage.getItem(LABEL_WIDTH_KEY))
    return Number.isFinite(stored) && stored > 0 ? stored : 15
  }, [])
  const [widthParam, setWidthParam] = useQueryState(
    'width',
    parseAsFloat.withDefault(defaultWidth),
  )

  const [widthInput, setWidthInput] = useState(() => String(widthParam))
  const [excludedIds, setExcludedIds] = useState<string[]>(() => {
    if (initialParams.boxIds.length === 0) return []
    return allBoxes
      .filter((box) => !initialParams.boxIds.includes(box.id))
      .map((box) => box.id)
  })
  const [showSettings, setShowSettings] = useState(false)

  const width = widthParam

  const updateWidth = (value: string) => {
    setWidthInput(value)
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) {
      localStorage.setItem(LABEL_WIDTH_KEY, String(parsed))
      void setWidthParam(parsed)
    }
  }

  useEffect(() => {
    setWidthInput(String(widthParam))
  }, [widthParam])

  const boxes = useMemo(
    () => allBoxes.filter((box) => !excludedIds.includes(box.id)),
    [allBoxes, excludedIds],
  )

  const orientation = useMemo(
    () => chooseOrientation(boxes, width),
    [boxes, width],
  )

  const settingsCss = `
    @page {
      margin: 0;
      size: A4 ${orientation};
    }

    .sheet {
      display: flex;
      flex-wrap: wrap;
      gap: 6mm;
      padding: 10mm;
      align-items: flex-start;
      align-content: flex-start;
    }

    article {
      page-break-inside: avoid;
    }

    @media print {
      .navbar {
        display: none;
      }

      .settings-section {
        display: none;
      }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: settingsCss }} />
      
      <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-10">
        <div className="flex-1">
          <a href="/" className="btn btn-ghost btn-sm gap-2">
            ← Back
          </a>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings((s) => !s)}
          className="btn btn-ghost btn-sm gap-2"
        >
          ⚙️ {showSettings ? 'Hide' : 'Settings'}
        </button>
        <button 
          type="button" 
          onClick={() => window.print()} 
          disabled={boxes.length === 0}
          className="btn btn-ghost btn-sm gap-2"
        >
          🖨️ Print Labels
        </button>
      </div>

      {showSettings && (
        <div className="settings-section bg-base-200 border-b border-base-300 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text font-semibold">Label width (cm):</span>
              </label>
              <input
                type="number"
                min={1}
                step={0.5}
                value={widthInput}
                onChange={(e) => updateWidth(e.target.value)}
                className="input input-bordered input-sm w-full max-w-xs"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Boxes:</span>
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setExcludedIds([])}
                  className="btn btn-sm btn-ghost"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setExcludedIds(allBoxes.map((b) => b.id))}
                  className="btn btn-sm btn-ghost"
                >
                  None
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {allBoxes.map((box) => {
                const included = !excludedIds.includes(box.id)
                return (
                  <label key={box.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={included}
                      onChange={() =>
                        setExcludedIds((prev) =>
                          included
                            ? [...prev, box.id]
                            : prev.filter((id) => id !== box.id),
                        )
                      }
                      className="checkbox checkbox-sm"
                    />
                    <span className="text-sm">Box {box.number}{box.room ? ` · ${box.room}` : ''}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {boxes.length === 0 ? (
        <main className="p-8">
          <div className="alert alert-info">
            <span>No boxes selected. Use Settings to include boxes.</span>
          </div>
        </main>
      ) : (
        <main className="sheet">
          {boxes.map((box) => (
            <Label key={box.id} box={box} widthCm={width} />
          ))}
        </main>
      )}
    </>
  )
}

export default PrintLabelsPage
