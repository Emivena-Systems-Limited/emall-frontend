import { useState } from 'react'
import { CheckCircle2, Clock, Loader2, Shield, XCircle } from 'lucide-react'
import { BRAND_STATUSES, getBrandStatusMeta } from '../../constants/brands'
import { useUpdateBrandStatusMutation } from '../../hooks/useAdminBrands'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import BrandStatusBadge from './BrandStatusBadge'

const ICONS = {
  'check-circle': CheckCircle2,
  clock: Clock,
  'x-circle': XCircle,
}

export default function BrandStatusModal({ open, brand, onClose }) {
  if (!open || !brand) return null
  return <BrandStatusForm key={brand.id} brand={brand} onClose={onClose} />
}

function BrandStatusForm({ brand, onClose }) {
  const [selected, setSelected] = useState(brand.status)
  const mutation = useUpdateBrandStatusMutation()
  const busy = mutation.isPending
  const unchanged = selected === brand.status
  const nextMeta = getBrandStatusMeta(selected)

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleSave = async () => {
    if (unchanged) {
      onClose()
      return
    }

    try {
      await mutation.mutateAsync({ id: brand.id, status: selected })
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="brand-status-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="brand-status-title"
        icon={Shield}
        title="Update brand status"
        subtitle={`Change whether ${brand.name} is visible to shoppers`}
        onClose={handleClose}
      />

      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-3">
          <p className="text-xs font-semibold text-slate-500">Current status</p>
          <BrandStatusBadge status={brand.status} />
        </div>

        <div className="grid gap-2" role="radiogroup" aria-label="Brand status">
          {BRAND_STATUSES.map((status) => {
            const Icon = ICONS[status.icon] ?? Clock
            const active = selected === status.key
            return (
              <button
                key={status.key}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={busy}
                onClick={() => setSelected(status.key)}
                className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? 'border-slate-900 bg-slate-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${status.badgeClass}`}>
                  <Icon className="size-3.5" strokeWidth={2.1} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900">{status.label}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-400">{status.hint}</span>
                </span>
              </button>
            )
          })}
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
          {unchanged ? 'Done' : `Set to ${nextMeta.label}`}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
