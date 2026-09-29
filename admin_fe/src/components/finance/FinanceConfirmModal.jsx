import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'

export default function FinanceConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  tone = 'primary',
  icon: Icon,
  onClose,
  onConfirm,
}) {
  const [busy, setBusy] = useState(false)
  if (!open) return null
  const danger = tone === 'danger'

  const handleConfirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
    } catch {
      setBusy(false)
    }
  }

  return (
    <VendorDialog open onClose={busy ? undefined : onClose} labelledBy="finance-confirm-title">
      <VendorDialogHeader
        id="finance-confirm-title"
        icon={Icon}
        iconClass={danger ? 'bg-rose-50 text-rose-700' : 'bg-brand-light text-brand'}
        title={title}
        subtitle={body}
        onClose={busy ? () => {} : onClose}
      />
      <VendorDialogBody className="px-5 py-4 sm:px-6">
        <p className="text-sm text-slate-600">This change is recorded in the finance history for this session.</p>
      </VendorDialogBody>
      <VendorDialogFooter>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Go back
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleConfirm}
          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
            danger ? 'bg-rose-700 hover:bg-rose-800 focus-visible:ring-rose-600' : 'bg-slate-900 hover:bg-slate-800 focus-visible:ring-brand'
          }`}
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {confirmLabel}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
