import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import OverviewCard from '../src/components/dashboard/OverviewCard'

describe('OverviewCard', () => {
  it('renders stats and triggers CSV export', async () => {
    const onExportCsv = vi.fn()
    const onImportCsv = vi.fn()

    render(
      <OverviewCard
        boxesCount={3}
        totalItems={7}
        statusMessage="Saved."
        onExportCsv={onExportCsv}
        onImportCsv={onImportCsv}
      />,
    )

    expect(screen.getByText('Boxes')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Items')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Saved.')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /export csv/i }))

    expect(onExportCsv).toHaveBeenCalledTimes(1)
  })

  it('imports CSV files via the hidden input', async () => {
    const onExportCsv = vi.fn()
    const onImportCsv = vi.fn().mockResolvedValue(undefined)

    const { container } = render(
      <OverviewCard
        boxesCount={0}
        totalItems={0}
        statusMessage=""
        onExportCsv={onExportCsv}
        onImportCsv={onImportCsv}
      />,
    )

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['number,room,item'], 'boxes.csv', { type: 'text/csv' })

    const user = userEvent.setup()
    await user.upload(fileInput, file)

    expect(onImportCsv).toHaveBeenCalledWith(file)
  })
})
