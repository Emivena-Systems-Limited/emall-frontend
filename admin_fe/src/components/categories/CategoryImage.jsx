import { Image as ImageIcon } from 'lucide-react'

const SIZES = {
  sm: 'size-8',
  md: 'size-9',
  lg: 'size-16',
}

const ICONS = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-6',
}

export default function CategoryImage({
  src,
  alt = '',
  size = 'md',
  className = '',
  roundedClass = 'rounded-xl',
}) {
  const frame = SIZES[size] ?? SIZES.md
  const icon = ICONS[size] ?? ICONS.md

  if (src) {
    return (
      <span className={`${frame} ${roundedClass} shrink-0 overflow-hidden bg-slate-100 ring-1 ring-slate-200 ${className}`}>
        <img
          src={src}
          alt={alt}
          className="h-full w-full max-w-full object-contain"
        />
      </span>
    )
  }

  return (
    <span
      className={`flex ${frame} ${roundedClass} shrink-0 items-center justify-center bg-slate-200 text-slate-400 ring-1 ring-slate-200 ${className}`}
      aria-hidden={alt ? undefined : true}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
    >
      <ImageIcon className={icon} strokeWidth={1.75} aria-hidden="true" />
    </span>
  )
}
