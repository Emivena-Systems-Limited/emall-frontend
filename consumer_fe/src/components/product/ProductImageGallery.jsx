import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Share2 } from 'lucide-react'
import ImageLightbox from '../shared/ImageLightbox'

const SWIPE_THRESHOLD = 48
const MIN_SCALE = 1
const MAX_SCALE = 3

const HOVER_ZOOM_FACTOR = 2.5
const HOVER_ZOOM_PANEL_WIDTH = 520
const HOVER_ZOOM_GAP = 16
/** Keep the side zoom panel shorter than the viewport so it never feels full-screen. */
const HOVER_ZOOM_MAX_VIEWPORT_RATIO = 0.82

const imageEase = [0.22, 1, 0.36, 1]

const slideVariants = {
  enter: (direction) => ({
    x: direction === 0 ? 0 : direction > 0 ? '55%' : '-55%',
    opacity: 0,
    scale: direction === 0 ? 0.98 : 1,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    x: direction === 0 ? 0 : direction > 0 ? '-55%' : '55%',
    opacity: 0,
    scale: direction === 0 ? 0.98 : 1,
  }),
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/** Positions the floating zoom panel beside the image, flipping to the
 *  opposite side (and clamping to the viewport) when there isn't room. */
function computeHoverZoomPanelRect(containerRect) {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const width = Math.min(HOVER_ZOOM_PANEL_WIDTH, viewportWidth - HOVER_ZOOM_GAP * 2)
  const height = Math.min(
    containerRect.height,
    viewportHeight - HOVER_ZOOM_GAP * 2,
    viewportHeight * HOVER_ZOOM_MAX_VIEWPORT_RATIO,
  )

  let left = containerRect.right + HOVER_ZOOM_GAP
  if (left + width > viewportWidth - HOVER_ZOOM_GAP) {
    left = containerRect.left - width - HOVER_ZOOM_GAP
  }
  left = clamp(left, HOVER_ZOOM_GAP, Math.max(HOVER_ZOOM_GAP, viewportWidth - width - HOVER_ZOOM_GAP))

  const top = clamp(
    containerRect.top,
    HOVER_ZOOM_GAP,
    Math.max(HOVER_ZOOM_GAP, viewportHeight - height - HOVER_ZOOM_GAP),
  )

  return { left, top, width, height }
}

function clampOffset(offset, scale, containerWidth, containerHeight, imageWidth, imageHeight) {
  if (scale <= 1) return { x: 0, y: 0 }

  const scaledWidth = imageWidth * scale
  const scaledHeight = imageHeight * scale
  const maxX = Math.max(0, (scaledWidth - containerWidth) / 2)
  const maxY = Math.max(0, (scaledHeight - containerHeight) / 2)

  return {
    x: clamp(offset.x, -maxX, maxX),
    y: clamp(offset.y, -maxY, maxY),
  }
}

export default function ProductImageGallery({
  images = [],
  title = '',
  activeImage,
  onActiveImageChange,
  onShare,
  onWishlist,
  isWishlisted = false,
}) {
  const gallery = images.filter(Boolean)
  const activeIndex = gallery.findIndex((image) => image === (activeImage || gallery[0]))
  const currentIndex = activeIndex >= 0 ? activeIndex : 0
  const currentImage = gallery[currentIndex]

  const viewportRef = useRef(null)
  const imageRef = useRef(null)
  const touchStartRef = useRef(null)
  const pinchStartRef = useRef(null)
  const panStartRef = useRef(null)
  const didSwipeRef = useRef(false)
  const didPanRef = useRef(false)
  const suppressClickRef = useRef(false)

  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [slideDirection, setSlideDirection] = useState(0)
  const [zoomTransition, setZoomTransition] = useState(false)
  const [supportsHoverZoom, setSupportsHoverZoom] = useState(false)
  const [hoverZoom, setHoverZoom] = useState(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxZoom, setLightboxZoom] = useState(1)
  const [renderedImage, setRenderedImage] = useState(currentImage)
  const hoverZoomPausedRef = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0 })

  if (currentImage !== renderedImage) {
    setRenderedImage(currentImage)
    setScale(1)
    setOffset({ x: 0, y: 0 })
    setHoverZoom(null)
  }

  const toggleZoom = useCallback(() => {
    setZoomTransition(true)
    setScale((current) => {
      const next = current > 1 ? MIN_SCALE : 2
      if (next <= MIN_SCALE) setOffset({ x: 0, y: 0 })
      return next
    })
    window.setTimeout(() => setZoomTransition(false), 260)
  }, [])

  const resetTransform = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const goToIndex = useCallback((index, direction = 0) => {
    const nextImage = gallery[index]
    if (!nextImage) return
    setSlideDirection(direction)
    resetTransform()
    onActiveImageChange(nextImage)
  }, [gallery, onActiveImageChange, resetTransform])

  const goPrev = useCallback(() => {
    if (gallery.length <= 1) return
    goToIndex((currentIndex - 1 + gallery.length) % gallery.length, -1)
  }, [currentIndex, gallery.length, goToIndex])

  const goNext = useCallback(() => {
    if (gallery.length <= 1) return
    goToIndex((currentIndex + 1) % gallery.length, 1)
  }, [currentIndex, gallery.length, goToIndex])

  const openLightbox = useCallback(() => {
    setLightboxZoom(1)
    setIsLightboxOpen(true)
    setHoverZoom(null)
  }, [])

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false)
    setLightboxZoom(1)
  }, [])

  const lightboxPrev = useCallback(() => {
    setLightboxZoom(1)
    goPrev()
  }, [goPrev])

  const lightboxNext = useCallback(() => {
    setLightboxZoom(1)
    goNext()
  }, [goNext])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setSupportsHoverZoom(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  const updateHoverZoom = useCallback((clientX, clientY) => {
    const container = viewportRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = clamp(clientX - rect.left, 0, rect.width)
    const y = clamp(clientY - rect.top, 0, rect.height)

    const lensWidth = rect.width / HOVER_ZOOM_FACTOR
    const lensHeight = rect.height / HOVER_ZOOM_FACTOR

    setHoverZoom({
      lensX: clamp(x - lensWidth / 2, 0, rect.width - lensWidth),
      lensY: clamp(y - lensHeight / 2, 0, rect.height - lensHeight),
      lensWidth,
      lensHeight,
      bgPosX: (x / rect.width) * 100,
      bgPosY: (y / rect.height) * 100,
      panelRect: computeHoverZoomPanelRect(rect),
    })
  }, [])

  const handleMouseEnter = (event) => {
    if (!supportsHoverZoom) return
    hoverZoomPausedRef.current = false
    lastPointerRef.current = { x: event.clientX, y: event.clientY }
    updateHoverZoom(event.clientX, event.clientY)
  }

  const handleMouseMove = (event) => {
    if (!supportsHoverZoom) return

    const { x: lastX, y: lastY } = lastPointerRef.current
    const movedFarEnough = Math.hypot(event.clientX - lastX, event.clientY - lastY) >= 3
    lastPointerRef.current = { x: event.clientX, y: event.clientY }

    // After a wheel scroll, ignore tiny pointer jitter so the page can scroll
    // freely (Amazon-style) until the user intentionally moves the cursor.
    if (hoverZoomPausedRef.current) {
      if (!movedFarEnough) return
      hoverZoomPausedRef.current = false
    }

    updateHoverZoom(event.clientX, event.clientY)
  }

  const handleMouseLeave = () => {
    if (!supportsHoverZoom) return
    hoverZoomPausedRef.current = false
    setHoverZoom(null)
  }

  const handleHoverWheel = () => {
    if (!supportsHoverZoom) return
    // Let the browser scroll the page; just hide the zoom overlay.
    hoverZoomPausedRef.current = true
    setHoverZoom(null)
  }

  useEffect(() => {
    if (!hoverZoom) return undefined
    const dismiss = () => {
      hoverZoomPausedRef.current = true
      setHoverZoom(null)
    }
    window.addEventListener('scroll', dismiss, { passive: true, capture: true })
    window.addEventListener('resize', dismiss)
    return () => {
      window.removeEventListener('scroll', dismiss, true)
      window.removeEventListener('resize', dismiss)
    }
  }, [hoverZoom])

  const handleTouchStart = (event) => {
    didSwipeRef.current = false
    didPanRef.current = false
    suppressClickRef.current = false

    if (event.touches.length === 2) {
      const [a, b] = event.touches
      pinchStartRef.current = {
        distance: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
        scale,
      }
      panStartRef.current = null
      touchStartRef.current = null
      return
    }

    if (event.touches.length === 1) {
      if (scale > 1) {
        panStartRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
          offsetX: offset.x,
          offsetY: offset.y,
        }
        touchStartRef.current = null
        return
      }

      touchStartRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      }
    }
  }

  const handleTouchMove = (event) => {
    if (event.touches.length === 2 && pinchStartRef.current) {
      event.preventDefault()
      const [a, b] = event.touches
      const distance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const nextScale = clamp(
        pinchStartRef.current.scale * (distance / pinchStartRef.current.distance),
        MIN_SCALE,
        MAX_SCALE,
      )
      setScale(nextScale)
      if (nextScale <= 1) setOffset({ x: 0, y: 0 })
      return
    }

    if (event.touches.length === 1 && panStartRef.current && scale > 1) {
      event.preventDefault()
      const deltaX = event.touches[0].clientX - panStartRef.current.x
      const deltaY = event.touches[0].clientY - panStartRef.current.y
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        didPanRef.current = true
      }
      const viewport = viewportRef.current
      const image = imageRef.current

      if (viewport && image) {
        const bounds = clampOffset(
          {
            x: panStartRef.current.offsetX + deltaX,
            y: panStartRef.current.offsetY + deltaY,
          },
          scale,
          viewport.clientWidth,
          viewport.clientHeight,
          image.clientWidth,
          image.clientHeight,
        )
        setOffset(bounds)
      }
    }
  }

  const handleTouchEnd = (event) => {
    pinchStartRef.current = null

    if (touchStartRef.current) {
      const deltaX = event.changedTouches[0].clientX - touchStartRef.current.x
      const deltaY = event.changedTouches[0].clientY - touchStartRef.current.y
      touchStartRef.current = null

      const isSwipe = Math.abs(deltaX) >= SWIPE_THRESHOLD && Math.abs(deltaX) >= Math.abs(deltaY)
      if (isSwipe && gallery.length > 1 && scale <= 1) {
        didSwipeRef.current = true
        if (deltaX > 0) goPrev()
        else goNext()
        panStartRef.current = null
        return
      }

      if (!didPanRef.current && Math.hypot(deltaX, deltaY) < SWIPE_THRESHOLD) {
        toggleZoom()
        suppressClickRef.current = true
      }
      panStartRef.current = null
      return
    }

    if (panStartRef.current && scale > 1 && !didPanRef.current) {
      toggleZoom()
      suppressClickRef.current = true
    }

    panStartRef.current = null
  }

  const handlePointerDown = (event) => {
    if (event.pointerType === 'touch') return

    didPanRef.current = false

    if (scale <= 1) return

    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
      pointerId: event.pointerId,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!panStartRef.current || panStartRef.current.pointerId !== event.pointerId || scale <= 1) return

    const deltaX = event.clientX - panStartRef.current.x
    const deltaY = event.clientY - panStartRef.current.y
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      didPanRef.current = true
    }
    const viewport = viewportRef.current
    const image = imageRef.current

    if (viewport && image) {
      const bounds = clampOffset(
        {
          x: panStartRef.current.offsetX + deltaX,
          y: panStartRef.current.offsetY + deltaY,
        },
        scale,
        viewport.clientWidth,
        viewport.clientHeight,
        image.clientWidth,
        image.clientHeight,
      )
      setOffset(bounds)
    }
  }

  const handlePointerUp = (event) => {
    if (panStartRef.current?.pointerId === event.pointerId) {
      panStartRef.current = null
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleImageClick = () => {
    if (supportsHoverZoom) {
      openLightbox()
      return
    }
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    if (didSwipeRef.current || didPanRef.current) {
      didSwipeRef.current = false
      didPanRef.current = false
      return
    }
    toggleZoom()
  }

  if (!gallery.length || !currentImage) {
    return (
      <div className="flex aspect-square w-full min-h-72 items-center justify-center rounded-2xl bg-white text-slate-300 sm:min-h-84 sm:aspect-[1.15]">
        No image
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        ref={viewportRef}
        className={`relative aspect-square w-full min-h-72 overflow-hidden rounded-2xl bg-white sm:min-h-84 sm:aspect-[1.15] ${
          supportsHoverZoom ? '' : 'touch-none overscroll-contain'
        }`}
        style={supportsHoverZoom ? undefined : { touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onWheel={handleHoverWheel}
      >
        <button
          type="button"
          aria-label={supportsHoverZoom ? 'View full size image' : scale > 1 ? 'Zoom out image' : 'Zoom in image'}
          onClick={handleImageClick}
          className="relative flex size-full items-center justify-center overflow-hidden p-6 sm:p-8 lg:p-10"
          style={{ cursor: supportsHoverZoom ? 'zoom-in' : scale > 1 ? 'grab' : 'zoom-in' }}
        >
          <AnimatePresence initial={false} custom={slideDirection}>
            <motion.div
              key={currentImage}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 280, damping: 32, mass: 0.85 },
                opacity: { duration: 0.28, ease: imageEase },
                scale: { duration: 0.28, ease: imageEase },
              }}
              className="absolute inset-0 flex items-center justify-center p-6 sm:p-8 lg:p-10"
            >
              <div
                ref={imageRef}
                className="flex max-h-[88%] max-w-[88%] items-center justify-center"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transformOrigin: 'center center',
                  transition: zoomTransition ? 'transform 0.25s ease' : 'none',
                }}
              >
                <img
                  src={currentImage}
                  alt={title}
                  draggable={false}
                  className="max-h-full max-w-full min-h-0 min-w-0 select-none object-contain"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </button>

        {supportsHoverZoom && hoverZoom && (
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-sm border-2 border-auth-primary/80 bg-white/30 shadow-[0_0_0_1px_rgba(255,255,255,0.6)]"
            style={{
              left: hoverZoom.lensX,
              top: hoverZoom.lensY,
              width: hoverZoom.lensWidth,
              height: hoverZoom.lensHeight,
            }}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end gap-2 p-3 sm:p-4">
          {onShare && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onShare()
              }}
              aria-label="Share product"
              className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-[0_2px_12px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-110 hover:bg-white hover:text-auth-primary hover:shadow-[0_8px_20px_rgba(15,23,42,0.22)] active:scale-95"
            >
              <Share2 className="size-4" strokeWidth={2.2} />
            </button>
          )}
          {onWishlist && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onWishlist()
              }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
              className={`pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/95 shadow-[0_2px_12px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-110 hover:bg-white hover:shadow-[0_8px_20px_rgba(15,23,42,0.22)] active:scale-95 ${
                isWishlisted
                  ? 'text-auth-primary'
                  : 'text-slate-700 hover:text-auth-primary'
              }`}
            >
              <Heart
                className={`size-4 ${isWishlisted ? 'fill-auth-primary text-auth-primary' : ''}`}
                strokeWidth={2.2}
              />
            </button>
          )}
        </div>
      </div>

      {supportsHoverZoom && hoverZoom && typeof document !== 'undefined' && createPortal(
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.28)] lg:block"
          style={{
            left: hoverZoom.panelRect.left,
            top: hoverZoom.panelRect.top,
            width: hoverZoom.panelRect.width,
            height: hoverZoom.panelRect.height,
            backgroundImage: `url("${currentImage}")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${HOVER_ZOOM_FACTOR * 100}%`,
            backgroundPosition: `${hoverZoom.bgPosX}% ${hoverZoom.bgPosY}%`,
          }}
        />,
        document.body,
      )}

      {supportsHoverZoom && (
        <button
          type="button"
          onClick={openLightbox}
          className="block text-center text-sm font-medium text-auth-primary hover:underline"
        >
          Click to see full view
        </button>
      )}

      {isLightboxOpen && currentImage && (
        <ImageLightbox
          image={currentImage}
          title={title}
          zoom={lightboxZoom}
          onZoomChange={setLightboxZoom}
          onClose={closeLightbox}
          onPrev={lightboxPrev}
          onNext={lightboxNext}
          hasMultiple={gallery.length > 1}
          currentIndex={currentIndex}
          imageCount={gallery.length}
        />
      )}

      {gallery.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto px-1 py-1.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {gallery.map((image, index) => {
            const isActive = currentImage === image

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => goToIndex(index, index > currentIndex ? 1 : index < currentIndex ? -1 : 0)}
                aria-label={`View image ${index + 1}`}
                aria-current={isActive ? 'true' : undefined}
                className={`size-14 shrink-0 rounded-xl bg-white p-1 transition-all sm:size-16 ${
                  isActive
                    ? 'border-2 border-auth-primary shadow-[0_4px_16px_rgba(15,23,42,0.22)]'
                    : 'border-2 border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <span className="block size-full overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt=""
                    className="size-full object-contain"
                  />
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
