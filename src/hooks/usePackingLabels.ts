import { useMemo, useState } from 'react'
import type { Box } from '../lib/boxes'
import { buildPrintableLabelsHtml } from '../lib/labels'

type GenerateLabelsResult = {
  success: boolean
  message: string
}

function usePackingLabels(boxes: Box[]) {
  const [activeTab, setActiveTab] = useState<'add-box' | 'packing-labels'>('add-box')
  const [labelsMaxHeightCm, setLabelsMaxHeightCm] = useState('7')
  const [excludedLabelBoxIds, setExcludedLabelBoxIds] = useState<string[]>([])

  const selectedLabelBoxes = useMemo(
    () => boxes.filter((box) => !excludedLabelBoxIds.includes(box.id)),
    [boxes, excludedLabelBoxIds],
  )

  const toggleLabelBoxSelection = (boxId: string) => {
    setExcludedLabelBoxIds((current) => {
      if (current.includes(boxId)) {
        return current.filter((excludedId) => excludedId !== boxId)
      }

      return [...current, boxId]
    })
  }

  const selectAllLabelBoxes = () => {
    setExcludedLabelBoxIds([])
  }

  const clearAllLabelBoxes = () => {
    setExcludedLabelBoxIds(boxes.map((box) => box.id))
  }

  const generatePackingLabels = (): GenerateLabelsResult => {
    const parsedHeight = Number(labelsMaxHeightCm)

    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      return {
        success: false,
        message: 'Max height must be a positive number in centimeters.',
      }
    }

    if (selectedLabelBoxes.length === 0) {
      return {
        success: false,
        message: 'Select at least one box to generate labels.',
      }
    }

    const html = buildPrintableLabelsHtml(selectedLabelBoxes, parsedHeight)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const printWindow = window.open(url, '_blank')

    if (!printWindow) {
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.click()
    }

    if (!printWindow) {
      URL.revokeObjectURL(url)
      return {
        success: false,
        message: 'Unable to open print window. Allow pop-ups and try again.',
      }
    }

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 60_000)

    return {
      success: true,
      message: `Generated ${selectedLabelBoxes.length} packing labels.`,
    }
  }

  return {
    activeTab,
    labelsMaxHeightCm,
    excludedLabelBoxIds,
    setActiveTab,
    setLabelsMaxHeightCm,
    toggleLabelBoxSelection,
    selectAllLabelBoxes,
    clearAllLabelBoxes,
    generatePackingLabels,
  }
}

export default usePackingLabels
