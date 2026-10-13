import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { isSameVariantOption } from '../../utils/productVariantFields'

function OptionImageButton({ value, selected, imageSrc, onSelect, compact = false }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onSelect(value)}
        aria-pressed={selected}
        title={value}
        className={`relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border bg-slate-50 transition outline-none focus-visible:ring-2 focus-visible:ring-nav-red/30 ${
          selected
            ? 'border-nav-red ring-2 ring-nav-red/15'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {imageSrc ? (
          <img src={imageSrc} alt="" className="size-full object-contain p-1" />
        ) : (
          <span className="flex size-full items-center justify-center px-1 text-[0.625rem] font-semibold text-slate-500">
            {value}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={`w-[4.75rem] shrink-0 border bg-white p-1 text-center transition-colors sm:w-24 ${
        selected ? 'border-auth-primary ring-1 ring-auth-primary' : 'border-slate-200 hover:border-slate-300'
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

function OptionChipButton({ value, selected, onSelect, compact = false }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      title={value}
      className={compact
        ? `inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full border px-3.5 text-xs font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-nav-red/30 ${
          selected
            ? 'border-nav-red bg-nav-red text-white'
            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
        }`
        : `inline-flex min-h-12 min-w-[5.5rem] shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl border-2 px-4 py-3 text-sm font-semibold leading-snug transition-colors outline-none focus-visible:ring-2 focus-visible:ring-auth-primary/40 focus-visible:ring-offset-1 sm:min-h-[3.25rem] sm:px-5 sm:text-[0.9375rem] ${
          selected
            ? 'border-auth-primary bg-red-50 text-auth-primary shadow-[inset_0_0_0_1px_rgba(199,59,45,0.35)]'
            : 'border-slate-200 bg-white text-slate-800 hover:border-auth-primary/50 hover:bg-slate-50 hover:text-slate-950'
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
  size = 'default',
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

  const compact = size === 'compact'

  return (
    <div className={`min-w-0 ${compact ? 'pt-2.5' : 'pt-3'}`}>
      <p className={compact ? 'text-xs font-semibold text-slate-800' : 'text-sm font-bold text-slate-950'}>
        {label}{selected ? `: ${selected}` : ''}
      </p>
      <div className={`flex min-w-0 items-center ${compact ? 'mt-1.5' : 'mt-2.5'} ${hasOverflow ? 'sm:gap-2' : ''}`}>
        {hasOverflow ? (
          <button
            type="button"
            disabled={!canScrollLeft}
            onClick={() => scrollByDirection(-1)}
            aria-label={`Previous ${label} options`}
            className="hidden size-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
          >
            <ChevronLeft className="size-5" strokeWidth={2} />
          </button>
        ) : null}
        <div
          ref={scrollerRef}
          tabIndex={0}
          aria-label={`${label} options`}
          className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth overscroll-x-contain py-0.5 scrollbar-none [-ms-overflow-style:none] outline-none focus-visible:ring-2 focus-visible:ring-auth-primary/40 [&::-webkit-scrollbar]:hidden"
        >
          {values.map((value) => (
            <div key={value} className="snap-start">
              {showImages ? (
                <OptionImageButton
                  value={value}
                  selected={isSameVariantOption(selected, value)}
                  imageSrc={resolveImage(value)}
                  onSelect={onSelect}
                  compact={size === 'compact'}
                />
              ) : (
                <OptionChipButton
                  value={value}
                  selected={isSameVariantOption(selected, value)}
                  onSelect={onSelect}
                  compact={size === 'compact'}
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
            className="hidden size-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
          >
            <ChevronRight className="size-5" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
