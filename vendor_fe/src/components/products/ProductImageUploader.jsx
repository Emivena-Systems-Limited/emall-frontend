import { useRef, useState } from 'react'
import { GripVertical, ImagePlus, Trash2, Upload } from 'lucide-react'
import FieldError from '../auth/FieldError'
import notify from '../../lib/notify'
import {
  createProductImageFromFile,
  formatImageStorageSize,
  getProductImageLimitsSummary,
  pickProductImageFiles,
  revokeProductImagePreview,
} from '../../utils/productImageUtils'

const IMAGE_HINT = 'JPG or PNG · Up to 5 images total · 5MB combined'

export default function ProductImageUploader({
  images,
  onChange,
  error,
  mainImage = null,
}) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const limits = getProductImageLimitsSummary(mainImage, images)
  const atImageLimit = limits.remainingSlots <= 0

  const processFiles = (fileList) => {
    const { accepted, notices } = pickProductImageFiles({
      mainImage,
      subImages: images,
      files: Array.from(fileList),
      target: 'gallery',
    })

    notices.forEach((message) => notify.error(message))

    if (accepted.length === 0) return

    onChange([...images, ...accepted.map(createProductImageFromFile)])
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
      notify.error(`You can upload at most ${limits.maxCount} images (including the main photo).`)
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
    <div data-field="sub_product_images" className="space-y-4">
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
            notify.error(`You can upload at most ${limits.maxCount} images (including the main photo).`)
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
          accept="image/jpeg,image/png"
          multiple
          disabled={atImageLimit}
          onChange={(event) => { processFiles(event.target.files); event.target.value = '' }}
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
            <p className="text-sm font-semibold text-slate-800">Drag & drop or click to upload gallery photos</p>
            <p className="mt-1 text-xs text-slate-500">{IMAGE_HINT}</p>
          </div>
        ) : (
          <p className="text-xs font-semibold text-slate-500">
            {atImageLimit
              ? 'Maximum image count reached'
              : 'Click or drop to add more gallery photos'}
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
              className={`group relative size-24 shrink-0 overflow-hidden rounded-lg sm:size-28 ${
                draggingIndex === index
                  ? 'cursor-grabbing opacity-40 ring-2 ring-slate-300'
                  : overIndex === index && draggingIndex !== index
                    ? 'scale-105 cursor-grab ring-2 ring-brand'
                    : 'cursor-grab ring-1 ring-slate-200 hover:ring-slate-300 active:cursor-grabbing'
              }`}
            >
              <img
                src={img.preview}
                alt={`Gallery image ${index + 1}`}
                draggable={false}
                className="pointer-events-none size-full object-cover select-none"
              />
              <div className="absolute inset-0 flex cursor-grab items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); removeImage(img.id) }}
                  className="cursor-pointer rounded-md bg-white p-1 text-red-600 shadow-sm transition-colors hover:bg-red-50"
                  aria-label={`Remove gallery image ${index + 1}`}
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

      {error && <FieldError message={error} />}
      {!error && (
        <p className="text-xs text-slate-400">
          {limits.count} of {limits.maxCount} images · {formatImageStorageSize(limits.bytes)} of {formatImageStorageSize(limits.maxBytes)} used
          {images.length > 0 ? ' · Drag gallery photos to reorder' : ''}
        </p>
      )}
    </div>
  )
}
