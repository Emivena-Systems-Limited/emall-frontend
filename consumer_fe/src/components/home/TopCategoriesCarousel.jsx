import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import TopCategoryItem from './TopCategoryItem'

function NavButton({ direction, disabled, onClick, label }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="group/nav flex size-8 items-center justify-center rounded-full text-slate-600 transition-all duration-200 enabled:hover:bg-white enabled:hover:text-auth-primary enabled:hover:shadow-sm enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 sm:size-9"
    >
      <Icon className="size-4 sm:size-4.5" strokeWidth={2.25} aria-hidden />
    </button>
  )
}

export default function TopCategoriesCarousel({ categories }) {
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
    if (!el) return

    syncScrollState()
    el.addEventListener('scroll', syncScrollState, { passive: true })

    const ro = new ResizeObserver(syncScrollState)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', syncScrollState)
      ro.disconnect()
    }
  }, [categories, syncScrollState])

  const scroll = useCallback((dir) => {
    const el = trackRef.current
    if (!el) return

    const item = el.querySelector('[data-category-item]')
    const itemWidth = item?.offsetWidth ?? 92
    const gap = Number.parseFloat(getComputedStyle(el).gap) || 12
    const scrollAmount = (itemWidth + gap) * 4

    el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' })
  }, [])

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      scroll(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      scroll(1)
    }
  }

  const showControls = canScrollLeft || canScrollRight
  const showViewAll = categories.length > 0

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6 sm:gap-4">
        <h2
          id="top-categories-heading"
          className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
        >
          Top Categories
        </h2>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showViewAll && (
            <Link
              to="/categories"
              className="text-sm font-semibold text-auth-primary underline-offset-2 transition-colors hover:text-auth-primary-hover hover:underline sm:text-base"
            >
              View All
            </Link>
          )}

          {showControls && (
            <div className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-50/90 p-0.5 shadow-sm backdrop-blur-sm sm:p-1">
              <NavButton
                direction="left"
                disabled={!canScrollLeft}
                onClick={() => scroll(-1)}
                label="Scroll categories left"
              />
              <span className="mx-0.5 h-4 w-px bg-slate-200/90" aria-hidden />
              <NavButton
                direction="right"
                disabled={!canScrollRight}
                onClick={() => scroll(1)}
                label="Scroll categories right"
              />
            </div>
          )}
        </div>
      </div>

      <div className="relative min-w-0">
        <div
          ref={trackRef}
          tabIndex={0}
          role="list"
          aria-labelledby="top-categories-heading"
          onKeyDown={handleKeyDown}
          className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth overscroll-x-contain pb-0.5 outline-none scrollbar-none [-ms-overflow-style:none] focus-visible:ring-2 focus-visible:ring-auth-primary/30 focus-visible:ring-offset-2 sm:gap-2.5 lg:gap-3 [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => (
            <div
              key={category.id}
              role="listitem"
              data-category-item
              className="min-w-[5.25rem] flex-1 snap-start"
            >
              <TopCategoryItem category={category} />
            </div>
          ))}
        </div>

        {canScrollLeft && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-1 w-8 bg-linear-to-r from-white via-white/85 to-transparent sm:w-12"
          />
        )}
        {canScrollRight && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-1 w-8 bg-linear-to-l from-white via-white/85 to-transparent sm:w-12"
          />
        )}
      </div>
    </div>
  )
}
