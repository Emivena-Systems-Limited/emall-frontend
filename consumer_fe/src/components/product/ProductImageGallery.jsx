import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import ImageLightbox, { clampZoom, ZOOM_STEP } from '../shared/ImageLightbox'

const SWIPE_THRESHOLD = 48

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
