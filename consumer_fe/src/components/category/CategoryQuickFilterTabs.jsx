import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CATEGORY_QUICK_FILTERS } from '../../constants/categoryQuickFilters'

const DEFAULT_FILTER_ID = CATEGORY_QUICK_FILTERS[0].id
const VALID_FILTER_IDS = new Set(CATEGORY_QUICK_FILTERS.map((filter) => filter.id))

function resolveFilterId(value) {
  if (value && VALID_FILTER_IDS.has(value)) return value
  return DEFAULT_FILTER_ID
}

function ScrollArrow({ direction, disabled, onClick, label }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-black bg-white text-slate-900 transition-colors hover:bg-slate-50 disabled:cursor-default disabled:hover:bg-white sm:size-9"
    >
      <Icon
        className={`size-4 cursor-pointer ${disabled ? 'opacity-35' : ''}`}
        strokeWidth={2.25}
        aria-hidden
      />
    </button>
  )
}

export default function CategoryQuickFilterTabs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeId = resolveFilterId(searchParams.get('filter'))
  const trackRef = useRef(null)
  const tabRefs = useRef({})
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const syncScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return undefined

    syncScrollState()
    el.addEventListener('scroll', syncScrollState, { passive: true })
    const ro = new ResizeObserver(syncScrollState)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', syncScrollState)
      ro.disconnect()
    }
  }, [syncScrollState])

  useEffect(() => {
    const activeTab = tabRefs.current[activeId]
    if (!activeTab) return

    activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeId])

  const scroll = useCallback((dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * 240, behavior: 'smooth' })
  }, [])

  const handleSelect = (filterId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)

      if (filterId === DEFAULT_FILTER_ID) {
        next.delete('filter')
      } else {
        next.set('filter', filterId)
      }

      return next
    }, { replace: true })
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <ScrollArrow
        direction="left"
        disabled={!canScrollLeft}
        onClick={() => scroll(-1)}
        label="Scroll filters left"
      />

      <div
        ref={trackRef}
        role="tablist"
        aria-label="Quick filters"
        className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth pb-0.5 scrollbar-none [-ms-overflow-style:none] sm:gap-2.5 [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORY_QUICK_FILTERS.map((filter) => {
          const isActive = filter.id === activeId

          return (
            <button
              key={filter.id}
              ref={(node) => {
                tabRefs.current[filter.id] = node
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(filter.id)}
              className={`shrink-0 cursor-pointer whitespace-nowrap rounded-lg border px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-out sm:px-4 sm:py-2.5 ${
                isActive
                  ? 'border-auth-primary bg-auth-primary text-white shadow-sm hover:border-auth-primary-hover hover:bg-auth-primary-hover hover:shadow-md'
                  : 'border-black bg-white text-slate-900 hover:bg-slate-50 hover:shadow-sm active:scale-[0.98]'
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <ScrollArrow
        direction="right"
        disabled={!canScrollRight}
        onClick={() => scroll(1)}
        label="Scroll filters right"
      />
    </div>
  )
}
