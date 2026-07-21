import { Eye, EyeOff, Globe } from 'lucide-react'
import { REVIEW_STATUS } from '../../constants/reviews'

export default function ReviewVisibilityBadge({ status, compact = false }) {
  const config = REVIEW_STATUS[status] ?? REVIEW_STATUS.pending

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${config.className}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${config.dot}`} aria-hidden />
      {compact ? config.shortLabel : config.label}
    </span>
  )
}

export function ReviewVisibilityActions({ review, onAllow, onFlag, compact = false }) {
  const isPending = review.status === 'pending'
  const isPublished = review.status === 'published'
  const isHidden = review.status === 'hidden'

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {!isPublished && (
          <button
            type="button"
            onClick={() => onAllow(review)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <Globe className="size-3.5" />
            Allow
          </button>
        )}
        {!isHidden && (
          <button
            type="button"
            onClick={() => onFlag(review)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <EyeOff className="size-3.5" />
            Flag
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
      <div className="flex items-start gap-2">
        {isPublished ? (
          <Eye className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        ) : (
          <EyeOff className="mt-0.5 size-4 shrink-0 text-slate-400" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">Storefront visibility</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {isPending && 'This review is not visible to customers yet. Allow it to publish on your storefront, or flag it to keep it hidden.'}
            {isPublished && 'This review is live on your product pages. Flag it to remove it from the storefront.'}
            {isHidden && 'This review is hidden from customers. Allow it when you are ready to publish it on your storefront.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!isPublished && (
              <button
                type="button"
                onClick={() => onAllow(review)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <Globe className="size-3.5" />
                Allow on storefront
              </button>
            )}
            {!isHidden && (
              <button
                type="button"
                onClick={() => onFlag(review)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <EyeOff className="size-3.5" />
                Flag & hide
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
