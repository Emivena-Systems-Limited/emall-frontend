import { useState } from 'react'

const FALLBACK_GRADIENTS = [
  'from-slate-200 to-slate-100',
  'from-sky-100 to-slate-50',
  'from-amber-100 to-slate-50',
  'from-rose-100 to-slate-50',
]

function hashLabel(label = '') {
  return label.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

export default function CategoryImage({
  src,
  alt = '',
  className = '',
  label = '',
  loading = 'lazy',
}) {
  const [failed, setFailed] = useState(false)
  const gradient = FALLBACK_GRADIENTS[hashLabel(label) % FALLBACK_GRADIENTS.length]

  if (!src || failed) {
    return (
      <div
        className={`flex size-full items-center justify-center bg-linear-to-br ${gradient} ${className}`.trim()}
        aria-hidden
      >
        <span className="px-3 text-center text-xs font-semibold text-slate-500">
          {label || 'Category'}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
