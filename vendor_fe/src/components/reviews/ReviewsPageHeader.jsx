import { Download } from 'lucide-react'
import ReviewsDevToggle from './ReviewsDevToggle'

export default function ReviewsPageHeader({
  onExport,
  exportCount,
  averageRating,
  totalReviews,
  hasReviews,
  devDataEnabled,
  onDevDataChange,
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Reviews & Ratings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor customer feedback, respond to reviews, and track your store reputation.
        </p>
        {totalReviews > 0 && (
          <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 ring-1 ring-amber-100">
              ★ {averageRating.toFixed(1)}
            </span>
            across {totalReviews} review{totalReviews === 1 ? '' : 's'}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ReviewsDevToggle
          enabled={devDataEnabled}
          onChange={onDevDataChange}
          reviewCount={totalReviews}
        />
        <button
          type="button"
          onClick={onExport}
          disabled={!hasReviews}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" />
          Export {exportCount > 0 ? `(${exportCount})` : ''}
        </button>
      </div>
    </div>
  )
}
