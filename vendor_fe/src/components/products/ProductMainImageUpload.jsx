import { useRef, useState } from 'react'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import FieldError from '../auth/FieldError'
import notify from '../../lib/notify'
import {
  formatImageStorageSize,
  getProductImageLimitsSummary,
  pickProductImageFiles,
  replaceProductImageWithFile,
  revokeProductImagePreview,
} from '../../utils/productImageUtils'

const IMAGE_HINT = 'JPG or PNG · Up to 5 images total · 5MB combined'

export default function ProductMainImageUpload({
  image,
  onChange,
  error,
  subImages = [],
}) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const limits = getProductImageLimitsSummary(image, subImages)

  const applyFile = (file) => {
    const { accepted, notices } = pickProductImageFiles({
      mainImage: image,
      subImages,
      files: [file],
      target: 'main',
    })

    notices.forEach((message) => notify.error(message))

    if (accepted.length === 0) return

    onChange(replaceProductImageWithFile(image, accepted[0]))
  }

  const processFiles = (fileList) => {
    const file = fileList?.[0]
    if (file) applyFile(file)
  }

  const removeImage = () => {
    if (image) revokeProductImagePreview(image)
    onChange(null)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragOver(false)
    processFiles(event.dataTransfer.files)
  }

  return (
    <div data-field="main_product_image" className="space-y-3">
      {image ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <img
            src={image.preview}
            alt="Main product"
            className="mx-auto max-h-72 w-full object-contain p-4"
          />
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white shadow">
              Main photo
            </span>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-white p-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/30 hover:text-brand"
            >
              <Upload className="size-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="size-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(event) => { event.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 transition-all ${
            isDragOver
              ? 'border-brand bg-brand-light/30'
              : 'border-slate-200 bg-slate-50/60 hover:border-brand/40 hover:bg-brand-light/10'
          }`}
        >
          <span className={`flex size-14 items-center justify-center rounded-2xl ring-1 transition-all ${
            isDragOver ? 'bg-brand text-white ring-brand/30' : 'bg-white text-slate-400 ring-slate-200'
          }`}>
            <ImagePlus className="size-6" strokeWidth={1.5} />
          </span>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">Drag & drop or click to upload main photo</p>
            <p className="mt-1 text-xs text-slate-500">{IMAGE_HINT}</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={(event) => { processFiles(event.target.files); event.target.value = '' }}
        className="sr-only"
      />

      {error && <FieldError message={error} />}
      {!error && (
        <p className="text-xs text-slate-400">
          {limits.count} of {limits.maxCount} images · {formatImageStorageSize(limits.bytes)} of {formatImageStorageSize(limits.maxBytes)} used
        </p>
      )}
    </div>
  )
}
