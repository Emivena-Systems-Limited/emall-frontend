import { Loader2, Trash2 } from 'lucide-react'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import { useDeleteReviewMediaMutation } from '../../hooks/useAdminReviews'

export default function ReviewMediaRemoveModal({ open, review, media, onClose }) {
  if (!open || !review || !media) return null
  return (
    <ReviewMediaRemoveForm
      key={`${review.id}-${media.id}`}
      review={review}
      media={media}
      onClose={onClose}
    />
  )
}

function ReviewMediaRemoveForm({ review, media, onClose }) {
  const mutation = useDeleteReviewMediaMutation()
  const busy = mutation.isPending

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleConfirm = async () => {
    if (busy) return
    try {
      await mutation.mutateAsync({ id: review.id, mediaId: media.id })
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="review-media-remove-title" widthClass="max-w-md">
      <VendorDialogHeader
        id="review-media-remove-title"
        icon={Trash2}
        iconClass="bg-rose-50 text-rose-700"
        title="Remove this attachment?"
        subtitle="Shoppers will no longer see this photo or file on the review."
        onClose={handleClose}
      />

      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {media.kind === 'image' && media.url ? (
            <img src={media.url} alt="" className="max-h-48 w-full object-contain bg-white" />
          ) : media.kind === 'video' && media.url ? (
            <video src={media.url} className="max-h-48 w-full bg-slate-950" controls preload="metadata" />
          ) : (
            <p className="px-4 py-6 text-center text-sm font-medium text-slate-600">{media.name || 'Attachment'}</p>
          )}
        </div>
        <p className="text-xs text-slate-500">{media.name}</p>
      </VendorDialogBody>

      <VendorDialogFooter>
        <button
          type="button"
          disabled={busy}
          onClick={handleClose}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Keep attachment
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleConfirm}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Remove attachment
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
