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
    size: A4 portrait;
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
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Packing Labels</title>
        <style>${PRINT_LABELS_CSS}</style>
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
