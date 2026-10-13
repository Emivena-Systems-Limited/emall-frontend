import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import HeroBannerCard from './HeroBannerCard'

const ease = [0.16, 1, 0.3, 1]
const AUTOPLAY_MS = 5000
const SLIDE_MS = 550

export default function HeroBannerCarousel({ banners }) {
  const count = banners.length
  const looped = count > 1
  const slides = looped ? [banners[count - 1], ...banners, banners[0]] : banners
  const [index, setIndex] = useState(looped ? 1 : 0)
  const [instant, setInstant] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const indexRef = useRef(index)
  indexRef.current = index

  const active = !looped ? 0 : index === 0 ? count - 1 : index === count + 1 ? 0 : index - 1

  const goTo = useCallback(
    (slideIndex) => {
      if (!count) return
      setInstant(false)
      setIndex(looped ? slideIndex + 1 : slideIndex)
    },
    [count, looped],
  )

  const goNext = useCallback(() => {
    if (!looped) return
    setInstant(false)
    setIndex((prev) => Math.min(prev + 1, count + 1))
  }, [count, looped])

  const goPrev = useCallback(() => {
    if (!looped) return
    setInstant(false)
    setIndex((prev) => Math.max(prev - 1, 0))
  }, [looped])

  const settleClone = useCallback(() => {
    const current = indexRef.current

    if (current === count + 1) {
      setInstant(true)
      setIndex(1)
      return
    }

    if (current === 0) {
      setInstant(true)
      setIndex(count)
    }
  }, [count])

  useEffect(() => {
    if (!looped || (index !== 0 && index !== count + 1)) return undefined

    const id = window.setTimeout(settleClone, SLIDE_MS)
    return () => window.clearTimeout(id)
  }, [index, count, looped, settleClone])

  useEffect(() => {
    if (!instant) return undefined

    let frame = 0
    const outer = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => setInstant(false))
    })

    return () => {
      window.cancelAnimationFrame(outer)
      window.cancelAnimationFrame(frame)
    }
  }, [instant, index])

  useEffect(() => {
    if (isPaused || !looped) return undefined

    const id = window.setInterval(goNext, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [isPaused, goNext, looped])

  if (!count) return null

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
        <div
          className="flex"
          data-hero-index={index}
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: instant ? 'none' : `transform ${SLIDE_MS}ms cubic-bezier(${ease.join(',')})`,
          }}
        >
          {slides.map((banner, slideIndex) => (
            <div
              key={`${banner.id}-${slideIndex}`}
              className="w-full shrink-0"
              aria-hidden={looped && (slideIndex === 0 || slideIndex === count + 1) ? true : undefined}
            >
              <HeroBannerCard banner={banner} />
            </div>
          ))}
        </div>
      </div>

      {looped ? (
        <>
          <button
            type="button"
            aria-label="Previous banners"
            onClick={goPrev}
            className="absolute top-1/2 left-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:left-4 sm:size-10"
          >
            <ChevronLeft className="size-5" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            aria-label="Next banners"
            onClick={goNext}
            className="absolute top-1/2 right-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:right-4 sm:size-10"
          >
            <ChevronRight className="size-5" strokeWidth={2.25} />
          </button>
        </>
      ) : null}

      {looped ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          {banners.map((banner, slideIndex) => {
            const isActive = slideIndex === active

            return (
              <button
                key={banner.id}
                type="button"
                aria-label={`Go to ${banner.name}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => goTo(slideIndex)}
                className={`rounded-full transition-all duration-300 ${
                  isActive ? 'size-2.5 bg-[#ffe14d]' : 'size-2 bg-[#ffe14d]/45 hover:bg-[#ffe14d]/70'
                }`}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
