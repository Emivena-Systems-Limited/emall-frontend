import { useCallback, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { useReducedMotion } from 'framer-motion'
import Container from '../layout/Container'
import ProductCard from '../shared/ProductCard'

export default function NewArrivalsSection({ products = [] }) {
  const reduceMotion = useReducedMotion()
  const trackRef = useRef(null)

  const scrollByCard = useCallback((direction) => {
    const track = trackRef.current
    if (!track) return

    const card = track.querySelector('[data-arrival-card]')
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
    <section id="new-arrivals" aria-labelledby="new-arrivals-heading" className="bg-[#f3faf7] py-4 sm:py-5 lg:py-6">
      <Container>
        <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2
                id="new-arrivals-heading"
                className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
              >
                New Arrivals
              </h2>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                New
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Fresh drops — just landed on EZMall
            </p>
          </div>
          <Link
            to="/promotions"
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
          aria-label="New arrivals"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth overscroll-x-contain outline-none [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-emerald-600/30 focus-visible:ring-offset-2 [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div
              key={product.id}
              data-arrival-card
              className="h-full w-[78%] shrink-0 snap-start sm:w-[46%] md:w-[31%] lg:w-[15.6%]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
