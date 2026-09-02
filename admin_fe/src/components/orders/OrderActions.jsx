import { Ban, CreditCard, Eye, Truck } from 'lucide-react'
import { canCancelOrder, canUpdateOrderDelivery } from '../../constants/adminOrders'

export default function OrderActions({
  order,
  onView,
  onPayment,
  onDelivery,
  onCancel,
}) {
  const name = order.orderNumber || 'this order'
  const canDeliver = canUpdateOrderDelivery(order)
  const canCancel = canCancelOrder(order)

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onView?.(order)
        }}
        aria-label={`View ${name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Eye className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onPayment?.(order)
        }}
        aria-label={`Update payment for ${name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-brand-light hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <CreditCard className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        disabled={!canDeliver}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (canDeliver) onDelivery?.(order)
        }}
        aria-label={`Update delivery for ${name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Truck className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        disabled={!canCancel}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (canCancel) onCancel?.(order)
        }}
        aria-label={`Cancel ${name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Ban className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}
