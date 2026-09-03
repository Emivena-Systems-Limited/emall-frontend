import { Link, useNavigate, useParams } from 'react-router'
import { useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Package,
  Star,
  Store,
  Trash2,
  UserRound,
} from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import ReviewFeaturedModal from '../components/reviews/ReviewFeaturedModal'
import ReviewIdentity, { ReviewRosterSkeleton } from '../components/reviews/ReviewIdentity'
import ReviewMediaGrid from '../components/reviews/ReviewMediaGrid'
import ReviewMediaRemoveModal from '../components/reviews/ReviewMediaRemoveModal'
import ReviewRemoveModal from '../components/reviews/ReviewRemoveModal'
import ReviewStatusBadge, { ReviewFeaturedBadge } from '../components/reviews/ReviewStatusBadge'
import ReviewStatusModal from '../components/reviews/ReviewStatusModal'
import { getReviewStatusMeta } from '../constants/reviews'
import { useAdminReview } from '../hooks/useAdminReviews'
import { formatCount } from '../utils/formatters'
import { formatReviewDateTime } from '../utils/normalizeAdminReviews'
import { parseApiError } from '../utils/parseApiError'

function FactRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200">
        <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium break-words text-slate-900">{children}</div>
      </div>
    </div>
  )
}

function CountCard({ label, value, hint }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  )
}

function ReviewDetailSkeleton() {
  return (
    <DashboardLayout pageTitle="Review">
      <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading review">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
          <div className="skeleton-shimmer h-3 w-28 rounded-md" />
          <div className="mt-5 flex items-start gap-4">
            <div className="skeleton-shimmer size-16 shrink-0 rounded-2xl" />
            <div className="space-y-2.5">
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              <div className="skeleton-shimmer h-8 w-48 rounded-md" />
              <div className="skeleton-shimmer h-3.5 w-56 rounded-md" />
            </div>
          </div>
        </section>
        <ReviewRosterSkeleton rows={4} />
      </div>
    </DashboardLayout>
  )
}

