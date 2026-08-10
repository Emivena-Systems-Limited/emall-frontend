import { Loader2 } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'

export default function AddUserFormActions({
  isSubmitting = false,
  discardOpen = false,
  onCancel,
  onSubmit,
  onDiscardClose,
  onDiscardConfirm,
}) {
  return (
    <>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/70 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? 'Sending Invitation…' : 'Send Invitation'}
        </button>
      </div>

      <ConfirmModal
        open={discardOpen}
        title="Discard invitation?"
        description="You have unsaved changes. Are you sure you want to leave without sending the invitation?"
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        tone="danger"
        onConfirm={onDiscardConfirm}
        onClose={onDiscardClose}
      />
    </>
  )
}
