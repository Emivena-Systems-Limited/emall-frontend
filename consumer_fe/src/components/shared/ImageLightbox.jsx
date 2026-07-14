import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'

const SWIPE_THRESHOLD = 48
export const MIN_ZOOM = 1
export const MAX_ZOOM = 3
export const ZOOM_STEP = 0.25

export function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

export default function ImageLightbox({
  image,
  title,
  zoom,
  onZoomChange,
  onClose,
  onPrev,
  onNext,
  hasMultiple,
}) {
  const viewportRef = useRef(null)
  const touchStartRef = useRef(null)

  const zoomIn = () => onZoomChange((value) => clampZoom(value + ZOOM_STEP))
  const zoomOut = () => onZoomChange((value) => clampZoom(value - ZOOM_STEP))

  const handleTouchStart = (event) => {
    touchStartRef.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    }
  }

  const handleTouchEnd = (event) => {
    if (!touchStartRef.current || !hasMultiple || zoom > 1) {
      touchStartRef.current = null
      return
    }

    const deltaX = event.changedTouches[0].clientX - touchStartRef.current.x
    const deltaY = event.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return

    if (deltaX > 0) onPrev()
    else onNext()
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined

    const handleWheel = (event) => {
      event.preventDefault()
      onZoomChange((value) => (
        event.deltaY < 0
          ? clampZoom(value + ZOOM_STEP)
          : clampZoom(value - ZOOM_STEP)
      ))
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', handleWheel)
  }, [onZoomChange])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/92"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image viewer`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ZoomOut className="size-5" />
          </button>
          <span className="min-w-12 text-center text-sm font-semibold tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ZoomIn className="size-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="size-5" />
        </button>
      </div>

      <div
        ref={viewportRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-14 py-4 sm:px-20"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hasMultiple && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:left-5"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        <img
          src={image}
          alt={title}
          draggable={false}
          className="max-h-full max-w-full select-none object-contain transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoom})` }}
        />

        {hasMultiple && (
          <button
            type="button"
            onClick={onNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:right-5"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>
    </div>
  )
}
