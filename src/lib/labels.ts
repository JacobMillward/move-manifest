import type { Box } from './boxes'

const LABEL_HEADER_HEIGHT_CM = 1.6
const LABEL_ROW_HEIGHT_CM = 0.62

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function splitItemsIntoColumns(items: string[], maxHeightCm: number): string[][] {
  const safeItems = items.length > 0 ? items : ['']
  const availableHeight = Math.max(maxHeightCm - LABEL_HEADER_HEIGHT_CM, LABEL_ROW_HEIGHT_CM)
  const maxRowsPerColumn = Math.max(1, Math.floor(availableHeight / LABEL_ROW_HEIGHT_CM))
  const columns: string[][] = []

  for (let index = 0; index < safeItems.length; index += maxRowsPerColumn) {
    columns.push(safeItems.slice(index, index + maxRowsPerColumn))
  }

  return columns
}

export function buildPrintableLabelsHtml(boxes: Box[], maxHeightCm: number): string {
  const labelsHtml = boxes
    .map((box) => {
      const columns = splitItemsIntoColumns(box.items, maxHeightCm)
      const columnTables = columns
        .map((columnItems, columnIndex) => {
          const title = columnIndex === 0 ? `Box ${box.number}` : `Box ${box.number} (cont.)`
          const rows = columnItems
            .map((item) => `<tr><td>${escapeHtml(item)}</td></tr>`)
            .join('')

          return `
            <table class="label-column" style="max-height:${maxHeightCm}cm">
              <thead>
                <tr><th>${escapeHtml(title)}</th></tr>
                <tr><th class="room">${escapeHtml(box.room || 'Unassigned room')}</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          `
        })
        .join('')

      return `<section class="label-group">${columnTables}</section>`
    })
    .join('')

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Packing Labels</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Arial, sans-serif;
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
          }

          .toolbar button {
            border: 1px solid #333;
            padding: 6px 10px;
            background: #fff;
            cursor: pointer;
          }

          .sheet {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
            gap: 5mm;
            padding: 10mm;
          }

          .label-group {
            display: flex;
            gap: 3mm;
            align-items: flex-start;
            width: fit-content;
          }

          .label-column {
            width: 60mm;
            border-collapse: collapse;
            table-layout: fixed;
            page-break-inside: avoid;
          }

          .label-column th,
          .label-column td {
            border: 1px solid #000;
            padding: 3mm 2.5mm;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: break-word;
            font-size: 12px;
            line-height: 1.2;
          }

          .label-column th {
            text-align: left;
            font-size: 13px;
          }

          .label-column th.room {
            font-weight: normal;
          }

          @media print {
            .toolbar {
              display: none;
            }

            .sheet {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <button onclick="window.print()">Print Labels</button>
        </div>
        <main class="sheet">${labelsHtml}</main>
      </body>
    </html>
  `
}
