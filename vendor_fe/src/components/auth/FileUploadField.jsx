import { useRef, useState } from 'react'
import { FileText, ImageIcon, Trash2, Upload } from 'lucide-react'
import FieldError from './FieldError'
import { ALLOWED_CERTIFICATE_TYPES, MAX_CERTIFICATE_SIZE_BYTES } from '../../constants/vendorTerms'
import { fileToRegistrationCertificate } from '../../utils/fileToBase64'

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mimeType) {
  if (mimeType === 'application/pdf') return FileText
  return ImageIcon
}

export default function FileUploadField({
  id,
  name,
  label,
  hint,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState('')

  const validateAndSet = async (file) => {
    setLocalError('')

    if (!ALLOWED_CERTIFICATE_TYPES.includes(file.type)) {
      setLocalError('Only JPG, PNG, or PDF files are allowed')
      return
    }

    if (file.size > MAX_CERTIFICATE_SIZE_BYTES) {
      setLocalError('Maximum file size is 5MB')
      return
    }

    try {
      const certificate = await fileToRegistrationCertificate(file)
      onChange?.({ target: { name, value: certificate } })
      onBlur?.({ target: { name } })
    } catch {
      setLocalError('Could not read the selected file')
    }
  }

  const handleFiles = async (files) => {
    const file = files?.[0]
    if (!file) return
    await validateAndSet(file)
  }

  const handleRemove = () => {
    setLocalError('')
    onChange?.({ target: { name, value: null } })
    if (inputRef.current) inputRef.current.value = ''
  }

  const displayError = error || localError
  const FileIcon = value ? getFileIcon(value.mime_type) : Upload

  return (
    <div data-field={name}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {value ? (
        <div className="fade-in flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
            <FileIcon className="size-4 text-brand" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{value.file_name}</p>
            <p className="text-xs text-slate-500">{formatFileSize(value.size)} · Ready to upload</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Remove file"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            if (!disabled) setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={async (event) => {
            event.preventDefault()
            setDragActive(false)
            if (disabled) return
            await handleFiles(event.dataTransfer.files)
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all ${
            dragActive
              ? 'border-brand bg-brand-light/40'
              : displayError
                ? 'border-red-300 bg-red-50/40'
                : 'border-slate-200 bg-slate-50/50 hover:border-brand/40 hover:bg-brand-light/20'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <Upload className="size-5 text-brand" strokeWidth={2} />
          </span>
          <p className="text-sm font-semibold text-slate-800">
            Drop certificate here or <span className="text-brand">browse files</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">JPG, PNG, or PDF · Max 5MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={async (event) => {
          await handleFiles(event.target.files)
          event.target.value = ''
        }}
        onBlur={() => onBlur?.({ target: { name } })}
      />

      {hint && !displayError && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {displayError && <FieldError message={displayError} />}
    </div>
  )
}
