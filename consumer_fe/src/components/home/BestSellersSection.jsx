import { useCallback, useRef } from 'react'
import { ArrowRight, Trophy } from 'lucide-react'
import { Link } from 'react-router'
import { useReducedMotion } from 'framer-motion'
import Container from '../layout/Container'
import ProductCard from '../shared/ProductCard'

function BestsellersRow({ category }) {
  const reduceMotion = useReducedMotion()
  const trackRef = useRef(null)
  const headingId = `bestsellers-${category.id}-heading`
  const products = category.products ?? []

  const scrollByCard = useCallback((direction) => {
    const track = trackRef.current
    if (!track) return

    const card = track.querySelector('[data-bestseller-card]')
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 12
    const amount = (card?.offsetWidth ?? track.clientWidth * 0.7) + gap
    track.scrollBy({ left: direction * amount, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [reduceMotion])

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      scrollByCard(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      scrollByCard(1)
    }
  }

  if (!products.length) return null

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 id={headingId} className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Bestsellers
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f5c518] px-2 py-0.5 text-[11px] font-semibold text-slate-950">
              <Trophy className="size-3" strokeWidth={2.25} aria-hidden />
              Top Picks
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Most loved by EZMall shoppers — top-rated picks
          </p>
        </div>
        <Link
          to={category.viewAllHref ?? category.href ?? '/promotions?filter=bestsellers'}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-nav-red transition-colors hover:text-nav-red-deep"
        >
          View All
          <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
        </Link>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={headingId}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth overscroll-x-contain outline-none [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-bestseller-card
            className="h-full w-[78%] shrink-0 snap-start sm:w-[46%] md:w-[31%] lg:w-[15.6%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BestSellersSection({ categories = [] }) {
  const rows = categories.filter((category) => category.products?.length)
  if (!rows.length) return null

  return (
    <section aria-label="Bestsellers" className="bg-[#fbf6ee] py-4 sm:py-5 lg:py-6">
      <Container>
        <div className="space-y-8">
          {rows.map((category) => (
            <BestsellersRow key={category.id} category={category} />
          ))}
        </div>
      </Container>
    </section>
  )
}
