import { useMemo, useState } from 'react'
import { buildPrintableLabelsMarkup, chooseOrientation, PRINT_LABELS_CSS } from '../lib/labels'
import { loadBoxes } from '../lib/storage'

const LABEL_WIDTH_KEY = 'moving-helper-label-width'

function parseSearchParams(): { width: number; boxIds: string[] } {
  const params = new URLSearchParams(window.location.search)
  const width = Number(params.get('width')) || Number(localStorage.getItem(LABEL_WIDTH_KEY)) || 15
  const idsParam = params.get('ids') || ''
  const boxIds = idsParam ? idsParam.split(',') : []
  return { width, boxIds }
}

function PrintLabelsPage() {
  const initialParams = useMemo(() => parseSearchParams(), [])
  const allBoxes = useMemo(() => loadBoxes(), [])

  const [widthInput, setWidthInput] = useState(String(initialParams.width))
  const [excludedIds, setExcludedIds] = useState<string[]>(() => {
    if (initialParams.boxIds.length === 0) return []
    return allBoxes
      .filter((box) => !initialParams.boxIds.includes(box.id))
      .map((box) => box.id)
  })
  const [showSettings, setShowSettings] = useState(false)

  const width = Number(widthInput) || 15

  const updateWidth = (value: string) => {
    setWidthInput(value)
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) {
      localStorage.setItem(LABEL_WIDTH_KEY, value)
    }
  }

  const boxes = useMemo(
    () => allBoxes.filter((box) => !excludedIds.includes(box.id)),
    [allBoxes, excludedIds],
  )

  const markup = useMemo(
    () => buildPrintableLabelsMarkup(boxes, width),
    [boxes, width],
  )

  const orientation = useMemo(
    () => chooseOrientation(boxes, width),
    [boxes, width],
  )

  const settingsCss = `
    .settings-panel {
      padding: 8px 10mm;
      border-bottom: 1px solid #ddd;
      background: #fafafa;
      font-family: Arial, sans-serif;
      font-size: 13px;
    }
    .settings-panel label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-right: 12px;
      cursor: pointer;
    }
    .settings-panel input[type="number"] {
      width: 60px;
      padding: 2px 4px;
      border: 1px solid #999;
      font-size: 13px;
    }
    .settings-panel input[type="checkbox"] {
      cursor: pointer;
    }
    .settings-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 0;
      margin-top: 6px;
    }
    @media print {
      .settings-panel { display: none; }
    }
  `

  const pageCss = `@page { size: A4 ${orientation}; }\n${PRINT_LABELS_CSS}\n${settingsCss}`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageCss }} />
      <div className="toolbar">
        <a href="/" style={{ marginRight: 'auto', textDecoration: 'none', color: '#333', alignSelf: 'center' }}>
          &larr; Back
        </a>
        <button
          type="button"
          onClick={() => setShowSettings((s) => !s)}
          style={{ marginRight: 8 }}
        >
          {showSettings ? 'Hide Settings' : 'Settings'}
        </button>
        <button type="button" onClick={() => window.print()}>Print Labels</button>
      </div>
      {showSettings && (
        <div className="settings-panel">
          <div>
            <strong>Label width (cm):</strong>{' '}
            <input
              type="number"
              min={1}
              step={0.5}
              value={widthInput}
              onChange={(e) => updateWidth(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 6 }}>
            <strong>Boxes:</strong>{' '}
            <button
              type="button"
              onClick={() => setExcludedIds([])}
              style={{ fontSize: 12, marginRight: 6, cursor: 'pointer' }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setExcludedIds(allBoxes.map((b) => b.id))}
              style={{ fontSize: 12, cursor: 'pointer' }}
            >
              None
            </button>
          </div>
          <div className="settings-row">
            {allBoxes.map((box) => {
              const included = !excludedIds.includes(box.id)
              return (
                <label key={box.id}>
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
                  />
                  Box {box.number}{box.room ? ` · ${box.room}` : ''}
                </label>
              )
            })}
          </div>
        </div>
      )}
      {boxes.length === 0 ? (
        <main style={{ padding: '10mm', fontFamily: 'Arial, sans-serif' }}>
          <p>No boxes selected. Use Settings to include boxes.</p>
        </main>
      ) : (
        <main className="sheet" dangerouslySetInnerHTML={{ __html: markup }} />
      )}
    </>
  )
}

export default PrintLabelsPage
