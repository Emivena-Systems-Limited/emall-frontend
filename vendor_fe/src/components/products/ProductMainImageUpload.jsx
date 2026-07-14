import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import FieldError from '../auth/FieldError'
import notify from '../../lib/notify'
import {
  PRIMARY_PRODUCT_IMAGE_RECOMMENDED_LABEL,
} from '../../constants/products'
import {
  ProductImageDimensionBadge,
  ProductImageDimensionGuidance,
} from './ProductImageDimensionHints'
import {
  evaluatePrimaryImageDimensions,
  formatImageStorageSize,
  getPrimaryDimensionGuidance,
  getProductImageLimitsSummary,
  pickProductImageFiles,
  readImageFileDimensions,
  readImageUrlDimensions,
  replaceProductImageWithFile,
  revokeProductImagePreview,
} from '../../utils/productImageUtils'

const IMAGE_HINT = `JPG or PNG · Square near ${PRIMARY_PRODUCT_IMAGE_RECOMMENDED_LABEL} · Up to 5 images total · 5MB combined`

export default function ProductMainImageUpload({
  image,
  onChange,
  error,
  subImages = [],
}) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const limits = getProductImageLimitsSummary(image, subImages)
  const guidance = getPrimaryDimensionGuidance()

  useEffect(() => {
    if (!image || (image.width && image.height) || image.dimensionsChecked) return undefined

    let cancelled = false

    const hydrateDimensions = async () => {
      try {
        let dimensions
        if (image.file) {
          dimensions = await readImageFileDimensions(image.file)
        } else {
          const preview = String(image.preview ?? '').trim()
          if (!preview) return
          dimensions = await readImageUrlDimensions(preview)
        }

        if (cancelled) return

        onChange({
          ...image,
          ...dimensions,
          dimensionsChecked: true,
        })
      } catch {
        if (cancelled) return
        onChange({
          ...image,
          width: null,
          height: null,
          dimensionsChecked: true,
        })
      }
    }

    hydrateDimensions()

    return () => {
      cancelled = true
    }
  }, [image, onChange])

  const applyFile = async (file) => {
    const { accepted, notices } = pickProductImageFiles({
      mainImage: image,
      subImages,
      files: [file],
      target: 'main',
    })

    notices.forEach((message) => notify.error(message))

    if (accepted.length === 0) return

    try {
      const { width, height } = await readImageFileDimensions(accepted[0])
      const result = evaluatePrimaryImageDimensions(width, height)

      if (!result.valid) {
        notify.error(result.message)
        return
      }

      onChange(replaceProductImageWithFile(image, accepted[0], { width, height }))
    } catch {
      notify.error('Could not read the selected image. Try a different JPG or PNG file.')
    }
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
      <ProductImageDimensionGuidance
        title="Recommended size for product cards"
        description={
          <>
            This photo appears in search results and category grids inside a square frame (like on the storefront product card).
            Upload a square image close to{' '}
            <span className="font-semibold text-slate-800">{PRIMARY_PRODUCT_IMAGE_RECOMMENDED_LABEL}</span>
            {' '}so it fills the card without large empty bands.
          </>
        }
        guidance={guidance}
        footer="Exact pixels are not required — close is fine. Avoid wide landscape or tall portrait photos for this slot."
      />

      {image ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="relative mx-auto aspect-square max-h-80 w-full max-w-sm bg-white">
            <img
              src={image.preview}
              alt="Main product"
              className="size-full object-contain p-4"
            />
            <ProductImageDimensionBadge
              width={image.width}
              height={image.height}
              evaluateFn={evaluatePrimaryImageDimensions}
            />
          </div>
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
