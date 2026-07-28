import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'

const SWIPE_THRESHOLD = 48
export const MIN_ZOOM = 1
export const MAX_ZOOM = 3
export const ZOOM_STEP = 0.25

const controlButtonClass =
  'flex items-center justify-center rounded-full bg-black/50 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-40'

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
  hasMultiple = false,
  currentIndex = 0,
  imageCount = 1,
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
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onPrev()
      if (event.key === 'ArrowRight') onNext()
      if (event.key === '+' || event.key === '=') {
        onZoomChange((value) => clampZoom(value + ZOOM_STEP))
      }
      if (event.key === '-') {
        onZoomChange((value) => clampZoom(value - ZOOM_STEP))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose, onNext, onPrev, onZoomChange])

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

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/92"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image viewer`}
      onClick={onClose}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-3 text-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className={`${controlButtonClass} size-10`}
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
            className={`${controlButtonClass} size-10`}
          >
            <ZoomIn className="size-5" />
          </button>
        </div>

        {hasMultiple && imageCount > 1 ? (
          <span className="text-sm font-semibold tabular-nums text-white/90">
            {currentIndex + 1} / {imageCount}
          </span>
        ) : (
          <span className="truncate px-2 text-sm font-medium text-white/80">{title}</span>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className={`${controlButtonClass} size-10`}
        >
          <X className="size-5" />
        </button>
      </div>

      <div
        ref={viewportRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-14 py-4 sm:px-20"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hasMultiple && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous image"
            className={`${controlButtonClass} absolute left-3 top-1/2 z-10 size-11 -translate-y-1/2 sm:left-5`}
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
            className={`${controlButtonClass} absolute right-3 top-1/2 z-10 size-11 -translate-y-1/2 sm:right-5`}
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}
