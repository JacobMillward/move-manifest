import { useMemo } from 'react'
import { buildPrintableLabelsMarkup, PRINT_LABELS_CSS } from '../lib/labels'
import { loadBoxes } from '../lib/storage'

function parseSearchParams(): { width: number; boxIds: string[] } {
  const params = new URLSearchParams(window.location.search)
  const width = Number(params.get('width')) || 15
  const idsParam = params.get('ids') || ''
  const boxIds = idsParam ? idsParam.split(',') : []
  return { width, boxIds }
}

function PrintLabelsPage() {
  const { width, boxIds } = useMemo(() => parseSearchParams(), [])

  const boxes = useMemo(() => {
    const allBoxes = loadBoxes()
    if (boxIds.length === 0) return allBoxes
    return allBoxes.filter((box) => boxIds.includes(box.id))
  }, [boxIds])

  const markup = useMemo(
    () => buildPrintableLabelsMarkup(boxes, width),
    [boxes, width],
  )

  if (boxes.length === 0) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: PRINT_LABELS_CSS }} />
        <div className="toolbar">
          <a href="/" style={{ marginRight: 'auto', textDecoration: 'none', color: '#333', alignSelf: 'center' }}>
            &larr; Back
          </a>
        </div>
        <main style={{ padding: '10mm', fontFamily: 'Arial, sans-serif' }}>
          <p>No boxes found. Go back and add some boxes first.</p>
        </main>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_LABELS_CSS }} />
      <div className="toolbar">
        <a href="/" style={{ marginRight: 'auto', textDecoration: 'none', color: '#333', alignSelf: 'center' }}>
          &larr; Back
        </a>
        <button type="button" onClick={() => window.print()}>Print Labels</button>
      </div>
      <main className="sheet" dangerouslySetInnerHTML={{ __html: markup }} />
    </>
  )
}

export default PrintLabelsPage
