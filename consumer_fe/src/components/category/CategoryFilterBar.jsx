import { useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, ChevronUp, SlidersHorizontal } from 'lucide-react'
import CategoryFilterDropdownPanel from './CategoryFilterDropdownPanel'
import CategoryPageContainer from './CategoryPageContainer'
import {
  getChipActiveCount,
  getQuickFilterChips,
} from '../../utils/categoryProductFilters'

function FilterChip({ label, activeCount = 0, onClick, emphasized = false, expanded = false }) {
  const isActive = activeCount > 0

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={[
        'relative inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-normal transition-all duration-200 sm:px-3 sm:py-2',
        expanded
          ? 'bg-white text-slate-900 shadow-[0_0_0_1px_rgba(15,23,42,0.08)] after:absolute after:-bottom-px after:left-1/2 after:size-2.5 after:-translate-x-1/2 after:rotate-45 after:border-b after:border-r after:border-slate-100 after:bg-white'
          : isActive
            ? 'bg-slate-200/90 text-slate-900'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70',
      ].join(' ')}
    >
      {emphasized && (
        <SlidersHorizontal className="size-3 shrink-0 sm:size-3.5" strokeWidth={2.25} aria-hidden />
      )}
      <span className="truncate">{label}</span>
      {isActive && !emphasized && !expanded && (
        <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-slate-800 px-1 py-0.5 text-[0.5625rem] font-medium leading-none text-white">
          {activeCount}
        </span>
      )}
      {!emphasized && (
        expanded ? (
          <ChevronUp className="size-3 shrink-0 text-slate-800 sm:size-3.5" strokeWidth={2.25} aria-hidden />
        ) : (
          <ChevronDown
            className="size-3 shrink-0 text-slate-500 sm:size-3.5"
            strokeWidth={2.25}
            aria-hidden
          />
        )
      )}
    </button>
  )
}

export default function CategoryFilterBar({
  filters,
  draftFilters,
  setDraftFilters,
  filterGroups,
  activeFilterCount,
  activePanelId,
  onTogglePanel,
  onApplyPanel,
  draftResultCount,
  hideSubcategoryChip = false,
  showTopBorder = true,
}) {
  const scrollRef = useRef(null)
  const quickChips = getQuickFilterChips(filterGroups, filters, { hideSubcategoryChip })
  const activeChip = quickChips.find((chip) => chip.id === activePanelId) ?? null

  const scrollChips = (direction) => {
    const container = scrollRef.current
    if (!container) return
    container.scrollBy({ left: direction * 220, behavior: 'smooth' })
  }

  return (
    <div className={showTopBorder ? 'border-t border-slate-100' : ''}>
      <CategoryPageContainer>
        <div className="relative flex items-center gap-1.5 py-2">
          <div
            ref={scrollRef}
            className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <FilterChip
              label={activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
              activeCount={activeFilterCount}
              emphasized
              onClick={() => onTogglePanel('all')}
            />

            {quickChips.map((chip) => (
              <FilterChip
                key={chip.id}
                label={chip.label}
                activeCount={getChipActiveCount(filters, chip)}
                expanded={activePanelId === chip.id}
                onClick={() => onTogglePanel(chip.type === 'attribute' ? chip.facetId : chip.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollChips(1)}
            aria-label="Scroll filters right"
            className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.12)] transition-shadow hover:shadow-[0_4px_12px_rgba(15,23,42,0.16)]"
          >
            <ChevronRight className="size-4" strokeWidth={2.25} />
          </button>
        </div>
      </CategoryPageContainer>

      <AnimatePresence initial={false}>
        {activeChip && (
          <CategoryFilterDropdownPanel
            key={activeChip.id}
            activeChip={activeChip}
            filterGroups={filterGroups}
            draftFilters={draftFilters}
            setDraftFilters={setDraftFilters}
            resultCount={draftResultCount}
            onApply={onApplyPanel}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
