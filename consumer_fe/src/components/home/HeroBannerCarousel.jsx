import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import HeroBannerCard from './HeroBannerCard'

const ease = [0.16, 1, 0.3, 1]
const AUTOPLAY_MS = 5000
const MIN_SLIDE_WIDTH = 280
const MAX_SLIDES_PER_VIEW = 4

function useSlidesPerView(containerRef) {
  const [slidesPerView, setSlidesPerView] = useState(1)

  useEffect(() => {
    const update = () => {
      const width = containerRef.current?.clientWidth ?? window.innerWidth

      if (width < 640) {
        setSlidesPerView(1)
        return
      }

      if (width < 1024) {
        setSlidesPerView(2)
        return
      }

      const gap = 12
      const fitCount = Math.floor((width + gap) / (MIN_SLIDE_WIDTH + gap))
      setSlidesPerView(Math.max(2, Math.min(MAX_SLIDES_PER_VIEW, fitCount)))
    }

    update()
    window.addEventListener('resize', update)

    const container = containerRef.current
    const resizeObserver = container ? new ResizeObserver(update) : null
    if (container) resizeObserver.observe(container)

    return () => {
      window.removeEventListener('resize', update)
      resizeObserver?.disconnect()
    }
  }, [containerRef])

  return slidesPerView
}

function buildPages(banners, slidesPerView) {
  const pages = []

  for (let i = 0; i < banners.length; i += slidesPerView) {
    const page = banners.slice(i, i + slidesPerView)

    if (page.length === 0) continue

    if (page.length < slidesPerView) {
      let fillIndex = 0
      while (page.length < slidesPerView) {
        page.push(banners[fillIndex % banners.length])
        fillIndex += 1
      }
    }

    pages.push(page)
  }

  return pages
}

export default function HeroBannerCarousel({ banners }) {
  const containerRef = useRef(null)
  const slidesPerView = useSlidesPerView(containerRef)
  const pages = useMemo(() => buildPages(banners, slidesPerView), [banners, slidesPerView])
  const pageCount = pages.length

  const [activePage, setActivePage] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setActivePage((prev) => Math.min(prev, Math.max(0, pageCount - 1)))
  }, [pageCount, slidesPerView])

  const goToPage = useCallback(
    (pageIndex) => {
      setActivePage(Math.min(Math.max(pageIndex, 0), pageCount - 1))
    },
    [pageCount],
  )

  const goNext = useCallback(() => {
    setActivePage((prev) => (prev >= pageCount - 1 ? 0 : prev + 1))
  }, [pageCount])

  const goPrev = useCallback(() => {
    setActivePage((prev) => (prev <= 0 ? pageCount - 1 : prev - 1))
  }, [pageCount])

  useEffect(() => {
    if (isPaused || pageCount <= 1) return undefined

    const id = window.setInterval(goNext, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [isPaused, goNext, pageCount])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `-${activePage * 100}%` }}
          transition={{ duration: 0.55, ease }}
        >
          {pages.map((page, pageIndex) => (
            <div
              key={`page-${pageIndex}`}
              className="flex w-full shrink-0 gap-2 sm:gap-2.5 lg:gap-3"
            >
              {page.map((banner, index) => (
                <div key={`${banner.id}-${pageIndex}-${index}`} className="min-w-0 flex-1">
                  <HeroBannerCard banner={banner} />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {pageCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous banners"
            onClick={goPrev}
            className="absolute left-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-700 shadow-md transition-colors hover:bg-white sm:left-3 sm:size-10"
          >
            <ChevronLeft className="size-5" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            aria-label="Next banners"
            onClick={goNext}
            className="absolute right-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-700 shadow-md transition-colors hover:bg-white sm:right-3 sm:size-10"
          >
            <ChevronRight className="size-5" strokeWidth={2.25} />
          </button>
        </>
      )}

      {pageCount > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {pages.map((_, index) => {
            const isActive = index === activePage

            return (
              <button
                key={index}
                type="button"
                aria-label={`Go to banner page ${index + 1}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => goToPage(index)}
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? 'size-2.5 bg-auth-primary'
                    : 'size-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
