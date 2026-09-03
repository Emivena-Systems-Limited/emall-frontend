import { Loader2, Pause, Play } from 'lucide-react'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import CouponIdentity from './CouponIdentity'
import CouponStatusBadge from './CouponStatusBadge'
import { getCouponStatusMeta } from '../../constants/coupons'
import { useUpdateCouponStatusMutation } from '../../hooks/useAdminCoupons'

export default function CouponStatusModal({ open, coupon, onClose }) {
  if (!open || !coupon) return null
  return <CouponStatusForm key={coupon.id} coupon={coupon} onClose={onClose} />
}

function CouponStatusForm({ coupon, onClose }) {
  const mutation = useUpdateCouponStatusMutation()
  const busy = mutation.isPending
  const live = coupon.status === 'live'
  const nextActive = !live
  const nextMeta = getCouponStatusMeta(nextActive ? 'live' : 'paused')

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleSave = async () => {
    try {
      await mutation.mutateAsync({ id: coupon.id, isActive: nextActive })
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="coupon-status-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="coupon-status-title"
        icon={live ? Pause : Play}
        title={live ? 'Pause this coupon?' : 'Turn this coupon on?'}
        subtitle={live
          ? 'Checkout will stop accepting the code until you turn it back on.'
          : 'Shoppers will be able to use this code at checkout again.'}
        onClose={handleClose}
      />

      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <CouponIdentity coupon={coupon} />
          <CouponStatusBadge status={coupon.status} />
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
          {live ? 'Pause coupon' : 'Turn on'}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
