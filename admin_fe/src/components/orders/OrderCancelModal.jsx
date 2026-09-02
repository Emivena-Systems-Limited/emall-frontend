import { Loader2, Ban } from 'lucide-react'
import { useCancelOrderMutation } from '../../hooks/useAdminOrders'
import { getOrderApiId } from '../../utils/normalizeAdminOrders'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import DeliveryStatusBadge from './DeliveryStatusBadge'

export default function OrderCancelModal({ open, order, onClose }) {
  if (!open || !order) return null
  return <OrderCancelForm key={order.apiId || order.id} order={order} onClose={onClose} />
}

function OrderCancelForm({ order, onClose }) {
  const mutation = useCancelOrderMutation()
  const busy = mutation.isPending

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync({ id: getOrderApiId(order) })
      onClose()
    } catch {
      /* toast handled */
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="order-cancel-title" widthClass="max-w-md">
      <VendorDialogHeader
        id="order-cancel-title"
        icon={Ban}
        iconClass="bg-rose-50 text-rose-700"
        title="Cancel this order?"
        subtitle="This stops fulfilment. The shopper and vendor will see it as cancelled."
        onClose={handleClose}
      />
      <VendorDialogBody className="px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{order.orderNumber}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {order.customer?.name || 'Shopper'}
              {order.vendorName ? ` · ${order.vendorName}` : ''}
            </p>
          </div>
          <DeliveryStatusBadge status={order.deliveryStatus} />
        </div>
      </VendorDialogBody>
      <VendorDialogFooter>
        <button
          type="button"
          disabled={busy}
          onClick={handleClose}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Keep order
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleConfirm}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Cancel order
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
