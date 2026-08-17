import { ArrowUpRight, BadgeCheck, Clock3, MessageSquare, Package, Pencil, Store } from 'lucide-react'
import { Link } from 'react-router'
import { useReplyEditWindow } from '../../hooks/useReplyEditWindow'
import { formatReviewDate, formatShortReviewDate, getCustomerInitials } from '../../utils/reviewUtils'
import StarRating from './StarRating'

export function ReviewProductImage({ src, className = 'size-16' }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${className} rounded-xl object-cover ring-1 ring-slate-200`}
      />
    )
  }

  return (
    <span className={`flex ${className} shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200`}>
      <Package className="size-6" strokeWidth={1.5} />
    </span>
  )
}

function ReplyEditTimer({ remainingCompact }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-amber-800 ring-1 ring-amber-100"
      title="Time left to edit this reply"
    >
      <Clock3 className="size-2.5" />
      {remainingCompact}
    </span>
  )
}

function VendorReplyPreview({ review, onEdit, canEdit }) {
  const reply = review.vendorReply

  if (!reply?.text) return null

  return (
    <div className="relative mt-4 pl-4">
      <span
        className="absolute top-0 bottom-0 left-0 w-0.5 rounded-full bg-linear-to-b from-brand/70 via-brand/30 to-brand/10"
        aria-hidden
      />

      <div className="overflow-hidden rounded-2xl border border-brand/15 bg-linear-to-br from-brand-light/70 via-white to-white shadow-[0_10px_30px_rgba(199,59,45,0.06)]">
        <div className="flex items-start gap-3 px-4 py-3.5">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-[0_8px_18px_rgba(199,59,45,0.22)]">
            <Store className="size-4" strokeWidth={2} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand/80">
                Your reply
              </p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">Visible on your storefront</p>
            </div>

            <p className="mt-2.5 text-sm leading-relaxed text-slate-800">
              {reply.text}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-slate-400">
                {reply.date ? `Replied ${formatReviewDate(reply.date)}` : 'Replied'}
                {reply.updatedAt ? ` · Edited ${formatReviewDate(reply.updatedAt)}` : ''}
              </p>
              {canEdit ? (
                <button
                  type="button"
                  onClick={() => onEdit(review, { edit: true })}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-brand"
                >
                  <Pencil className="size-3" />
                  Edit
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReviewCard({ review, onView, onReply }) {
  const needsReply = !review.vendorReply
  const hasRating = Number.isFinite(review.rating)
  const { canEdit, remainingCompact } = useReplyEditWindow(review)

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-[0_16px_45px_rgba(15,23,42,0.06)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {review.productId ? (
          <Link
            to={`/products/${review.productId}/view`}
            className="shrink-0 cursor-pointer"
          >
            <ReviewProductImage src={review.productImage} />
          </Link>
        ) : (
          <ReviewProductImage src={review.productImage} />
        )}

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
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {hasRating && <StarRating rating={review.rating} size="size-3.5" />}
                  {review.date && (
                    <span className="text-xs text-slate-400">{formatShortReviewDate(review.date)}</span>
                  )}
                </div>
              </div>
            </div>

            {needsReply ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-rose-100">
                <MessageSquare className="size-3" />
                Needs reply
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                  <MessageSquare className="size-3" />
                  Replied
                </span>
                {canEdit ? <ReplyEditTimer remainingCompact={remainingCompact} /> : null}
              </span>
            )}
          </div>

          {review.productId ? (
            <Link
              to={`/products/${review.productId}/view`}
              className="mt-2 inline-block text-xs font-semibold text-brand hover:underline"
            >
              {review.productName}
            </Link>
          ) : (
            <p className="mt-2 text-xs font-semibold text-slate-500">{review.productName}</p>
          )}

          {review.title && (
            <h3 className="mt-2 text-sm font-bold text-slate-900">{review.title}</h3>
          )}
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{review.comment}</p>

          {!needsReply ? (
            <VendorReplyPreview review={review} onEdit={onReply} canEdit={canEdit} />
          ) : null}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {review.orderId ? (
              <Link
                to={`/orders/${review.orderId}`}
                className="text-xs font-semibold text-slate-500 hover:text-brand"
              >
                {review.orderNumber || 'View order'}
              </Link>
            ) : review.orderNumber ? (
              <span className="text-xs font-semibold text-slate-500">{review.orderNumber}</span>
            ) : (
              <span />
            )}

            <div className="flex flex-wrap items-center gap-2">
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
