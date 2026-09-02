import { useState } from 'react'
import { Ban, CheckCircle2, Clock, Loader2, Pencil, XCircle } from 'lucide-react'
import { VENDOR_STATUSES, getVendorStatusMeta } from '../../constants/vendorsData'
import { validateVendorStatusReason } from '../../constants/vendors'
import { useUpdateVendorStatusMutation } from '../../hooks/useAdminVendors'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from './VendorDialog'
import VendorStatusBadge from './VendorStatusBadge'
import VendorStatusReasonField from './VendorStatusReasonField'

const ICONS = {
  'check-circle': CheckCircle2,
  clock: Clock,
  ban: Ban,
  'x-circle': XCircle,
}

export default function VendorStatusModal({ open, vendor, onClose, onRequestSuspend }) {
  if (!open || !vendor) return null
  return <VendorStatusForm vendor={vendor} onClose={onClose} onRequestSuspend={onRequestSuspend} />
}

function VendorStatusForm({ vendor, onClose, onRequestSuspend }) {
  const [selected, setSelected] = useState(vendor.status)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const mutation = useUpdateVendorStatusMutation()
  const busy = mutation.isPending
  const unchanged = selected === vendor.status

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleSave = async () => {
    if (unchanged) {
      onClose()
      return
    }

    if (selected === 'suspended') {
      onClose()
      onRequestSuspend?.()
      return
    }

    if (selected === 'rejected') {
      const nextError = validateVendorStatusReason(reason)
      if (nextError) {
        setReasonError(nextError)
        return
      }
    }

    try {
      await mutation.mutateAsync({
        vendorId: vendor.id,
        status: selected,
        rejectionReason: selected === 'rejected' ? reason.trim() : undefined,
      })
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="vendor-status-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="vendor-status-title"
        icon={Pencil}
        title="Update vendor account"
        subtitle={`Change the status for ${vendor.store}`}
        onClose={handleClose}
      />

      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-3">
          <p className="text-xs font-semibold text-slate-500">Current status</p>
          <VendorStatusBadge status={vendor.status} />
        </div>

        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Vendor status">
          {VENDOR_STATUSES.map((status) => {
            const Icon = ICONS[status.icon] ?? Clock
            const active = selected === status.key
            return (
              <button
                key={status.key}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={busy}
                onClick={() => {
                  setSelected(status.key)
                  if (status.key !== 'rejected' && reasonError) setReasonError('')
                }}
                className={`flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? 'border-slate-900 bg-slate-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ring-1 ${status.badgeClass}`}>
                  <Icon className="size-3.5" strokeWidth={2.1} />
                </span>
                <span className="min-w-0 truncate text-sm font-semibold text-slate-900">{status.label}</span>
              </button>
            )
          })}
        </div>

        {!unchanged && selected === 'rejected' && (
          <VendorStatusReasonField
            value={reason}
            error={reasonError}
            disabled={busy}
            onChange={(value) => {
              setReason(value)
              if (reasonError) setReasonError('')
            }}
          />
        )}
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
          {unchanged ? 'Done' : selected === 'rejected' ? 'Reject' : `Set to ${getVendorStatusMeta(selected).label}`}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
