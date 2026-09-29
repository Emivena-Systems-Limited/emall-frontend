import { useState } from 'react'
import { Ban, Loader2, RefreshCw, Wallet } from 'lucide-react'
import { PAYOUT_CONFIRMATION } from '../../constants/finance'
import { formatOrderMoney } from '../../utils/formatters'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import PayoutStatusBadge from './PayoutStatusBadge'

const ICONS = {
  approve: Wallet,
  retry: RefreshCw,
  cancel: Ban,
}

export default function PayoutConfirmModal({ payout, action, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false)
  if (!payout || !action) return null

  const copy = PAYOUT_CONFIRMATION[action]
  const Icon = ICONS[action] ?? Wallet
  const danger = copy.tone === 'danger'

  const handleConfirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
    } catch {
      setBusy(false)
    }
  }

  return (
    <VendorDialog open onClose={busy ? undefined : onClose} labelledBy="payout-confirm-title" widthClass="max-w-md">
      <VendorDialogHeader
        id="payout-confirm-title"
        icon={Icon}
        iconClass={danger ? 'bg-rose-50 text-rose-700' : 'bg-brand-light text-brand'}
        title={copy.title}
        subtitle={copy.body}
        onClose={busy ? () => {} : onClose}
      />
      <VendorDialogBody className="px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-semibold text-slate-900">{payout.id}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {payout.vendorName} · {formatOrderMoney(payout.amount)}
            </p>
          </div>
          <PayoutStatusBadge status={payout.status} />
        </div>
      </VendorDialogBody>
      <VendorDialogFooter>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Keep payout
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleConfirm}
          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
            danger
              ? 'bg-rose-700 hover:bg-rose-800 focus-visible:ring-rose-600'
              : 'bg-slate-900 hover:bg-slate-800 focus-visible:ring-brand'
          }`}
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {copy.confirm}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
