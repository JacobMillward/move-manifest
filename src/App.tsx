import AddBoxTab from './components/AddBoxTab'
import BoxesSection from './components/BoxesSection'
import OverviewCard from './components/OverviewCard'
import PackingLabelsTab from './components/PackingLabelsTab'
import useBoxes from './hooks/useBoxes'
import usePackingLabels from './hooks/usePackingLabels'

function App() {
  const {
    boxes,
    roomInput,
    numberInput,
    itemsInput,
    statusMessage,
    newItemByBox,
    fileInputRef,
    totalItems,
    setStatusMessage,
    setRoomInput,
    setNumberInput,
    setItemsInput,
    addBox,
    updateBox,
    updateBoxNumber,
    removeBox,
    addItemToBox,
    removeItemFromBox,
    exportCsv,
    importCsv,
    setNewItemDraft,
  } = useBoxes()

  const {
    activeTab,
    labelsMaxHeightCm,
    excludedLabelBoxIds,
    setActiveTab,
    setLabelsMaxHeightCm,
    toggleLabelBoxSelection,
    selectAllLabelBoxes,
    clearAllLabelBoxes,
    generatePackingLabels,
  } = usePackingLabels(boxes)

  const handleGeneratePackingLabels = () => {
    const result = generatePackingLabels()
    setStatusMessage(result.message)
  }

  return (
    <main className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <OverviewCard
          boxesCount={boxes.length}
          totalItems={totalItems}
          statusMessage={statusMessage}
          fileInputRef={fileInputRef}
          onExportCsv={exportCsv}
          onImportCsv={importCsv}
        />

        <section className="card bg-base-100 shadow">
          <div className="card-body">
            <div role="tablist" className="tabs tabs-box mb-2">
              <button
                type="button"
                role="tab"
                className={`tab ${activeTab === 'add-box' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('add-box')}
              >
                Add Box
              </button>
              <button
                type="button"
                role="tab"
                className={`tab ${activeTab === 'packing-labels' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('packing-labels')}
              >
                Packing Labels
              </button>
            </div>

            {activeTab === 'add-box' ? (
              <AddBoxTab
                roomInput={roomInput}
                numberInput={numberInput}
                itemsInput={itemsInput}
                onRoomInputChange={setRoomInput}
                onNumberInputChange={setNumberInput}
                onItemsInputChange={setItemsInput}
                onAddBox={addBox}
              />
            ) : (
              <PackingLabelsTab
                boxes={boxes}
                labelsMaxHeightCm={labelsMaxHeightCm}
                excludedLabelBoxIds={excludedLabelBoxIds}
                onLabelsMaxHeightCmChange={setLabelsMaxHeightCm}
                onSelectAllLabelBoxes={selectAllLabelBoxes}
                onClearAllLabelBoxes={clearAllLabelBoxes}
                onToggleLabelBoxSelection={toggleLabelBoxSelection}
                onGeneratePackingLabels={handleGeneratePackingLabels}
              />
            )}
          </div>
        </section>

        <BoxesSection
          boxes={boxes}
          newItemByBox={newItemByBox}
          onUpdateBoxRoom={(boxId, room) => updateBox(boxId, { room })}
          onUpdateBoxNumber={updateBoxNumber}
          onRemoveBox={removeBox}
          onRemoveItemFromBox={removeItemFromBox}
          onSetNewItemByBox={setNewItemDraft}
          onAddItemToBox={addItemToBox}
        />
      </div>
    </main>
  )
}

export default App
