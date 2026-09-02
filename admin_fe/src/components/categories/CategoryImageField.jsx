import { useEffect, useState } from 'react'
import { Image as ImageIcon, Upload, X } from 'lucide-react'
import FieldError from '../auth/FieldError'
import notify from '../../lib/notify'
import { CATEGORY_IMAGE_ACCEPT, CATEGORY_IMAGE_MAX_BYTES } from '../../constants/categories'

function isAcceptedType(file) {
  return CATEGORY_IMAGE_ACCEPT.split(',').includes(file.type)
}

export default function CategoryImageField({
  id,
  label,
  hint,
  existingUrl = null,
  file = null,
  onFileChange,
  disabled = false,
  aspectClass = 'aspect-square',
  error = '',
}) {
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const displayUrl = previewUrl || existingUrl

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return undefined
    }

    const nextUrl = URL.createObjectURL(file)
    setPreviewUrl(nextUrl)
    return () => URL.revokeObjectURL(nextUrl)
  }, [file])

  const applyFile = (nextFile) => {
    if (!nextFile) return
    if (!isAcceptedType(nextFile)) {
      notify.error('Use JPG, PNG, or WEBP images only.')
      return
    }
    if (nextFile.size > CATEGORY_IMAGE_MAX_BYTES) {
      notify.error('Image must be 5MB or less.')
      return
    }
    onFileChange(nextFile)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    if (disabled) return
    applyFile(event.dataTransfer.files?.[0])
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-slate-700">
          {label}
        </label>
        {file ? (
          <span className="truncate text-[11px] font-medium text-slate-400">{file.name}</span>
        ) : null}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative mt-1.5 overflow-hidden rounded-2xl border border-dashed transition-colors ${aspectClass} ${
          error
            ? 'border-rose-300 bg-rose-50/40'
            : dragOver
              ? 'border-brand bg-brand-light/70'
              : 'border-slate-200 bg-slate-50/80'
        }`}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="" className="absolute inset-0 h-full w-full max-w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-200 text-slate-400">
            <ImageIcon className="size-7" strokeWidth={1.6} aria-hidden="true" />
            <span className="px-3 text-center text-[11px] font-semibold tracking-wide uppercase">
              {hint}
            </span>
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/70 to-transparent p-2.5">
          <label
            htmlFor={id}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm ${
              disabled ? 'pointer-events-none opacity-60' : 'hover:bg-white'
            }`}
          >
            <Upload className="size-3.5" aria-hidden="true" />
            {displayUrl ? 'Replace' : 'Upload'}
          </label>
          {file ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onFileChange(null)}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg bg-white/95 text-slate-600 shadow-sm hover:text-rose-700 disabled:cursor-not-allowed"
              aria-label={`Remove ${label}`}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <input
          id={id}
          type="file"
          accept={CATEGORY_IMAGE_ACCEPT}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            applyFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
      </div>
      {error ? <FieldError message={error} /> : null}
      <p className="mt-1.5 text-[11px] text-slate-400">JPG, PNG, or WEBP · 5MB max</p>
    </div>
  )
}
