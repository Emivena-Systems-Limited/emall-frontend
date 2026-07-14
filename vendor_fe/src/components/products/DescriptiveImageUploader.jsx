import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, GripVertical, ImagePlus, Info, Trash2, Upload } from 'lucide-react'
import FieldError from '../auth/FieldError'
import notify from '../../lib/notify'
import {
  DESCRIPTIVE_IMAGE_RECOMMENDED_LABEL,
  MAX_DESCRIPTIVE_IMAGE_COUNT,
  MAX_DESCRIPTIVE_IMAGE_FILE_BYTES,
  MAX_DESCRIPTIVE_IMAGES_TOTAL_BYTES,
} from '../../constants/products'
import {
  createProductImageFromFile,
  evaluateDescriptiveImageDimensions,
  formatImageStorageSize,
  getDescriptiveDimensionGuidance,
  getStandaloneImageLimitsSummary,
  pickDescriptiveImageFiles,
  readImageFileDimensions,
  readImageUrlDimensions,
  revokeProductImagePreview,
} from '../../utils/productImageUtils'

function DescriptiveImageGuidance() {
  const guidance = getDescriptiveDimensionGuidance()

  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sky-600 ring-1 ring-sky-100">
          <Info className="size-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">Recommended size for descriptive images</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            These photos appear in a 2×2 grid on your product page. Upload wide landscape images close to{' '}
            <span className="font-semibold text-slate-800">{DESCRIPTIVE_IMAGE_RECOMMENDED_LABEL}</span>
            {' '}so they fill each slot without awkward cropping.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-sky-100">
              <p className="text-[0.625rem] font-bold uppercase tracking-wide text-slate-400">Target</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{DESCRIPTIVE_IMAGE_RECOMMENDED_LABEL}</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-sky-100">
              <p className="text-[0.625rem] font-bold uppercase tracking-wide text-slate-400">Accepted width</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {guidance.minWidth}–{guidance.maxWidth} px
              </p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-sky-100">
              <p className="text-[0.625rem] font-bold uppercase tracking-wide text-slate-400">Accepted height</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {guidance.minHeight}–{guidance.maxHeight} px
              </p>
            </div>
          </div>
          <p className="mt-3 text-[0.6875rem] leading-relaxed text-slate-500">
            Exact pixels are not required — close is fine. Avoid square or portrait photos; wide landscape works best.
          </p>
        </div>
      </div>
    </div>
  )
}

function DimensionBadge({ image }) {
  if (!image.width || !image.height) {
    return (
      <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[0.5625rem] font-semibold text-white">
        Checking…
      </span>
    )
  }

  const result = evaluateDescriptiveImageDimensions(image.width, image.height)
  const toneClass = result.status === 'ideal'
    ? 'bg-emerald-600'
    : result.status === 'acceptable'
      ? 'bg-amber-500'
      : 'bg-red-600'

  return (
    <span className={`absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[0.5625rem] font-semibold text-white ${toneClass}`}>
      {result.dimensionLabel}
    </span>
  )
}

