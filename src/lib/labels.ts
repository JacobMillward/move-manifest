import type { Box } from './boxes'

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
