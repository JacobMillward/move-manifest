import type { Box } from './boxes'

const LABEL_COLUMN_WIDTH_CM = 6

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function splitItemsIntoColumns(items: string[], maxWidthCm: number): string[][] {
  const safeItems = items.length > 0 ? items : ['']
  const maxColumns = Math.max(1, Math.floor(maxWidthCm / LABEL_COLUMN_WIDTH_CM))
  const rows = Math.max(1, Math.ceil(safeItems.length / maxColumns))
  const columns: string[][] = Array.from({ length: maxColumns }, () => [])

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < maxColumns; columnIndex += 1) {
      const itemIndex = rowIndex * maxColumns + columnIndex
      const value = safeItems[itemIndex] ?? ''
      columns[columnIndex].push(value)
    }
  }

  return columns
}

export function buildPrintableLabelsHtml(boxes: Box[], maxWidthCm: number): string {
  const labelsHtml = boxes
    .map((box) => {
      const columns = splitItemsIntoColumns(box.items, maxWidthCm)
      const maxRowsPerColumn = columns.reduce(
        (maximum, columnItems) => Math.max(maximum, columnItems.length),
        0,
      )

      const headerCells = columns
        .map((_, columnIndex) => {
          if (columnIndex > 0) {
            return '<th></th>'
          }

          const room = box.room || 'Unassigned room'
          return `<th>Box ${box.number} • ${escapeHtml(room)}</th>`
        })
        .join('')

      const bodyRows = Array.from({ length: maxRowsPerColumn }, (_, rowIndex) => {
        const rowCells = columns
          .map((columnItems) => `<td>${escapeHtml(columnItems[rowIndex] ?? '')}</td>`)
          .join('')

        return `<tr>${rowCells}</tr>`
      }).join('')

      return `
        <section class="label-group">
          <table class="label-table" style="max-width:${maxWidthCm}cm">
            <thead>
              <tr>${headerCells}</tr>
            </thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </section>
      `
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
            display: block;
            width: fit-content;
          }

          .label-table {
            border-collapse: collapse;
            table-layout: fixed;
            page-break-inside: avoid;
          }

          .label-table th,
          .label-table td {
            border: 1px solid #000;
            padding: 3mm 2.5mm;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: break-word;
            font-size: 12px;
            line-height: 1.2;
            width: 60mm;
          }

          .label-table th {
            text-align: left;
            font-size: 13px;
            font-weight: 600;
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
