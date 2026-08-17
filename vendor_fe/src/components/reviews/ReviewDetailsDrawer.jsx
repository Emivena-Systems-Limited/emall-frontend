import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import {
  BadgeCheck,
  Clock3,
  Loader2,
  MessageSquare,
  Package,
  Pencil,
  Send,
  Star,
  X,
} from 'lucide-react'
import { useReplyEditWindow } from '../../hooks/useReplyEditWindow'
import { formatReviewDate, getCustomerInitials } from '../../utils/reviewUtils'
import { ReviewProductImage } from './ReviewCard'
import StarRating from './StarRating'

export default function ReviewDetailsDrawer({
  review,
  onClose,
  onSaveReply,
  startEditing = false,
}) {
  const [replyText, setReplyText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { canEdit, remainingLabel } = useReplyEditWindow(review)

  useEffect(() => {
    if (!review) return undefined

    setReplyText(review.vendorReply?.text ?? '')
    setIsSaving(false)
    setIsEditing(Boolean(startEditing && review.vendorReply))

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [review, onClose, startEditing])

  useEffect(() => {
    if (isEditing && !canEdit) {
      setIsEditing(false)
      setReplyText(review?.vendorReply?.text ?? '')
    }
  }, [canEdit, isEditing, review?.vendorReply?.text])

  if (!review) return null

  const hasReply = Boolean(review.vendorReply)
  const showComposer = !hasReply || isEditing

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (hasReply && !canEdit) return

    const trimmed = replyText.trim()
    if (!trimmed) return
    if (hasReply && trimmed === review.vendorReply.text.trim()) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSaveReply(review, trimmed)
      setIsEditing(false)
      if (!hasReply) setReplyText('')
    } catch {
      // Parent surfaces the error.
    } finally {
      setIsSaving(false)
    }
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
                  {review.title || review.productName || 'Customer review'}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {Number.isFinite(review.rating) && (
                    <StarRating rating={review.rating} size="size-3.5" />
                  )}
                  {review.date && (
                    <span className="text-xs text-slate-500">{formatReviewDate(review.date)}</span>
                  )}
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
          {review.productId ? (
            <Link
              to={`/products/${review.productId}/view`}
              className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100 transition-colors hover:bg-slate-100"
            >
              <ReviewProductImage src={review.productImage} className="size-12" />
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <Package className="size-3" />
                  Product
                </p>
                <p className="truncate text-sm font-semibold text-slate-900">{review.productName}</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
              <ReviewProductImage src={review.productImage} className="size-12" />
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <Package className="size-3" />
                  Product
                </p>
                <p className="truncate text-sm font-semibold text-slate-900">{review.productName}</p>
              </div>
            </div>
          )}

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
              {review.orderId ? (
                <Link
                  to={`/orders/${review.orderId}`}
                  className="mt-3 inline-block text-xs font-semibold text-brand hover:underline"
                >
                  Order {review.orderNumber || ''}
                </Link>
              ) : review.orderNumber ? (
                <p className="mt-3 text-xs font-semibold text-slate-500">Order {review.orderNumber}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <MessageSquare className="size-4 text-slate-400" />
                Your Response
              </h3>
              {hasReply && canEdit ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  <Clock3 className="size-3" />
                  Editable {remainingLabel}
                </span>
              ) : hasReply ? (
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Edit window closed
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  1 hour to edit
                </span>
              )}
            </div>

            {showComposer ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder="Write a thoughtful response to this customer…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
                />
                <p className="text-xs text-slate-400">
                  {hasReply
                    ? `You can edit this reply for ${remainingLabel} more. After that it becomes permanent.`
                    : 'Public replies appear on your storefront. You can edit a reply for 1 hour after posting.'}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setReplyText(review.vendorReply?.text ?? '')
                      }}
                      className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isSaving || !replyText.trim()}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : isEditing ? (
                      <Pencil className="size-4" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    {isEditing ? 'Save changes' : 'Post Reply'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border-l-4 border-brand bg-brand-light/30 p-4">
                <p className="text-sm leading-relaxed text-slate-700">{review.vendorReply.text}</p>
                {review.vendorReply.date && (
                  <p className="mt-2 text-xs text-slate-400">
                    Replied {formatReviewDate(review.vendorReply.date)}
                    {review.vendorReply.updatedAt ? ` · Edited ${formatReviewDate(review.vendorReply.updatedAt)}` : ''}
                  </p>
                )}
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => {
                      setReplyText(review.vendorReply.text)
                      setIsEditing(true)
                    }}
                    className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
                  >
                    <Pencil className="size-3.5" />
                    Edit reply
                  </button>
                ) : null}
              </div>
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
