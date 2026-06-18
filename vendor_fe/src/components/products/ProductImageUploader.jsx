import { useRef, useState } from 'react'
import { GripVertical, ImagePlus, Trash2, Upload } from 'lucide-react'
import FieldError from '../auth/FieldError'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function ProductImageUploader({ images, onChange, error }) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)

  const processFiles = (fileList) => {
    const added = Array.from(fileList)
      .filter((file) => ACCEPTED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE)
      .map((file) => ({
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      }))
    if (added.length > 0) onChange([...images, ...added])
  }

  const removeImage = (id) => {
    const img = images.find((i) => i.id === id)
    if (img) URL.revokeObjectURL(img.preview)
    onChange(images.filter((i) => i.id !== id))
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

  return (
    <div data-field="product_images" className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleZoneDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all ${
          isDragOver
            ? 'border-brand bg-brand-light/30 px-6 py-10'
            : images.length === 0
              ? 'border-slate-200 bg-slate-50/60 px-6 py-14 hover:border-brand/40 hover:bg-brand-light/10'
              : 'border-slate-200 bg-slate-50/40 px-6 py-5 hover:border-slate-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          onChange={(e) => { processFiles(e.target.files); e.target.value = '' }}
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
            <p className="text-sm font-semibold text-slate-800">Drag & drop or click to upload</p>
            <p className="mt-1 text-xs text-slate-500">JPG, PNG · Max 5MB · First image becomes the main photo</p>
          </div>
        ) : (
          <p className="text-xs font-semibold text-slate-500">Click or drop to add more images</p>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDraggingIndex(index)}
              onDragOver={(e) => { e.preventDefault(); setOverIndex(index) }}
              onDrop={(e) => handleItemDrop(e, index)}
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
                alt={`Product image ${index + 1}`}
                draggable={false}
                className="pointer-events-none size-full object-cover select-none"
              />
              {index === 0 && (
                <div className="absolute left-1 top-1">
                  <span className="rounded-full bg-brand px-1.5 py-px text-[9px] font-bold text-white shadow">
                    Main
                  </span>
                </div>
              )}
              <div className="absolute inset-0 flex cursor-grab items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                  className="cursor-pointer rounded-md bg-white p-1 text-red-600 shadow-sm transition-colors hover:bg-red-50"
                  aria-label={`Remove image ${index + 1}`}
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
      {images.length > 0 && !error && (
        <p className="text-xs text-slate-400">
          {images.length} image{images.length === 1 ? '' : 's'} added · Drag to reorder · First image is the main photo
        </p>
      )}
    </div>
  )
}
