import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CATEGORY_QUICK_FILTERS } from '../../constants/categoryQuickFilters'

export default function CategoryQuickFilterTabs() {
  const [activeId, setActiveId] = useState(CATEGORY_QUICK_FILTERS[0].id)
  const trackRef = useRef(null)
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

  const scroll = useCallback((dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }, [])

  return (
    <div className="relative flex items-center">
      {canScrollLeft ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white via-white/80 to-transparent"
          />
          <button
            type="button"
            aria-label="Scroll filters left"
            onClick={() => scroll(-1)}
            className="absolute left-0 z-20 flex size-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-md ring-1 ring-slate-200 transition-all hover:text-auth-primary hover:shadow-lg active:scale-95"
          >
            <ChevronLeft className="size-4" strokeWidth={2.25} aria-hidden />
          </button>
        </>
      ) : null}

      <div
        ref={trackRef}
        role="tablist"
        aria-label="Quick filters"
        className="flex w-full gap-2 overflow-x-auto scroll-smooth pb-0.5 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORY_QUICK_FILTERS.map((filter) => {
          const isActive = filter.id === activeId

          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(filter.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-[0.9375rem] ${
                isActive
                  ? 'bg-auth-primary text-white shadow-md shadow-auth-primary/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {canScrollRight ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white via-white/80 to-transparent"
          />
          <button
            type="button"
            aria-label="Scroll filters right"
            onClick={() => scroll(1)}
            className="absolute right-0 z-20 flex size-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-md ring-1 ring-slate-200 transition-all hover:text-auth-primary hover:shadow-lg active:scale-95"
          >
            <ChevronRight className="size-4" strokeWidth={2.25} aria-hidden />
          </button>
        </>
      ) : null}
    </div>
  )
}
