import type { Box } from './boxes'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function buildPrintableLabelsHtml(boxes: Box[], maxWidthCm: number): string {
  const labelsHtml = boxes
    .map((box) => {
      const safeItems = box.items.length > 0 ? box.items : ['']
      const room = box.room || 'Unassigned room'

      const bodyRows = safeItems
        .map((item) => `<tr><td>${escapeHtml(item)}</td></tr>`)
        .join('')

      return `
        <section class="label-group">
          <table class="label-table" style="width:${maxWidthCm}cm; max-width:${maxWidthCm}cm;">
            <thead>
              <tr><th>Box ${box.number} • ${escapeHtml(room)}</th></tr>
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
