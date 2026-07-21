import { useRef, useState } from 'react'
import { GripVertical, ImagePlus, Trash2, Upload } from 'lucide-react'
import {
  createProductImageFromFile,
  isValidProductImageFile,
  revokeProductImagePreview,
} from '../../utils/productImageUtils'
import FieldError from '../auth/FieldError'
import notify from '../../lib/notify'

export default function VariantImageUpload({
  images = [],
  onChange,
  label = 'Variant images',
  hint = 'Required · JPG or PNG · Max 5MB · First image is primary',
  error,
  compact = false,
  maxImages = Infinity,
  thumbnailSizeClass = 'size-16 sm:size-18',
}) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const remainingSlots = Math.max(0, maxImages - images.length)

  const processFiles = async (fileList) => {
    const files = Array.from(fileList).filter(isValidProductImageFile)
    if (files.length === 0) {
      notify.error('Only JPG or PNG images up to 5MB are allowed')
      return
    }

    const accepted = files.slice(0, remainingSlots)
    if (accepted.length < files.length) {
      notify.error(`You can add up to ${maxImages} photos for this value.`)
    }
    if (accepted.length === 0) return

    onChange([...images, ...accepted.map(createProductImageFromFile)])
  }

  const removeImage = (id) => {
    const image = images.find((item) => item.id === id)
    if (image) revokeProductImagePreview(image)
    onChange(images.filter((item) => item.id !== id))
  }

  const handleZoneDrop = (event) => {
    event.preventDefault()
    setIsDragOver(false)
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

  const labelBlock = (
    <div className={compact ? 'mb-2 min-h-13' : 'mb-1.5'}>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {hint && (
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{hint}</p>
      )}
    </div>
  )

  return (
    <div className={`flex h-full flex-col ${compact ? 'rounded-xl border border-slate-200 bg-white p-3' : ''}`}>
      {labelBlock}
      {error && <FieldError message={error} />}

      {remainingSlots > 0 && (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(event) => { event.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleZoneDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed transition-all ${
            isDragOver
              ? 'border-brand bg-brand-light/30 px-4 py-4'
              : images.length === 0
                ? 'border-slate-200 bg-slate-50/50 px-4 py-5 hover:border-brand/40 hover:bg-brand-light/10'
                : 'border-slate-200 bg-slate-50/40 px-4 py-3 hover:border-slate-300'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={(event) => { processFiles(event.target.files); event.target.value = '' }}
            className="sr-only"
          />
          <span className={`flex size-9 items-center justify-center rounded-lg ring-1 ${
            isDragOver ? 'bg-brand text-white ring-brand/30' : 'bg-white text-slate-400 ring-slate-200'
          }`}>
            {images.length === 0
              ? <ImagePlus className="size-4" strokeWidth={1.75} />
              : <Upload className="size-4" strokeWidth={1.75} />}
          </span>
          <span className="text-center text-xs font-semibold text-slate-600">
            {images.length === 0
              ? 'Click or drop variant photos'
              : `Add more photos · ${remainingSlots} slot${remainingSlots === 1 ? '' : 's'} left`}
          </span>
        </div>
      )}

      {images.length > 0 && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => setDraggingIndex(index)}
                onDragOver={(event) => { event.preventDefault(); setOverIndex(index) }}
                onDrop={(event) => handleItemDrop(event, index)}
                onDragEnd={() => { setDraggingIndex(null); setOverIndex(null) }}
                className={`group relative ${thumbnailSizeClass} shrink-0 overflow-hidden rounded-lg ${
                  draggingIndex === index
                    ? 'cursor-grabbing opacity-40 ring-2 ring-slate-300'
                    : overIndex === index && draggingIndex !== index
                      ? 'scale-105 cursor-grab ring-2 ring-brand'
                      : 'cursor-grab ring-1 ring-slate-200 hover:ring-slate-300 active:cursor-grabbing'
                }`}
              >
                <img
                  src={image.preview}
                  alt={`Variant image ${index + 1}`}
                  draggable={false}
                  className="pointer-events-none size-full object-cover select-none"
                />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded-full bg-brand px-1.5 py-px text-[9px] font-bold text-white shadow">
                    Main
                  </span>
                )}
                <div className="absolute inset-0 flex cursor-grab items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); removeImage(image.id) }}
                    className="cursor-pointer rounded-md bg-white p-1 text-red-600 shadow-sm transition-colors hover:bg-red-50"
                    aria-label={`Remove variant image ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="pointer-events-none absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex size-4 cursor-grab items-center justify-center rounded bg-black/60 text-white">
                    <GripVertical className="size-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {images.length} photo{images.length === 1 ? '' : 's'}
            {Number.isFinite(maxImages) && maxImages > 1 ? ` of ${maxImages}` : ''}
            {images.length > 1 ? ' · Drag to reorder · First is primary' : ''}
          </p>
        </>
      )}
    </div>
  )
}
