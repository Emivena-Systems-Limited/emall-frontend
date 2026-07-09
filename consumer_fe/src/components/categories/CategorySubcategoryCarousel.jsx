import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Container from '../layout/Container'
import SubcategoryCarouselCard from './SubcategoryCarouselCard'

function NavButton({ direction, disabled, onClick, label }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all enabled:hover:border-auth-primary enabled:hover:text-auth-primary enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 sm:size-9"
    >
      <Icon className="size-4" strokeWidth={2.25} aria-hidden />
    </button>
  )
}

function SubcategoryCarouselSkeleton({ fluid = false }) {
  if (fluid) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100" />
            <div className="mt-3.5 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 sm:gap-5">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="w-[12rem] shrink-0 sm:w-[13.5rem] lg:w-[15rem]">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100" />
          <div className="mt-3.5 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

const FULL_WIDTH_GRID_COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
}

export default function CategorySubcategoryCarousel({ title, subcategories = [], isLoading = false }) {
  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const headingId = `${title.toLowerCase().replace(/\s+/g, '-')}-subcategories-heading`
  const itemCount = subcategories.length
  const useFullWidthGrid = !isLoading && itemCount > 0 && itemCount <= 4
  const gridClass = FULL_WIDTH_GRID_COLUMNS[itemCount] ?? FULL_WIDTH_GRID_COLUMNS[4]

  const syncScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return

    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    if (useFullWidthGrid) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return undefined
    }

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
  }, [subcategories, isLoading, syncScrollState, useFullWidthGrid])

  const scroll = useCallback((dir) => {
    const el = trackRef.current
    if (!el) return

    const item = el.querySelector('[data-subcategory-item]')
    const itemWidth = item?.offsetWidth ?? 192
    const gap = Number.parseFloat(getComputedStyle(el).gap) || 16
    const scrollAmount = (itemWidth + gap) * 3

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

  const showControls = !useFullWidthGrid && !isLoading && subcategories.length > 0 && (canScrollLeft || canScrollRight)

  return (
    <section aria-labelledby={headingId} className="bg-white pb-8 sm:pb-10 lg:pb-12">
      <Container>
        <div className="border-b border-slate-200 pb-4 sm:pb-5">
          <div className="flex items-center justify-between gap-3">
            <h2
              id={headingId}
              className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
            >
              {title}
            </h2>

            {showControls ? (
              <div className="inline-flex shrink-0 items-center gap-1.5">
                <NavButton
                  direction="left"
                  disabled={!canScrollLeft}
                  onClick={() => scroll(-1)}
                  label={`Scroll ${title} subcategories left`}
                />
                <NavButton
                  direction="right"
                  disabled={!canScrollRight}
                  onClick={() => scroll(1)}
                  label={`Scroll ${title} subcategories right`}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative mt-5 min-w-0 sm:mt-6">
          {isLoading ? (
            <SubcategoryCarouselSkeleton fluid={useFullWidthGrid} />
          ) : subcategories.length ? (
            useFullWidthGrid ? (
              <div
                role="list"
                aria-labelledby={headingId}
                className={`grid gap-4 sm:gap-5 ${gridClass}`}
              >
                {subcategories.map((subcategory) => (
                  <div key={subcategory.id} role="listitem">
                    <SubcategoryCarouselCard subcategory={subcategory} fluid />
                  </div>
                ))}
              </div>
            ) : (
              <div
                ref={trackRef}
                tabIndex={0}
                role="list"
                aria-labelledby={headingId}
                onKeyDown={handleKeyDown}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth overscroll-x-contain pb-0.5 outline-none scrollbar-none [-ms-overflow-style:none] focus-visible:ring-2 focus-visible:ring-auth-primary/30 focus-visible:ring-offset-2 sm:gap-5 [&::-webkit-scrollbar]:hidden"
              >
                {subcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    role="listitem"
                    data-subcategory-item
                    className="snap-start"
                  >
                    <SubcategoryCarouselCard subcategory={subcategory} />
                  </div>
                ))}
              </div>
            )
          ) : null}

          {!useFullWidthGrid && canScrollLeft ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-1 w-8 bg-linear-to-r from-white via-white/90 to-transparent sm:w-10"
            />
          ) : null}
          {!useFullWidthGrid && canScrollRight ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-1 w-8 bg-linear-to-l from-white via-white/90 to-transparent sm:w-10"
            />
          ) : null}
        </div>
      </Container>
    </section>
  )
}
