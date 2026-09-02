import { Ban, Loader2, RotateCcw } from 'lucide-react'
import { useUpdateVendorStatusMutation } from '../../hooks/useAdminVendors'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from './VendorDialog'
import VendorStatusBadge from './VendorStatusBadge'

export default function VendorSuspendModal({ open, vendor, onClose }) {
  if (!open || !vendor) return null
  return <VendorSuspendForm vendor={vendor} onClose={onClose} />
}

function VendorSuspendForm({ vendor, onClose }) {
  const isSuspended = vendor.status === 'suspended'
  const mutation = useUpdateVendorStatusMutation()
  const busy = mutation.isPending
  const nextStatus = isSuspended ? 'approved' : 'suspended'

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync({
        vendorId: vendor.id,
        status: nextStatus,
      })
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="vendor-suspend-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="vendor-suspend-title"
        icon={isSuspended ? RotateCcw : Ban}
        iconClass={isSuspended ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}
        title={isSuspended ? 'Reinstate this store?' : 'Suspend this store?'}
        subtitle={vendor.store}
        onClose={handleClose}
      />

      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        {isSuspended ? (
          <p className="text-sm leading-relaxed text-slate-600">
            {vendor.store} will go back to <span className="font-semibold text-slate-900">Active</span>.
            Shoppers will see the storefront again, and payouts can resume.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-slate-600">
              This pauses <span className="font-semibold text-slate-900">{vendor.store}</span> across EZ-Mall.
            </p>
            <ul className="space-y-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900 ring-1 ring-rose-100">
              <li>The storefront is hidden from shoppers</li>
              <li>Live listings stop appearing in search</li>
              <li>Payouts stay on hold until you reinstate</li>
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-3">
          <p className="text-xs font-semibold text-slate-500">New status</p>
          <VendorStatusBadge status={nextStatus} />
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
          onClick={handleConfirm}
          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            isSuspended ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
          }`}
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {isSuspended ? 'Reinstate store' : 'Suspend vendor'}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
