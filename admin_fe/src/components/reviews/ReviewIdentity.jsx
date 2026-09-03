import { useState } from 'react'
import { Package } from 'lucide-react'
import { formatReviewSnippet, getReviewAvatarTone, getReviewInitials } from '../../utils/normalizeAdminReviews'
import StarRating from './StarRating'

function ListingThumb({ src, box }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span className={`flex ${box} shrink-0 items-center justify-center bg-slate-100 text-slate-400 ring-1 ring-slate-200`}>
        <Package className="size-4" strokeWidth={2} aria-hidden="true" />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className={`${box} shrink-0 object-cover ring-1 ring-slate-200`}
    />
  )
}

function ShopperMark({ review, box }) {
  const src = review.shopperAvatar || ''
  const [loadedSrc, setLoadedSrc] = useState('')
  const [failedSrc, setFailedSrc] = useState('')
  const initials = getReviewInitials(review)
  const showPhoto = Boolean(src) && failedSrc !== src
  const photoReady = Boolean(src) && loadedSrc === src

  return (
    <span
      className={`relative flex ${box} shrink-0 items-center justify-center overflow-hidden font-bold ring-1 ${getReviewAvatarTone(review.shopperId || review.id)}`}
      aria-hidden="true"
    >
      <span className={photoReady ? 'opacity-0' : undefined}>{initials}</span>
      {showPhoto ? (
        <img
          src={src}
          alt=""
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
          className={`absolute inset-0 size-full object-cover ${photoReady ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : null}
    </span>
  )
}

export function ReviewRosterSkeleton({ rows = 6 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading reviews"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="skeleton-shimmer size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-40 rounded-md" />
              <div className="skeleton-shimmer h-3 w-56 rounded-md" />
            </div>
            <div className="skeleton-shimmer hidden h-6 w-20 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ReviewIdentity({ review, size = 'md' }) {
  const large = size === 'lg'
  const box = large ? 'size-16 rounded-2xl text-sm' : 'size-10 rounded-xl text-xs'

  return (
    <div className="flex min-w-0 items-center gap-3">
      {review?.productImage ? (
        <ListingThumb src={review.productImage} box={box} />
      ) : (
        <ShopperMark review={review} box={box} />
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`truncate ${large ? 'text-xl font-bold text-slate-950' : 'font-semibold text-slate-900'}`}>
            {review?.shopperName || 'Shopper'}
          </p>
          <StarRating rating={review?.rating} size={large ? 'size-4' : 'size-3.5'} />
        </div>
        <p className={`truncate ${large ? 'mt-0.5 text-sm text-slate-500' : 'text-xs text-slate-500'}`}>
          {formatReviewSnippet(review, large ? 120 : 72)}
        </p>
      </div>
    </div>
  )
}
