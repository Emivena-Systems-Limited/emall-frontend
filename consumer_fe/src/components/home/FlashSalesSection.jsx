import { useCallback, useRef } from 'react'
import { ArrowRight, Flame } from 'lucide-react'
import { Link } from 'react-router'
import { useReducedMotion } from 'framer-motion'
import Container from '../layout/Container'
import ProductCard from '../shared/ProductCard'
import { FLASH_SALE_ENDS_AT } from '../../constants/flashSalesProducts'
import FlashSalesCountdown from './FlashSalesCountdown'

export default function FlashSalesSection({ products = [] }) {
  const reduceMotion = useReducedMotion()
  const trackRef = useRef(null)
  const endAt = FLASH_SALE_ENDS_AT

  const scrollByCard = useCallback((direction) => {
    const track = trackRef.current
    if (!track) return

    const card = track.querySelector('[data-flash-card]')
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
    <section aria-labelledby="flash-sales-heading" className="bg-white pb-4 sm:pb-5 lg:pb-6">
      <div className="w-full bg-linear-to-r from-[#ef3b45] via-[#ff5a38] to-[#ff8c24] text-white">
        <Container>
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3.5">
            <div className="flex min-w-0 items-start gap-2">
              <Flame className="mt-0.5 size-5 shrink-0 fill-[#ffb703] text-[#ffb703]" strokeWidth={1.75} aria-hidden />
              <div className="min-w-0">
                <h2 id="flash-sales-heading" className="text-lg leading-tight font-bold tracking-tight sm:text-xl">
                  Flash Deals
                </h2>
                <p className="mt-0.5 text-xs text-white/80 sm:text-[13px]">
                  Limited-time discounts — grab them before they’re gone
                </p>
              </div>
            </div>

            <FlashSalesCountdown endAt={endAt} />

            <Link
              to="/products/flash-sales"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1 self-start rounded-full bg-white px-4 text-sm font-semibold text-[#a25453] transition-colors hover:bg-white/90 sm:self-auto"
            >
              All Deals
              <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
            </Link>
          </div>
        </Container>
      </div>

      <Container>
        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Flash deals"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth overscroll-x-contain pb-1 outline-none [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-nav-red/30 focus-visible:ring-offset-2 [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div
              key={product.id}
              data-flash-card
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
