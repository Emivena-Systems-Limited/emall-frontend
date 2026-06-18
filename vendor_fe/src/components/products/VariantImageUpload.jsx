import { useRef } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { isAcceptedImageFile, readImageAsDataUri } from '../../utils/readImageAsDataUri'
import notify from '../../lib/notify'

export default function VariantImageUpload({
  value,
  onChange,
  label = 'Variant image',
  hint = 'Optional · JPG or PNG · Max 5MB',
  compact = false,
}) {
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    if (!isAcceptedImageFile(file)) {
      notify.error('Only JPG or PNG images up to 5MB are allowed')
      return
    }

    try {
      const dataUri = await readImageAsDataUri(file)
      onChange(dataUri)
    } catch {
      notify.error('Could not process image. Try another file.')
    }
  }

  const handleInputChange = (event) => {
    const file = event.target.files?.[0]
    handleFile(file)
    event.target.value = ''
  }

  const handleRemove = (event) => {
    event.stopPropagation()
    onChange('')
  }

  const labelBlock = (
    <div className={compact ? 'mb-2 min-h-[3.25rem]' : 'mb-1.5'}>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {hint && (
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{hint}</p>
      )}
    </div>
  )

  if (value) {
    return (
      <div className={`flex h-full flex-col ${compact ? 'rounded-xl border border-slate-200 bg-white p-3' : ''}`}>
        {labelBlock}
        <div className="group relative inline-block">
          <img
            src={value}
            alt="Variant preview"
            className={`rounded-xl object-cover ring-1 ring-slate-200 ${compact ? 'size-20' : 'size-24'}`}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-white p-1 text-red-600 shadow ring-1 ring-slate-200 transition-colors hover:bg-red-50"
            aria-label="Remove variant image"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-full flex-col ${compact ? 'rounded-xl border border-slate-200 bg-white p-3' : ''}`}>
      {labelBlock}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex w-full flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 transition-colors hover:border-brand/40 hover:bg-brand-light/10 ${
          compact ? 'min-h-[5.5rem] gap-3 px-4 py-3 sm:flex-row' : 'flex-col gap-2 px-4 py-5'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleInputChange}
          className="sr-only"
        />
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200">
          <ImagePlus className="size-4" strokeWidth={1.75} />
        </span>
        <span className={`text-xs font-semibold text-slate-600 ${compact ? 'text-left' : ''}`}>
          Click to upload variant image
        </span>
      </button>
    </div>
  )
}
