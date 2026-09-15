import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import TopCategoryItem from './TopCategoryItem'
import ViewAllLink from './ViewAllLink'
import { landingSectionPanelClass } from '../../constants/landingLayout'

const pageEase = [0.16, 1, 0.3, 1]
const EAGER_IMAGE_COUNT = 8
const SKELETON_COUNT = 8

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.025 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: pageEase } },
}

function NavButton({ direction, disabled, onClick, label }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-200 enabled:hover:border-auth-primary/40 enabled:hover:bg-auth-primary/5 enabled:hover:text-auth-primary enabled:hover:shadow-md enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 sm:size-10"
    >
      <Icon className="size-4 sm:size-4.5" strokeWidth={2.25} aria-hidden />
    </button>
  )
}

function TopCategoriesTrackSkeleton() {
  return (
    <div className="flex w-full gap-1.5 sm:gap-2 lg:gap-2.5" aria-hidden>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div key={index} className="flex min-w-[5.25rem] flex-1 flex-col items-center gap-[0.375em]">
          <span className="mx-auto block aspect-square w-[min(100%,5.5rem)] animate-pulse rounded-full bg-slate-100 ring-1 ring-slate-100" />
          <span className="h-3 w-14 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

export default function TopCategoriesCarousel({
  categories,
  isLoading = false,
  isError = false,
}) {
  const reduceMotion = useReducedMotion()
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

    const observer = new ResizeObserver(syncScrollState)
    observer.observe(el)

    return () => {
      el.removeEventListener('scroll', syncScrollState)
      observer.disconnect()
    }
  }, [categories, isLoading, syncScrollState])

  const scroll = useCallback((dir) => {
    const el = trackRef.current
    if (!el) return

    const item = el.querySelector('[data-category-item]')
    const itemWidth = item?.offsetWidth ?? 92
    const gap = Number.parseFloat(getComputedStyle(el).gap) || 12
    const scrollAmount = (itemWidth + gap) * 4

    el.scrollBy({ left: dir * scrollAmount, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [reduceMotion])

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

  const showControls = !isLoading && (canScrollLeft || canScrollRight)
  const showViewAll = categories.length > 0 || isLoading
  const motionProps = reduceMotion
    ? {}
    : {
        variants: containerVariants,
        initial: 'hidden',
        animate: 'show',
      }

  return (
    <div className={`w-full ${landingSectionPanelClass}`}>
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6 sm:gap-4">
        <h2
          id="top-categories-heading"
          className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
        >
          Top Categories
        </h2>

        {showViewAll && <ViewAllLink to="/categories" />}
      </div>

      <div className="relative min-w-0">
        {isLoading ? (
          <div aria-busy="true" aria-live="polite" aria-label="Loading categories">
            <TopCategoriesTrackSkeleton />
          </div>
        ) : isError && categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Categories are unavailable right now. Please try again shortly.
          </p>
        ) : (
          <motion.div
            ref={trackRef}
            tabIndex={0}
            role="list"
            aria-labelledby="top-categories-heading"
            onKeyDown={handleKeyDown}
            {...motionProps}
            className="flex w-full snap-x snap-mandatory gap-1.5 overflow-x-auto scroll-smooth overscroll-x-contain pb-0.5 outline-none scrollbar-none [-ms-overflow-style:none] focus-visible:ring-2 focus-visible:ring-auth-primary/30 focus-visible:ring-offset-2 sm:gap-2 lg:gap-2.5 [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                role="listitem"
                data-category-item
                variants={reduceMotion ? undefined : itemVariants}
                className="min-w-[5.25rem] flex-1 snap-start"
              >
                <TopCategoryItem category={category} eager={index < EAGER_IMAGE_COUNT} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {canScrollLeft && !isLoading && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-1 w-8 bg-linear-to-r from-white via-white/85 to-transparent sm:w-12"
          />
        )}
        {canScrollRight && !isLoading && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-1 w-8 bg-linear-to-l from-white via-white/85 to-transparent sm:w-12"
          />
        )}
      </div>

      {showControls ? (
        <div className="mt-4 flex items-center justify-center gap-2 sm:mt-5">
          <NavButton
            direction="left"
            disabled={!canScrollLeft}
            onClick={() => scroll(-1)}
            label="Scroll categories left"
          />
          <NavButton
            direction="right"
            disabled={!canScrollRight}
            onClick={() => scroll(1)}
            label="Scroll categories right"
          />
        </div>
      ) : null}
    </div>
  )
}
