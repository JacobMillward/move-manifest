import { LockKeyhole } from 'lucide-react'
import { useRef } from 'react'
import type { ChangeEvent } from 'react'

type OverviewCardProps = {
  boxesCount: number
  totalItems: number
  statusMessage: string
  onExportCsv: () => void
  onImportCsv: (file: File) => Promise<void>
}

function OverviewCard({
  boxesCount,
  totalItems,
  statusMessage,
  onExportCsv,
  onImportCsv,
}: OverviewCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    await onImportCsv(selectedFile)
    event.target.value = ''
  }

  return (
    <section className="card bg-base-100 shadow">
      <div className="card-body gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="card-title text-2xl">Moving Box Tracker</h1>
            <p className="text-sm text-base-content/70">
              Keep a list of boxes, room assignments, and items while moving.
            </p>
          </div>
        </div>
        <div className="alert alert-success py-2 text-sm flex">
          <LockKeyhole className="w-4 h-4 mr-1" />
          <span>All data is stored locally on your device and never sent to a server.</span>
        </div>

        <div className="stats stats-vertical bg-base-200 md:stats-horizontal">
          <div className="stat py-3">
            <div className="stat-title">Boxes</div>
            <div className="stat-value text-primary">{boxesCount}</div>
          </div>
          <div className="stat py-3">
            <div className="stat-title">Items</div>
            <div className="stat-value text-secondary">{totalItems}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={onExportCsv}>
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Import CSV
          </button>
          <a href="/manifest" className="btn btn-ghost">
            Generate Manifest
          </a>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".csv,text/csv"
            onChange={handleImportChange}
          />
        </div>

        {statusMessage ? <div className="alert alert-info py-2 text-sm">{statusMessage}</div> : null}
      </div>
    </section>
  )
}

export default OverviewCard
