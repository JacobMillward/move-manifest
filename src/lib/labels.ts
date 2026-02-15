import type { Box } from './boxes'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export const PRINT_LABELS_CSS = `
  @page {
    margin: 0;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
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
    z-index: 10;
  }

  .toolbar button {
    border: 1px solid #333;
    padding: 6px 16px;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
  }

  .sheet {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 6mm;
    padding: 10mm;
  }

  .label {
    break-inside: avoid;
    page-break-inside: avoid;
    border: 2px solid #000;
    flex-shrink: 0;
  }

  .label-header {
    background: #000;
    color: #fff;
    padding: 2mm 3mm;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 4mm;
  }

  .label-box-number {
    font-size: 18px;
    font-weight: 700;
    white-space: nowrap;
  }

  .label-room {
    font-size: 13px;
    font-weight: 600;
    text-align: right;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .label-heading {
    background: #eee;
    padding: 1.5mm 3mm;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
  }

  .label-items {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .label-items li {
    padding: 1.2mm 3mm;
    font-size: 11px;
    line-height: 1.3;
    border-bottom: 1px solid #ccc;
  }

  .label-items li:last-child {
    border-bottom: none;
  }

  @media print {
    .toolbar {
      display: none;
    }

    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`

// A4 dimensions in mm
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const SHEET_PADDING_MM = 10
const LABEL_GAP_MM = 6

// Estimated label component heights in mm
const LABEL_HEADER_HEIGHT_MM = 9
const LABEL_SUBHEADING_HEIGHT_MM = 6
const LABEL_ITEM_HEIGHT_MM = 6
const LABEL_BORDER_HEIGHT_MM = 1.5

function estimateLabelHeightMm(itemCount: number): number {
  const items = Math.max(itemCount, 1)
  return LABEL_HEADER_HEIGHT_MM + LABEL_SUBHEADING_HEIGHT_MM + items * LABEL_ITEM_HEIGHT_MM + LABEL_BORDER_HEIGHT_MM
}

function fitsOnOnePage(
  boxes: Box[],
  labelWidthMm: number,
  pageWidthMm: number,
  pageHeightMm: number,
): boolean {
  const usableWidth = pageWidthMm - SHEET_PADDING_MM * 2
  const usableHeight = pageHeightMm - SHEET_PADDING_MM * 2

  const heights = boxes.map((box) => estimateLabelHeightMm(box.items.length))

  let rowMaxHeight = 0
  let rowX = 0
  let totalHeight = 0

  for (const height of heights) {
    if (rowX > 0 && rowX + LABEL_GAP_MM + labelWidthMm > usableWidth) {
      // Wrap to next row
      totalHeight += rowMaxHeight + LABEL_GAP_MM
      rowX = 0
      rowMaxHeight = 0
    }

    rowX += (rowX > 0 ? LABEL_GAP_MM : 0) + labelWidthMm
    rowMaxHeight = Math.max(rowMaxHeight, height)
  }

  totalHeight += rowMaxHeight

  return totalHeight <= usableHeight
}

export function chooseOrientation(boxes: Box[], labelWidthCm: number): 'portrait' | 'landscape' {
  const labelWidthMm = labelWidthCm * 10

  const fitsLandscape = fitsOnOnePage(boxes, labelWidthMm, A4_HEIGHT_MM, A4_WIDTH_MM)

  if (fitsLandscape) {
    return 'landscape'
  }

  return 'portrait'
}

export function buildPrintableLabelsMarkup(boxes: Box[], maxWidthCm: number): string {
  return boxes
    .map((box) => {
      const safeItems = box.items.length > 0 ? box.items : ['']
      const room = box.room || 'Unassigned room'

      const itemsList = safeItems
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join('')

      return `<article class="label" style="width:${maxWidthCm}cm; max-width:${maxWidthCm}cm;"><div class="label-header"><span class="label-box-number">BOX ${box.number}</span><span class="label-room">${escapeHtml(room)}</span></div><div class="label-heading">Contents</div><ul class="label-items">${itemsList}</ul></article>`
    })
    .join('')
}

export function buildPrintableLabelsHtml(boxes: Box[], maxWidthCm: number): string {
  const orientation = chooseOrientation(boxes, maxWidthCm)
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Packing Labels</title>
        <style>@page { size: A4 ${orientation}; }\n${PRINT_LABELS_CSS}</style>
      </head>
      <body>
        <div class="toolbar">
          <button onclick="window.print()">Print Labels</button>
        </div>
        <main class="sheet">${buildPrintableLabelsMarkup(boxes, maxWidthCm)}</main>
      </body>
    </html>
  `
}
