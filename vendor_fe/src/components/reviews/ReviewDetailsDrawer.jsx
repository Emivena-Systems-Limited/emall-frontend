import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import {
  BadgeCheck,
  Loader2,
  MessageSquare,
  Package,
  Send,
  Star,
  X,
} from 'lucide-react'
import { formatReviewDate, getCustomerInitials } from '../../utils/reviewUtils'
import ReviewVisibilityBadge, { ReviewVisibilityActions } from './ReviewVisibilityControls'
import StarRating from './StarRating'

export default function ReviewDetailsDrawer({
  review,
  onClose,
  onSaveReply,
  onAllow,
  onFlag,
}) {
  const [replyText, setReplyText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!review) return undefined

    setReplyText(review.vendorReply?.text ?? '')
    setIsEditing(!review.vendorReply)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [review, onClose])

  if (!review) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmed = replyText.trim()
    if (!trimmed) return

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onSaveReply(review.id, trimmed)
    setIsSaving(false)
    setIsEditing(false)
  }

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-drawer-title"
        className="slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl"
      >
        <div className="relative overflow-hidden border-b border-slate-200 bg-linear-to-br from-amber-50/60 via-white to-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm ring-1 ring-amber-200/60">
                <Star className="size-5" fill="#F59E0B" strokeWidth={0} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600/80">
                  Customer Review
                </p>
                <h2 id="review-drawer-title" className="truncate text-lg font-bold text-slate-900">
                  {review.title}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StarRating rating={review.rating} size="size-3.5" />
                  <span className="text-xs text-slate-500">{formatReviewDate(review.date)}</span>
                  <ReviewVisibilityBadge status={review.status} />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close panel"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <Link
            to={`/products/${review.productId}/view`}
            className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100 transition-colors hover:bg-slate-100"
          >
            <img
              src={review.productImage}
              alt=""
              className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                <Package className="size-3" />
                Product
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">{review.productName}</p>
            </div>
          </Link>

          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
              {getCustomerInitials(review.customerName)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-slate-900">{review.customerName}</p>
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                    <BadgeCheck className="size-2.5" />
                    Verified Purchase
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{review.comment}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                <Link
                  to={`/orders/${review.orderId}`}
                  className="font-semibold text-brand hover:underline"
                >
                  Order {review.orderNumber}
                </Link>
                <span>{review.helpfulCount} found this helpful</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <ReviewVisibilityActions
              review={review}
              onAllow={onAllow}
              onFlag={onFlag}
            />
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <MessageSquare className="size-4 text-slate-400" />
                Your Response
              </h3>
              {review.vendorReply && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer text-xs font-semibold text-brand hover:underline"
                >
                  Edit reply
                </button>
              )}
            </div>

            {review.vendorReply && !isEditing ? (
              <div className="rounded-2xl border-l-4 border-brand bg-brand-light/30 p-4">
                <p className="text-sm leading-relaxed text-slate-700">{review.vendorReply.text}</p>
                <p className="mt-2 text-xs text-slate-400">
                  Replied {formatReviewDate(review.vendorReply.date)}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder="Write a thoughtful response to this customer…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
                />
                <p className="text-xs text-slate-400">
                  Public replies appear on your storefront. Be professional and address any concerns raised.
                </p>
                <button
                  type="submit"
                  disabled={isSaving || !replyText.trim()}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {review.vendorReply ? 'Update Reply' : 'Post Reply'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </aside>
    </>,
    document.body,
  )
}
