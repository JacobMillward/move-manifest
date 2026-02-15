import { useMemo } from 'react'
import { loadBoxes } from '../lib/storage'

function ManifestPage() {
  const allBoxes = useMemo(() => loadBoxes().sort((a, b) => a.number - b.number), [])

  const manifestCss = `
    @media print {
      .navbar {
        display: none;
      }
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
      }
      @page {
        size: A4;
      }
      .manifest-content {
        padding: 10mm;
      }
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: manifestCss }} />

      <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-10">
        <div className="flex-1">
          <a href="/" className="btn btn-ghost btn-sm gap-2">
            ← Back
          </a>
        </div>
        <button onClick={() => window.print()} className="btn btn-ghost btn-sm gap-2">
          🖨️ Print Manifest
        </button>
      </div>

      <div className="manifest-content px-4 sm:px-0">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 border-b border-base-300 pb-3">
            <h1 className="text-3xl font-bold mb-1">Moving Manifest</h1>
            <p className="text-base-content/60 text-sm">{allBoxes.length} boxes</p>
          </div>

          <div className="space-y-2">
            {allBoxes.map((box) => (
              <div key={box.id} className="card bg-base-100 border border-base-300 page-break-inside-avoid">
                <div className="card-body p-3 flex flex-row gap-4 items-start">
                  <div className="text-center flex-shrink-0">
                    <div className="text-4xl font-black">{box.number}</div>
                    <div className="text-xs uppercase tracking-wider text-base-content/50 font-semibold">Box</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm uppercase tracking-wide font-semibold text-base-content/70 mb-1">
                      {box.room || '—'}
                    </div>
                    <div className="text-xs leading-relaxed text-base-content/70">
                      {box.items.length === 0 ? (
                        <span className="italic text-base-content/50">(empty)</span>
                      ) : (
                        <>
                          <div className="font-semibold uppercase tracking-wider text-base-content/60 text-xs mb-1">
                            {box.items.length} item{box.items.length !== 1 ? 's' : ''}
                          </div>
                          <div className="whitespace-pre-wrap break-words">
                            {box.items.join('\n')}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default ManifestPage
