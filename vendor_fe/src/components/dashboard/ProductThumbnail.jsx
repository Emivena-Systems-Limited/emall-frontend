import { useState } from 'react'
import { Package } from 'lucide-react'

export default function ProductThumbnail({ src, alt }) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
        <Package className="size-5" strokeWidth={2} />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="size-11 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
    />
  )
}