export default function DescriptiveImageUploader({
  images,
  onChange,
  error,
  dataField = 'descriptive_product_images',
}) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const limits = getStandaloneImageLimitsSummary(images, {
    maxCount: MAX_DESCRIPTIVE_IMAGE_COUNT,
    maxBytes: MAX_DESCRIPTIVE_IMAGES_TOTAL_BYTES,
  })
  const atImageLimit = limits.remainingSlots <= 0

  useEffect(() => {
    let cancelled = false

    const hydrateDimensions = async () => {
      const needsDimensions = images.filter(
        (image) => (!image.width || !image.height) && !image.dimensionsChecked,
      )
      if (needsDimensions.length === 0) return

      const updates = await Promise.all(
        needsDimensions.map(async (image) => {
          try {
            if (image.file) {
              const dimensions = await readImageFileDimensions(image.file)
              return { id: image.id, ...dimensions, dimensionsChecked: true }
            }

            const preview = String(image.preview ?? '').trim()
            if (preview) {
              const dimensions = await readImageUrlDimensions(preview)
              return { id: image.id, ...dimensions, dimensionsChecked: true }
            }
          } catch {
            return { id: image.id, width: null, height: null, dimensionsChecked: true }
          }

          return { id: image.id, width: null, height: null, dimensionsChecked: true }
        }),
      )

      if (cancelled) return

      const dimensionMap = new Map(updates.map((entry) => [entry.id, entry]))

      onChange(
        images.map((image) => {
          const next = dimensionMap.get(image.id)
          if (!next) return image
          return { ...image, ...next }
        }),
      )
    }

    hydrateDimensions()

    return () => {
      cancelled = true
    }
  }, [images, onChange])

  const processFiles = async (fileList) => {
    const files = Array.from(fileList)
    const { accepted, notices } = pickDescriptiveImageFiles({ images, files })

    notices.forEach((message) => notify.error(message))
    if (accepted.length === 0) return

    const nextImages = [...images]

    for (const file of accepted) {
      try {
        const { width, height } = await readImageFileDimensions(file)
        const result = evaluateDescriptiveImageDimensions(width, height)

        if (!result.valid) {
          notify.error(result.message)
          continue
        }

        nextImages.push(createProductImageFromFile(file, { width, height }))
      } catch {
        notify.error('Could not read one of the selected images. Try a different JPG or PNG file.')
      }
    }

    if (nextImages.length > images.length) {
      onChange(nextImages)
    }
  }

  const removeImage = (id) => {
    const img = images.find((item) => item.id === id)
    if (img) revokeProductImagePreview(img)
    onChange(images.filter((item) => item.id !== id))
  }

  const handleZoneDrop = (event) => {
    event.preventDefault()
    setIsDragOver(false)
    if (atImageLimit) {
      notify.error(`You can upload at most ${MAX_DESCRIPTIVE_IMAGE_COUNT} descriptive images.`)
      return
    }
    processFiles(event.dataTransfer.files)
  }

  const handleItemDrop = (event, toIndex) => {
    event.preventDefault()
    event.stopPropagation()
    if (draggingIndex === null || draggingIndex === toIndex) {
      setDraggingIndex(null)
      setOverIndex(null)
      return
    }
    const next = [...images]
    const [moved] = next.splice(draggingIndex, 1)
    next.splice(toIndex, 0, moved)
    onChange(next)
    setDraggingIndex(null)
    setOverIndex(null)
  }

  return (
    <div data-field={dataField} className="space-y-4">
      <DescriptiveImageGuidance />

      <div
        role="button"
        tabIndex={atImageLimit ? -1 : 0}
        aria-disabled={atImageLimit}
        onDragOver={(event) => {
          if (atImageLimit) return
          event.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleZoneDrop}
        onClick={() => {
          if (atImageLimit) {
            notify.error(`You can upload at most ${MAX_DESCRIPTIVE_IMAGE_COUNT} descriptive images.`)
            return
          }
          inputRef.current?.click()
        }}
        onKeyDown={(event) => {
          if (atImageLimit) return
          if (event.key === 'Enter') inputRef.current?.click()
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all ${
          atImageLimit
            ? 'cursor-not-allowed border-slate-200 bg-slate-100/80 px-6 py-5 opacity-70'
            : isDragOver
              ? 'cursor-pointer border-brand bg-brand-light/30 px-6 py-10'
              : images.length === 0
                ? 'cursor-pointer border-slate-200 bg-slate-50/60 px-6 py-12 hover:border-brand/40 hover:bg-brand-light/10'
                : 'cursor-pointer border-slate-200 bg-slate-50/40 px-6 py-5 hover:border-slate-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={atImageLimit}
          onChange={(event) => {
            processFiles(event.target.files)
            event.target.value = ''
          }}
          className="sr-only"
        />
        <span className={`flex size-14 items-center justify-center rounded-2xl ring-1 transition-all ${
          isDragOver ? 'bg-brand text-white ring-brand/30' : 'bg-white text-slate-400 ring-slate-200'
        }`}>
          {images.length === 0
            ? <ImagePlus className="size-6" strokeWidth={1.5} />
            : <Upload className="size-5" strokeWidth={1.75} />}
        </span>
        {images.length === 0 ? (
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">Drag & drop or click to upload descriptive photos</p>
            <p className="mt-1 text-xs text-slate-500">
              JPG or PNG · Near {DESCRIPTIVE_IMAGE_RECOMMENDED_LABEL} · Up to {MAX_DESCRIPTIVE_IMAGE_COUNT} images ·{' '}
              {formatImageStorageSize(MAX_DESCRIPTIVE_IMAGE_FILE_BYTES)} each
            </p>
          </div>
        ) : (
          <p className="text-xs font-semibold text-slate-500">
            {atImageLimit ? 'Maximum image count reached' : 'Click or drop to add more descriptive photos'}
          </p>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDraggingIndex(index)}
              onDragOver={(event) => { event.preventDefault(); setOverIndex(index) }}
              onDrop={(event) => handleItemDrop(event, index)}
              onDragEnd={() => { setDraggingIndex(null); setOverIndex(null) }}
              className={`group relative aspect-[970/600] w-40 min-h-0 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-48 ${
                draggingIndex === index
                  ? 'cursor-grabbing opacity-40 ring-2 ring-slate-300'
                  : overIndex === index && draggingIndex !== index
                    ? 'scale-105 cursor-grab ring-2 ring-brand'
                    : 'cursor-grab ring-1 ring-slate-200 hover:ring-slate-300 active:cursor-grabbing'
              }`}
            >
              <img
                src={img.preview}
                alt={`Descriptive image ${index + 1}`}
                draggable={false}
                className="pointer-events-none size-full object-contain object-center select-none"
              />
              <DimensionBadge image={img} />
              <div className="absolute inset-0 flex cursor-grab items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); removeImage(img.id) }}
                  className="cursor-pointer rounded-md bg-white p-1 text-red-600 shadow-sm transition-colors hover:bg-red-50"
                  aria-label={`Remove descriptive image ${index + 1}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="pointer-events-none absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex size-5 cursor-grab items-center justify-center rounded bg-black/60 text-white">
                  <GripVertical className="size-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-[0.6875rem] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            Green = close to target
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" />
            Amber = acceptable
          </span>
        </div>
      )}

      {error && <FieldError message={error} />}
      {!error && (
        <p className="text-xs text-slate-400">
          {limits.count} of {limits.maxCount} images · {formatImageStorageSize(limits.bytes)} of{' '}
          {formatImageStorageSize(limits.maxBytes)} used
          {images.length > 0 ? ' · Drag descriptive photos to reorder' : ''}
        </p>
      )}
    </div>
  )
}
