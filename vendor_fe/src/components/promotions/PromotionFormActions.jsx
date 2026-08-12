import { Loader2 } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'

export default function PromotionFormActions({
  mode = 'create',
  isDirty = false,
  isSubmitting = false,
  discardOpen = false,
  onDiscardClose,
  onDiscardConfirm,
  onCancel,
  onSaveDraft,
  onSubmit,
}) {
  const primaryLabel = mode === 'edit' ? 'Save Changes' : 'Create Promotion'
  const loadingLabel = mode === 'edit' ? 'Saving…' : 'Creating…'

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save as Draft
        </button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
            {isSubmitting ? loadingLabel : primaryLabel}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={discardOpen}
        title="Discard promotion?"
        description="You have unsaved changes. Are you sure you want to leave?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        tone="danger"
        onConfirm={onDiscardConfirm}
        onClose={onDiscardClose}
      />
    </>
  )
}
