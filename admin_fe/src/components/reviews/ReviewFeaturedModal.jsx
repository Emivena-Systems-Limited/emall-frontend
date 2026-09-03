import { Loader2, Star, StarOff } from 'lucide-react'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import ReviewIdentity from './ReviewIdentity'
import ReviewStatusBadge, { ReviewFeaturedBadge } from './ReviewStatusBadge'
import { useUpdateReviewFeaturedMutation } from '../../hooks/useAdminReviews'

export default function ReviewFeaturedModal({ open, review, onClose }) {
  if (!open || !review) return null
  return <ReviewFeaturedForm key={review.id} review={review} onClose={onClose} />
}

function ReviewFeaturedForm({ review, onClose }) {
  const mutation = useUpdateReviewFeaturedMutation()
  const busy = mutation.isPending
  const featured = Boolean(review.featured)

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleSave = async () => {
    try {
      await mutation.mutateAsync({ id: review.id, isFeatured: !featured })
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="review-featured-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="review-featured-title"
        icon={featured ? StarOff : Star}
        title={featured ? 'Remove this from featured?' : 'Feature this review?'}
        subtitle={featured
          ? 'It will stay on the listing if it is visible, but it will no longer be highlighted.'
          : 'Highlighted reviews are easier for shoppers to notice on the listing.'}
        onClose={handleClose}
      />

      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <ReviewIdentity review={review} />
          {featured ? <ReviewFeaturedBadge /> : <ReviewStatusBadge status={review.status} />}
        </div>
      </VendorDialogBody>

      <VendorDialogFooter>
        <button
          type="button"
          disabled={busy}
          onClick={handleClose}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleSave}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {featured ? 'Remove featured' : 'Feature review'}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
