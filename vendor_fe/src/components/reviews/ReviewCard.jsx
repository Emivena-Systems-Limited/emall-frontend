import { ArrowUpRight, BadgeCheck, MessageSquare } from 'lucide-react'
import { Link } from 'react-router'
import { formatShortReviewDate, getCustomerInitials } from '../../utils/reviewUtils'
import ReviewVisibilityBadge, { ReviewVisibilityActions } from './ReviewVisibilityControls'
import StarRating from './StarRating'

export default function ReviewCard({ review, onView, onReply, onAllow, onFlag }) {
  const needsReply = !review.vendorReply
  const isPending = review.status === 'pending'
  const isHidden = review.status === 'hidden'

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-200 hover:shadow-[0_16px_45px_rgba(15,23,42,0.06)] sm:p-5 ${
        isPending
          ? 'border-amber-200/80 ring-1 ring-amber-100/60'
          : isHidden
            ? 'border-slate-200 bg-slate-50/50 opacity-90'
            : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {isPending && (
        <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-amber-400 to-amber-500" aria-hidden />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Link
          to={`/products/${review.productId}/view`}
          className="shrink-0 cursor-pointer"
        >
          <img
            src={review.productImage}
            alt=""
            className={`size-16 rounded-xl object-cover ring-1 ring-slate-200 transition-transform group-hover:scale-[1.02] ${isHidden ? 'grayscale-[30%]' : ''}`}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-slate-100 to-slate-50 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                {getCustomerInitials(review.customerName)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{review.customerName}</p>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                      <BadgeCheck className="size-2.5" />
                      Verified
                    </span>
                  )}
                  <ReviewVisibilityBadge status={review.status} compact />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StarRating rating={review.rating} size="size-3.5" />
                  <span className="text-xs text-slate-400">{formatShortReviewDate(review.date)}</span>
                </div>
              </div>
            </div>

            {needsReply ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-rose-100">
                <MessageSquare className="size-3" />
                Needs reply
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                Replied
              </span>
            )}
          </div>

          <Link
            to={`/products/${review.productId}/view`}
            className="mt-2 inline-block text-xs font-semibold text-brand hover:underline"
          >
            {review.productName}
          </Link>

          <h3 className="mt-2 text-sm font-bold text-slate-900">{review.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{review.comment}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <Link
                to={`/orders/${review.orderId}`}
                className="font-semibold text-slate-500 hover:text-brand"
              >
                {review.orderNumber}
              </Link>
              <span>{review.helpfulCount} found helpful</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ReviewVisibilityActions
                review={review}
                onAllow={onAllow}
                onFlag={onFlag}
                compact
              />
              {needsReply && (
                <button
                  type="button"
                  onClick={() => onReply(review)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-hover"
                >
                  <MessageSquare className="size-3.5" />
                  Reply
                </button>
              )}
              <button
                type="button"
                onClick={() => onView(review)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                View
                <ArrowUpRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