export default function ReviewDetail() {
  const { reviewId } = useParams()
  const navigate = useNavigate()
  const { review, isLoading, isError, error, refetch } = useAdminReview(reviewId)
  const [statusOpen, setStatusOpen] = useState(false)
  const [featuredOpen, setFeaturedOpen] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [mediaToRemove, setMediaToRemove] = useState(null)

  if (isLoading) return <ReviewDetailSkeleton />

  if (isError) {
    return (
      <DashboardLayout pageTitle="Review">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Star}
              title="Could not load this review"
              description={parseApiError(error, 'This review is unavailable right now.').message}
              action={(
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  Try again
                </button>
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  if (!review) {
    return (
      <DashboardLayout pageTitle="Review">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Star}
              title="This review is not on the list"
              description="The link may be out of date, or this comment is no longer returned by the API."
              action={(
                <button
                  type="button"
                  onClick={() => navigate('/reviews')}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  Back to reviews
                </button>
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  const statusMeta = getReviewStatusMeta(review.status)
  const visible = review.status === 'visible'
  const mediaCount = review.media?.length ?? 0

  return (
    <DashboardLayout pageTitle={review.shopperName || 'Review'}>
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />

            <Link
              to="/reviews"
              className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
            >
              <ArrowLeft className="size-3.5" />
              Back to reviews
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Review
                </p>
                <div className="mt-3">
                  <ReviewIdentity review={review} size="lg" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ReviewStatusBadge status={review.status} />
                  {review.featured ? <ReviewFeaturedBadge /> : null}
                  {review.verifiedPurchase ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800 ring-1 ring-sky-200">
                      <BadgeCheck className="size-3" strokeWidth={2.25} aria-hidden="true" />
                      Verified purchase
                    </span>
                  ) : null}
                  <p className="text-sm text-slate-500">{statusMeta.hint}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStatusOpen(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {visible ? 'Hide' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => setFeaturedOpen(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Star className="size-3.5" />
                  {review.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  type="button"
                  onClick={() => setRemoving(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <CountCard
              label="Rating"
              value={`${review.rating || 0}/5`}
              hint="Stars the shopper gave this listing"
            />
            <CountCard
              label="Attachments"
              value={formatCount(mediaCount)}
              hint={mediaCount ? 'Photos or other files on this review' : 'No files attached'}
            />
            <CountCard
              label="Visibility"
              value={statusMeta.label}
              hint={statusMeta.helper}
            />
            <CountCard
              label="Featured"
              value={review.featured ? 'Yes' : 'No'}
              hint={review.featured ? 'Highlighted on the listing' : 'Not highlighted'}
            />
          </div>
        </DashboardReveal>

        <div className="grid items-start gap-4 lg:grid-cols-5">
          <DashboardReveal index={2} className="lg:col-span-3">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <h3 className="text-sm font-bold text-slate-900">Comment</h3>
                <p className="text-xs text-slate-500">What the shopper wrote</p>
              </div>
              <div className="space-y-4 px-5 py-5">
                {review.title ? (
                  <h4 className="text-base font-bold text-slate-950">{review.title}</h4>
                ) : null}
                {review.comment ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{review.comment}</p>
                ) : (
                  <p className="text-sm text-slate-500">This shopper left a rating without a written comment.</p>
                )}
                {review.vendorReply?.text ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Store reply</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{review.vendorReply.text}</p>
                    {review.vendorReply.createdAt ? (
                      <p className="mt-2 text-[11px] text-slate-400">{formatReviewDateTime(review.vendorReply.createdAt)}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <h3 className="text-sm font-bold text-slate-900">Attachments</h3>
                <p className="text-xs text-slate-500">Photos, video, or other files the shopper added</p>
              </div>
              <div className="px-5 py-5">
                <ReviewMediaGrid media={review.media} onRemove={setMediaToRemove} />
              </div>
            </section>
          </DashboardReveal>

          <DashboardReveal index={3} className="lg:col-span-2">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <h3 className="text-sm font-bold text-slate-900">Details</h3>
                <p className="text-xs text-slate-500">Who wrote it and where it sits</p>
              </div>
              <div className="divide-y divide-slate-100 px-5">
                <FactRow icon={UserRound} label="Shopper">
                  {review.shopperId ? (
                    <Link to={`/users/${encodeURIComponent(review.shopperId)}`} className="text-brand hover:underline">
                      {review.shopperName}
                    </Link>
                  ) : review.shopperName}
                  {review.shopperEmail ? (
                    <p className="mt-0.5 text-xs font-normal text-slate-500">{review.shopperEmail}</p>
                  ) : null}
                </FactRow>
                <FactRow icon={Package} label="Listing">
                  {review.productId ? (
                    <Link to={`/products/${encodeURIComponent(review.productId)}`} className="text-brand hover:underline">
                      {review.productName}
                    </Link>
                  ) : review.productName}
                </FactRow>
                {review.vendorName || review.vendorId ? (
                  <FactRow icon={Store} label="Store">
                    {review.vendorId ? (
                      <Link to={`/vendors/${encodeURIComponent(review.vendorId)}`} className="text-brand hover:underline">
                        {review.vendorName || 'Store'}
                      </Link>
                    ) : review.vendorName}
                  </FactRow>
                ) : null}
                {review.orderNumber || review.orderId ? (
                  <FactRow icon={Package} label="Order">
                    {review.orderId ? (
                      <Link to={`/orders/${encodeURIComponent(review.orderId)}`} className="text-brand hover:underline">
                        {review.orderNumber || 'Order'}
                      </Link>
                    ) : review.orderNumber}
                  </FactRow>
                ) : null}
                <FactRow icon={ImageIcon} label="Attachments">{formatCount(mediaCount)}</FactRow>
                <FactRow icon={Calendar} label="Posted">{formatReviewDateTime(review.createdAt)}</FactRow>
                {review.updatedAt ? (
                  <FactRow icon={Clock} label="Last updated">{formatReviewDateTime(review.updatedAt)}</FactRow>
                ) : null}
              </div>
            </section>
          </DashboardReveal>
        </div>
      </div>

      <ReviewStatusModal open={statusOpen} review={review} onClose={() => setStatusOpen(false)} />
      <ReviewFeaturedModal open={featuredOpen} review={review} onClose={() => setFeaturedOpen(false)} />
      <ReviewRemoveModal
        open={removing}
        review={review}
        onClose={() => setRemoving(false)}
        onRemoved={() => navigate('/reviews')}
      />
      <ReviewMediaRemoveModal
        open={Boolean(mediaToRemove)}
        review={review}
        media={mediaToRemove}
        onClose={() => setMediaToRemove(null)}
      />
    </DashboardLayout>
  )
}
