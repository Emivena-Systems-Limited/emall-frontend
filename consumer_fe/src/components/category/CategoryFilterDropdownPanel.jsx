import { motion } from 'framer-motion'
import CategoryPageContainer from './CategoryPageContainer'
import { ColorFilterRow } from './ColorFilterOption'
import {
  getFilterPanelConfig,
  isFilterPanelValueSelected,
  resetFilterPanelSection,
  toggleFilterPanelValue,
} from '../../utils/categoryProductFilters'

const panelEase = [0.16, 1, 0.3, 1]

function PanelOption({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'inline-flex min-h-8 cursor-pointer items-center rounded-lg border px-3 text-sm font-normal transition-colors duration-200',
        selected
          ? 'border-auth-primary bg-auth-primary/8 text-auth-primary'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function PanelFooter({ onReset, onApply, resultCount }) {
  return (
    <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-9 min-w-20 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-normal text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={onApply}
        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-auth-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Show {resultCount}{resultCount >= 1000 ? '+' : ''} result{resultCount !== 1 ? 's' : ''}
      </button>
    </div>
  )
}

export default function CategoryFilterDropdownPanel({
  activeChip,
  filterGroups,
  draftFilters,
  setDraftFilters,
  resultCount,
  onApply,
}) {
  if (!activeChip) return null

  const panel = getFilterPanelConfig(activeChip, filterGroups)
  const isColorPanel = panel.type === 'color'

  const updateDraft = (updater) => {
    setDraftFilters((current) => updater(current))
  }

  const handleReset = () => {
    updateDraft((current) => resetFilterPanelSection(current, panel))
  }

  const handleApply = () => {
    onApply()
  }

  const selectedColorValues = panel.options
    .filter((option) => isFilterPanelValueSelected(draftFilters, panel, option.value))
    .map((option) => option.value)

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22, ease: panelEase }}
      className="overflow-hidden border-t border-slate-100 bg-white"
    >
      <CategoryPageContainer>
        <div className="py-3">
          {isColorPanel ? (
            <div className="rounded-lg border border-slate-200 px-3 py-3 sm:px-4 sm:py-4">
              <ColorFilterRow
                size="sm"
                options={panel.options}
                selectedValues={selectedColorValues}
                onToggle={(value) => updateDraft((current) => toggleFilterPanelValue(current, panel, value))}
              />
              <PanelFooter
                onReset={handleReset}
                onApply={handleApply}
                resultCount={resultCount}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {panel.options.map((option) => (
                  <PanelOption
                    key={option.id}
                    label={option.label}
                    selected={isFilterPanelValueSelected(draftFilters, panel, option.value)}
                    onClick={() => updateDraft((current) => toggleFilterPanelValue(current, panel, option.value, option))}
                  />
                ))}
              </div>

              <div className="mt-3">
                <PanelFooter
                  onReset={handleReset}
                  onApply={handleApply}
                  resultCount={resultCount}
                />
              </div>
            </>
          )}
        </div>
      </CategoryPageContainer>
    </motion.div>
  )
}
