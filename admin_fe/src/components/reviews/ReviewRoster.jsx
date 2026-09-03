import { Link, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { formatCount } from '../../utils/formatters'
import { formatReviewDate } from '../../utils/normalizeAdminReviews'
import { prefetchAdminReview } from '../../hooks/useAdminReviews'
import ReviewActions from './ReviewActions'
import ReviewIdentity, { ReviewRosterSkeleton } from './ReviewIdentity'
import ReviewStatusBadge, { ReviewFeaturedBadge } from './ReviewStatusBadge'
import OverflowTooltip from '../common/OverflowTooltip'

export { ReviewRosterSkeleton }

export default function ReviewRoster({
  reviews,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasFilters = false,
  onStatus,
  onFeatured,
  onRemove,
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const prefetch = (id) => prefetchAdminReview(queryClient, id)

  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Star}
          title={hasFilters ? 'No reviews match these filters' : 'No reviews yet'}
          description={
            hasFilters
              ? 'Try a different visibility, rating, or store, or clear the current filters.'
              : 'Shopper ratings will appear here once they are returned by the API.'
          }
          action={hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Clear filters
            </button>
          ) : null}
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-2.5">Review</th>
              <th className="px-5 py-2.5">Listing</th>
              <th className="px-5 py-2.5">Store</th>
              <th className="px-5 py-2.5">Posted</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <tr key={review.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <Link
                    to={`/reviews/${encodeURIComponent(review.id)}`}
                    onMouseEnter={() => prefetch(review.id)}
                    onFocus={() => prefetch(review.id)}
                    className="block rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <ReviewIdentity review={review} />
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <div className="max-w-52">
                    <OverflowTooltip text={review.productName}>
                      {review.productId ? (
                        <Link
                          to={`/products/${encodeURIComponent(review.productId)}`}
                          className="block w-full truncate text-sm font-medium text-slate-700 transition-colors hover:text-brand"
                        >
                          {review.productName}
                        </Link>
                      ) : (
                        <span className="block w-full truncate text-sm text-slate-500">
                          {review.productName || '—'}
                        </span>
                      )}
                    </OverflowTooltip>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="max-w-36">
                    <OverflowTooltip text={review.vendorName}>
                      {review.vendorId ? (
                        <Link
                          to={`/vendors/${encodeURIComponent(review.vendorId)}`}
                          className="block w-full truncate whitespace-nowrap text-sm font-medium text-slate-700 transition-colors hover:text-brand"
                        >
                          {review.vendorName || 'Store'}
                        </Link>
                      ) : (
                        <span className="block w-full truncate whitespace-nowrap text-sm text-slate-500">
                          {review.vendorName || '—'}
                        </span>
                      )}
                    </OverflowTooltip>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{formatReviewDate(review.createdAt)}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <ReviewStatusBadge status={review.status} />
                    {review.featured ? <ReviewFeaturedBadge /> : null}
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <ReviewActions
                    review={review}
                    onView={() => navigate(`/reviews/${encodeURIComponent(review.id)}`)}
                    onStatus={onStatus}
                    onFeatured={onFeatured}
                    onRemove={onRemove}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {reviews.map((review) => (
          <li key={review.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                to={`/reviews/${encodeURIComponent(review.id)}`}
                onMouseEnter={() => prefetch(review.id)}
                onFocus={() => prefetch(review.id)}
                className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <ReviewIdentity review={review} />
              </Link>
              <ReviewActions
                review={review}
                onView={() => navigate(`/reviews/${encodeURIComponent(review.id)}`)}
                onStatus={onStatus}
                onFeatured={onFeatured}
                onRemove={onRemove}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <ReviewStatusBadge status={review.status} />
                {review.featured ? <ReviewFeaturedBadge /> : null}
              </div>
              <span className="text-xs text-slate-500">{formatReviewDate(review.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{rangeStart}–{rangeEnd}</span> of{' '}
          <span className="font-semibold text-slate-700">{formatCount(total)}</span>
        </p>
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </button>
            <span className="min-w-16 text-center text-xs font-semibold text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Next
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
