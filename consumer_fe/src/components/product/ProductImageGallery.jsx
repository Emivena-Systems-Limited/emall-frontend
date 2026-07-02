import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react'

const SWIPE_THRESHOLD = 48
const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.25

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function ImageLightbox({
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
  const didSwipeRef = useRef(false)

  const zoomIn = () => onZoomChange((value) => clampZoom(value + ZOOM_STEP))
  const zoomOut = () => onZoomChange((value) => clampZoom(value - ZOOM_STEP))

  const handleTouchStart = (event) => {
    didSwipeRef.current = false
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

    didSwipeRef.current = true
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

export default function ProductImageGallery({
  images = [],
  title = '',
  activeImage,
  onActiveImageChange,
}) {
  const gallery = images.filter(Boolean)
  const activeIndex = gallery.findIndex((image) => image === (activeImage || gallery[0]))
  const currentIndex = activeIndex >= 0 ? activeIndex : 0
  const currentImage = gallery[currentIndex]

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const touchStartRef = useRef(null)
  const didSwipeRef = useRef(false)

  const goToIndex = useCallback((index) => {
    const nextImage = gallery[index]
    if (nextImage) onActiveImageChange(nextImage)
  }, [gallery, onActiveImageChange])

  const goPrev = useCallback(() => {
    if (gallery.length <= 1) return
    setZoom(1)
    goToIndex((currentIndex - 1 + gallery.length) % gallery.length)
  }, [currentIndex, gallery.length, goToIndex])

  const goNext = useCallback(() => {
    if (gallery.length <= 1) return
    setZoom(1)
    goToIndex((currentIndex + 1) % gallery.length)
  }, [currentIndex, gallery.length, goToIndex])

  const openLightbox = () => {
    setZoom(1)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setZoom(1)
  }

  useEffect(() => {
    if (!lightboxOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
      if (event.key === '+' || event.key === '=') setZoom((value) => clampZoom(value + ZOOM_STEP))
      if (event.key === '-') setZoom((value) => clampZoom(value - ZOOM_STEP))
    }

    window.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [lightboxOpen, goPrev, goNext])

  const handleTouchStart = (event) => {
    didSwipeRef.current = false
    touchStartRef.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    }
  }

  const handleTouchEnd = (event) => {
    if (!touchStartRef.current || gallery.length <= 1) {
      touchStartRef.current = null
      return
    }

    const deltaX = event.changedTouches[0].clientX - touchStartRef.current.x
    const deltaY = event.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return

    didSwipeRef.current = true
    if (deltaX > 0) goPrev()
    else goNext()
  }

  const handleMainImageClick = () => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false
      return
    }
    openLightbox()
  }

  if (!gallery.length || !currentImage) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-white text-slate-300 sm:aspect-[1.45]">
        No image
      </div>
    )
  }

  const controlButtonClass =
    'pointer-events-auto absolute z-10 flex size-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-[0_2px_12px_rgba(15,23,42,0.18)] transition-all duration-200 hover:bg-white hover:scale-105 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-primary/40 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'

  return (
    <>
      <div className="space-y-3">
        <div
          className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-white sm:aspect-[1.45]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            className="relative z-0 flex size-full cursor-zoom-in items-center justify-center p-1"
            onClick={handleMainImageClick}
            aria-label="View larger image"
          >
            <img
              src={currentImage}
              alt={title}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain motion-safe:scale-[1.03]"
            />
          </button>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goPrev()
                }}
                aria-label="Previous image"
                className={`${controlButtonClass} left-3 top-1/2 -translate-y-1/2`}
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goNext()
                }}
                aria-label="Next image"
                className={`${controlButtonClass} right-3 top-1/2 -translate-y-1/2`}
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              openLightbox()
            }}
            aria-label="Open fullscreen"
            className={`${controlButtonClass} right-3 top-3`}
          >
            <Maximize2 className="size-4" />
          </button>
        </div>

        {gallery.length > 1 && (
          <div className="flex justify-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {gallery.map((image, index) => {
              const isActive = currentImage === image

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setZoom(1)
                    onActiveImageChange(image)
                  }}
                  aria-label={`View image ${index + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`size-14 shrink-0 overflow-hidden rounded-xl bg-white p-1 transition-all sm:size-16 ${
                    isActive
                      ? 'shadow-[0_4px_16px_rgba(15,23,42,0.22)] ring-2 ring-white'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="size-full rounded-lg object-cover"
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          image={currentImage}
          title={title}
          zoom={zoom}
          onZoomChange={setZoom}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
          hasMultiple={gallery.length > 1}
        />
      )}
    </>
  )
}
