import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SubcategorySpotlightCard from './SubcategorySpotlightCard'

function CarouselNavButton({ direction, disabled, onClick, label }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.12)] transition-shadow enabled:hover:shadow-[0_4px_12px_rgba(15,23,42,0.16)] disabled:cursor-not-allowed disabled:opacity-35 sm:size-9"
    >
      <Icon className="size-4" strokeWidth={2.25} aria-hidden />
    </button>
  )
}

export default function SubcategoryCarousel({
  title,
  subcategories = [],
  viewAllHref,
  viewAllLabel,
}) {
  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const sectionId = `department-${title.toLowerCase().replace(/\s+/g, '-')}-carousel`

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

    const observer = new ResizeObserver(syncScrollState)
    observer.observe(el)

    return () => {
      el.removeEventListener('scroll', syncScrollState)
      observer.disconnect()
    }
  }, [subcategories, syncScrollState])

  const scroll = useCallback((direction) => {
    const el = trackRef.current
    if (!el) return

    const item = el.querySelector('[data-subcategory-card]')
    const itemWidth = item?.offsetWidth ?? 260
    const gap = Number.parseFloat(getComputedStyle(el).gap) || 20
    const scrollAmount = (itemWidth + gap) * 2

    el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' })
  }, [])

  if (!subcategories.length) return null

  const showControls = canScrollLeft || canScrollRight
  const resolvedViewAllLabel = viewAllLabel ?? `View ${title}`

  return (
    <section aria-labelledby={sectionId}>
      <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
        <h2
          id={sectionId}
          className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl"
        >
          {title}
        </h2>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {viewAllHref ? (
            <Link
              to={viewAllHref}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-auth-primary sm:px-3.5 sm:py-2 sm:text-sm"
            >
              {resolvedViewAllLabel}
            </Link>
          ) : null}

          {showControls ? (
            <div className="flex items-center gap-2">
              <CarouselNavButton
                direction="left"
                disabled={!canScrollLeft}
                onClick={() => scroll(-1)}
                label={`Scroll ${title} subcategories left`}
              />
              <CarouselNavButton
                direction="right"
                disabled={!canScrollRight}
                onClick={() => scroll(1)}
                label={`Scroll ${title} subcategories right`}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative mt-3 min-w-0 sm:mt-4">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth overscroll-x-contain pb-1 scrollbar-none sm:gap-4 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {subcategories.map((subcategory, index) => (
            <div
              key={subcategory.id}
              data-subcategory-card
              className="w-[72vw] shrink-0 snap-start sm:w-[42vw] md:w-[31vw] lg:w-[23vw] xl:w-[calc(25%-15px)]"
            >
              <SubcategorySpotlightCard
                subcategory={subcategory}
                index={index}
                animate={false}
              />
            </div>
          ))}
        </div>

        {canScrollLeft && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-1 w-10 bg-linear-to-r from-white via-white/90 to-transparent sm:w-14"
          />
        )}
        {canScrollRight && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-1 w-10 bg-linear-to-l from-white via-white/90 to-transparent sm:w-14"
          />
        )}
      </div>
    </section>
  )
}
