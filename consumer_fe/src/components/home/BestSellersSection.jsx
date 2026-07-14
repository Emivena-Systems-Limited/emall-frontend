import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router'
import Container from '../layout/Container'
import ProductCard from '../shared/ProductCard'

const ease = [0.16, 1, 0.3, 1]

function CarouselTrack({ products }) {
  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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
  }, [syncScrollState])

  const scroll = useCallback((dir) => {
    const el = trackRef.current
    if (!el) return
    const cardWidth = el.querySelector('li')?.offsetWidth ?? 200
    const gap = Number.parseFloat(getComputedStyle(el).gap) || 12
    el.scrollBy({ left: dir * (cardWidth + gap) * 2, behavior: 'smooth' })
  }, [])

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] scrollbar-none sm:gap-2.5 lg:gap-3 [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product) => (
          <li
            key={product.id}
            className="w-52 shrink-0 sm:w-56 lg:w-60 xl:w-64"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scroll(-1)}
          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition-all hover:border-slate-300 hover:shadow-lg lg:flex size-9"
        >
          <ChevronLeft className="size-4.5 text-slate-700" strokeWidth={2.25} />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scroll(1)}
          className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition-all hover:border-slate-300 hover:shadow-lg lg:flex size-9"
        >
          <ChevronRight className="size-4.5 text-slate-700" strokeWidth={2.25} />
        </button>
      )}

      {canScrollLeft && (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-white to-transparent lg:hidden" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-white to-transparent" />
      )}
    </div>
  )
}

export default function BestSellersSection({ categories = [] }) {
  if (!categories.length) return null

  return (
    <section aria-label="Best sellers" className="bg-[#f2f2f2] py-4 sm:py-5 lg:py-6">
      <Container>
        <div className="space-y-5 sm:space-y-6">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08, ease }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7"
            >
              <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {category.label === 'Best Sellers' ? (
                    category.label
                  ) : (
                    <>
                      Best Sellers in{' '}
                      <span className="text-auth-primary">{category.label}</span>
                    </>
                  )}
                </h2>
                <Link
                  to={category.viewAllHref ?? category.href}
                  className="shrink-0 text-sm font-semibold text-auth-primary underline-offset-2 hover:underline sm:text-base"
                >
                  View All
                </Link>
              </div>

              <CarouselTrack products={category.products} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
