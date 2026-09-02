import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import {
  ADMIN_UPDATABLE_PAYMENT_STATUSES,
  getPaymentStatusMeta,
} from '../../constants/adminOrders'
import { useUpdateOrderPaymentStatusMutation } from '../../hooks/useAdminOrders'
import { getOrderApiId } from '../../utils/normalizeAdminOrders'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import PaymentStatusBadge from './PaymentStatusBadge'

export default function OrderPaymentStatusModal({ open, order, onClose }) {
  if (!open || !order) return null
  return <OrderPaymentStatusForm key={order.apiId || order.id} order={order} onClose={onClose} />
}

function OrderPaymentStatusForm({ order, onClose }) {
  const [selected, setSelected] = useState(order.paymentStatus)
  const mutation = useUpdateOrderPaymentStatusMutation()
  const busy = mutation.isPending
  const unchanged = selected === order.paymentStatus
  const nextMeta = getPaymentStatusMeta(selected)

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
      await mutation.mutateAsync({
        id: getOrderApiId(order),
        paymentStatus: selected,
      })
      onClose()
    } catch {
      /* toast handled */
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="order-payment-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="order-payment-title"
        icon={CreditCard}
        title="Update payment status"
        subtitle={`Set how payment stands for ${order.orderNumber}`}
        onClose={handleClose}
      />
      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{order.orderNumber}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{order.customer?.name || 'Shopper'}</p>
          </div>
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>

        <div className="grid gap-2" role="radiogroup" aria-label="Payment status">
          {ADMIN_UPDATABLE_PAYMENT_STATUSES.map((status) => {
            const meta = getPaymentStatusMeta(status)
            const active = selected === status
            return (
              <button
                key={status}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={busy}
                onClick={() => setSelected(status)}
                className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? 'border-slate-900 bg-slate-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${meta.well}`}>
                  <span className={`size-2 rounded-full ${meta.dot}`} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900">{meta.label}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-400">{meta.helper}</span>
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
