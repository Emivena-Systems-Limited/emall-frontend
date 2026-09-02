import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { isSameVariantOption } from '../../utils/productPayload'

function OptionImageButton({ value, selected, imageSrc, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={`w-[4.75rem] shrink-0 border bg-white p-1 text-center transition-colors sm:w-24 ${
        selected ? 'border-brand ring-1 ring-brand' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <span className="block aspect-square w-full overflow-hidden bg-slate-50">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="size-full max-w-full object-contain" />
        ) : (
          <span className="flex size-full items-center justify-center px-1 text-[0.5625rem] font-semibold text-slate-400">
            {value}
          </span>
        )}
      </span>
      <span className="mt-1 block truncate text-[0.625rem] font-semibold text-slate-600">{value}</span>
    </button>
  )
}

function OptionChipButton({ value, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[0.625rem] font-semibold transition-colors ${
        selected
          ? 'border-brand bg-brand-light text-brand ring-1 ring-brand'
          : 'border-slate-200 bg-white text-slate-500 hover:border-brand hover:text-brand'
      }`}
    >
      {value}
    </button>
  )
}

export default function VariantOptionRow({
  label,
  values = [],
  images = {},
  selected = '',
  onSelect,
  presentation = 'chips',
}) {
  const scrollerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const showImages = presentation === 'images'

  const updateOverflow = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }

    const maxScroll = scroller.scrollWidth - scroller.clientWidth
    setCanScrollLeft(scroller.scrollLeft > 4)
    setCanScrollRight(maxScroll > 4 && scroller.scrollLeft < maxScroll - 4)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return undefined

    updateOverflow()
    scroller.addEventListener('scroll', updateOverflow, { passive: true })
    window.addEventListener('resize', updateOverflow)

    const observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(updateOverflow)
      : null
    observer?.observe(scroller)

    return () => {
      scroller.removeEventListener('scroll', updateOverflow)
      window.removeEventListener('resize', updateOverflow)
      observer?.disconnect()
    }
  }, [updateOverflow, values.length, presentation])

  if (!values.length) return null

  const scrollByDirection = (direction) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollBy({
      left: direction * Math.max(scroller.clientWidth * 0.7, 120),
      behavior: 'smooth',
    })
  }

  const resolveImage = (value) => {
    if (images[value]) return images[value]
    const match = Object.entries(images).find(([key]) => isSameVariantOption(key, value))
    if (match?.[1]) return match[1]
    return null
  }

  const hasOverflow = canScrollLeft || canScrollRight

  return (
    <div className="min-w-0 pt-3">
      <p className="text-xs font-semibold text-slate-950">
        {label}{selected ? `: ${selected}` : ''}
      </p>
      <div className={`mt-2 flex min-w-0 items-center ${hasOverflow ? 'sm:gap-2' : ''}`}>
        {hasOverflow ? (
          <button
            type="button"
            disabled={!canScrollLeft}
            onClick={() => scrollByDirection(-1)}
            aria-label={`Previous ${label} options`}
            className="hidden size-8 shrink-0 items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </button>
        ) : null}
        <div
          ref={scrollerRef}
          tabIndex={0}
          aria-label={`${label} options`}
          className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth overscroll-x-contain pb-1 scrollbar-none [-ms-overflow-style:none] outline-none focus-visible:ring-2 focus-visible:ring-brand/40 [&::-webkit-scrollbar]:hidden"
        >
          {values.map((value) => (
            <div key={value} className="snap-start">
              {showImages ? (
                <OptionImageButton
                  value={value}
                  selected={isSameVariantOption(selected, value)}
                  imageSrc={resolveImage(value)}
                  onSelect={onSelect}
                />
              ) : (
                <OptionChipButton
                  value={value}
                  selected={isSameVariantOption(selected, value)}
                  onSelect={onSelect}
                />
              )}
            </div>
          ))}
        </div>
        {hasOverflow ? (
          <button
            type="button"
            disabled={!canScrollRight}
            onClick={() => scrollByDirection(1)}
            aria-label={`Next ${label} options`}
            className="hidden size-8 shrink-0 items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
          >
            <ChevronRight className="size-4" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
