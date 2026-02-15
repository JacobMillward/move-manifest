import type { ChangeEvent, RefObject } from 'react'

type OverviewCardProps = {
  boxesCount: number
  totalItems: number
  statusMessage: string
  fileInputRef: RefObject<HTMLInputElement | null>
  onExportCsv: () => void
  onImportCsv: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
}

function OverviewCard({
  boxesCount,
  totalItems,
  statusMessage,
  fileInputRef,
  onExportCsv,
  onImportCsv,
}: OverviewCardProps) {
  return (
    <section className="card bg-base-100 shadow">
      <div className="card-body gap-4">
        <h1 className="card-title text-2xl">Moving Box Tracker</h1>
        <p className="text-sm text-base-content/70">
          Keep a list of boxes, room assignments, and items while moving.
        </p>

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
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".csv,text/csv"
            onChange={onImportCsv}
          />
        </div>

        {statusMessage ? <div className="alert alert-info py-2 text-sm">{statusMessage}</div> : null}
      </div>
    </section>
  )
}

export default OverviewCard
