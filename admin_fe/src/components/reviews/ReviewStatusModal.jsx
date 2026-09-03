import { Eye, EyeOff, Loader2 } from 'lucide-react'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import ReviewIdentity from './ReviewIdentity'
import ReviewStatusBadge from './ReviewStatusBadge'
import { getReviewStatusMeta } from '../../constants/reviews'
import { useUpdateReviewStatusMutation } from '../../hooks/useAdminReviews'

export default function ReviewStatusModal({ open, review, onClose }) {
  if (!open || !review) return null
  return <ReviewStatusForm key={review.id} review={review} onClose={onClose} />
}

function ReviewStatusForm({ review, onClose }) {
  const mutation = useUpdateReviewStatusMutation()
  const busy = mutation.isPending
  const visible = review.status === 'visible'
  const nextApproved = !visible
  const nextMeta = getReviewStatusMeta(nextApproved ? 'visible' : 'hidden')

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleSave = async () => {
    try {
      await mutation.mutateAsync({ id: review.id, isApproved: nextApproved })
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="review-status-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="review-status-title"
        icon={visible ? EyeOff : Eye}
        title={visible ? 'Hide this review?' : 'Approve this review?'}
        subtitle={visible
          ? 'Shoppers will no longer see this comment on the listing.'
          : 'Shoppers will be able to read this comment on the listing.'}
        onClose={handleClose}
      />

      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <ReviewIdentity review={review} />
          <ReviewStatusBadge status={review.status} />
        </div>
        <p className="text-sm leading-relaxed text-slate-500">{nextMeta.hint}</p>
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
          {visible ? 'Hide review' : 'Approve review'}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
