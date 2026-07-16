import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

export default function HeroBannerImage({
  src,
  alt,
  className = '',
  placeholderClassName = 'bg-slate-100 text-slate-300',
  eager = true,
  elevated = false,
}) {
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  if (!src || hasError) {
    return (
      <div
        aria-label={alt}
        className={`flex items-center justify-center overflow-hidden rounded-2xl ${placeholderClassName} ${className}`}
      >
        <ImageIcon className="size-10 sm:size-11 lg:size-12" strokeWidth={1.5} aria-hidden />
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${
        elevated ? 'shadow-lg shadow-slate-900/10 ring-1 ring-white/60' : 'ring-1 ring-black/5'
      } ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`size-full object-cover object-center transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {!isLoaded ? (
        <div
          className={`absolute inset-0 animate-pulse ${placeholderClassName}`}
          aria-hidden
        />
      ) : null}
    </div>
  )
}
