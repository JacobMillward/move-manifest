import { useState } from 'react'
import AddBoxTab from './components/AddBoxTab'
import BoxesSection from './components/BoxesSection'
import OverviewCard from './components/OverviewCard'
import PackingLabelsTab from './components/PackingLabelsTab'
import useBoxes from './hooks/useBoxes'
import { useHashRoute } from './hooks/useHashRoute'

function App() {
  const [route, setRoute] = useHashRoute()
  const {
    boxes,
    totalItems,
    nextSuggestedBoxNumber,
    addBoxFromForm,
    updateBoxRoom,
    updateBoxNumber,
    removeBox,
    addItemToBox,
    removeItemFromBox,
    exportBoxesCsv,
    importBoxesCsv,
  } = useBoxes()
  const [statusMessage, setStatusMessage] = useState('')

  const activeTab = route === 'packing-labels' ? 'packing-labels' : 'add-box'

  const handleAddBox = (input: { room: string; numberInput: string; itemsInput: string }) => {
    const result = addBoxFromForm(input)
    setStatusMessage(result.message)
    return result
  }

  const handleImportCsv = async (file: File) => {
    const result = await importBoxesCsv(file)
    setStatusMessage(result.message)
  }

  const handleExportCsv = () => {
    const result = exportBoxesCsv()
    setStatusMessage(result.message)
  }

  return (
    <main className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <OverviewCard
          boxesCount={boxes.length}
          totalItems={totalItems}
          statusMessage={statusMessage}
          onExportCsv={handleExportCsv}
          onImportCsv={handleImportCsv}
        />

        <section className="card bg-base-100 shadow">
          <div className="card-body">
            <div role="tablist" className="tabs tabs-box mb-2">
              <button
                type="button"
                role="tab"
                className={`tab ${activeTab === 'add-box' ? 'tab-active' : ''}`}
                onClick={() => setRoute('add-box')}
              >
                Add Box
              </button>
              <button
                type="button"
                role="tab"
                className={`tab ${activeTab === 'packing-labels' ? 'tab-active' : ''}`}
                onClick={() => setRoute('packing-labels')}
              >
                Packing Labels
              </button>
            </div>

            {activeTab === 'add-box' ? (
              <AddBoxTab
                nextSuggestedNumber={nextSuggestedBoxNumber}
                onAddBox={handleAddBox}
                onStatusMessage={setStatusMessage}
              />
            ) : (
              <PackingLabelsTab
                boxes={boxes}
                onStatusMessage={setStatusMessage}
              />
            )}
          </div>
        </section>

        <BoxesSection
          boxes={boxes}
          onStatusMessage={setStatusMessage}
          onUpdateBoxRoom={updateBoxRoom}
          onUpdateBoxNumber={updateBoxNumber}
          onRemoveBox={removeBox}
          onRemoveItemFromBox={removeItemFromBox}
          onAddItemToBox={addItemToBox}
        />
      </div>
    </main>
  )
}

export default App
