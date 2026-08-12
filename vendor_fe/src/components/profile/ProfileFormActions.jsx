import { Loader2 } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'

export default function ProfileFormActions({
  isEditing,
  isDirty = false,
  isSubmitting = false,
  onEdit,
  onCancel,
  onSave,
  editLabel = 'Edit Profile',
  saveLabel = 'Save Changes',
  loadingLabel = 'Saving…',
  discardOpen = false,
  onDiscardClose,
  onDiscardConfirm,
}) {
  if (!isEditing) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800"
        >
          {editLabel}
        </button>
      </div>
    )
  }

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
          onClick={onSave}
          disabled={isSubmitting}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? loadingLabel : saveLabel}
        </button>
      </div>

      <ConfirmModal
        open={discardOpen}
        title="Unsaved changes"
        description="You have unsaved changes. Are you sure you want to leave?"
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        tone="danger"
        onConfirm={onDiscardConfirm}
        onClose={onDiscardClose}
      />
    </>
  )
}
