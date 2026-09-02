import { useState } from 'react'
import { Loader2, Truck } from 'lucide-react'
import {
  ADMIN_UPDATABLE_DELIVERY_STATUSES,
  DELIVERY_STATUSES,
  getDeliveryStatusMeta,
} from '../../constants/adminOrders'
import { useUpdateOrderDeliveryStatusMutation } from '../../hooks/useAdminOrders'
import { getOrderApiId } from '../../utils/normalizeAdminOrders'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import DeliveryStatusBadge from './DeliveryStatusBadge'

function getDeliveryStatusOptions(currentStatus) {
  const options = [...ADMIN_UPDATABLE_DELIVERY_STATUSES]
  if (currentStatus && !options.includes(currentStatus) && currentStatus !== 'cancelled' && currentStatus !== 'refunded') {
    options.push(currentStatus)
  }
  return options
}

export default function OrderDeliveryStatusModal({ open, order, onClose }) {
  if (!open || !order) return null
  return <OrderDeliveryStatusForm key={order.apiId || order.id} order={order} onClose={onClose} />
}

function OrderDeliveryStatusForm({ order, onClose }) {
  const currentStatus = order.deliveryStatus ?? ''
  const [selected, setSelected] = useState(currentStatus)
  const mutation = useUpdateOrderDeliveryStatusMutation()
  const busy = mutation.isPending
  const unchanged = selected === currentStatus
  const nextMeta = getDeliveryStatusMeta(selected)
  const statusOptions = getDeliveryStatusOptions(currentStatus)

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
        deliveryStatus: selected,
      })
      onClose()
    } catch {
      /* toast handled */
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="order-delivery-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="order-delivery-title"
        icon={Truck}
        title="Update delivery status"
        subtitle={`Choose a delivery status for ${order.orderNumber}. You can move forward or revert if needed.`}
        onClose={handleClose}
      />
      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{order.productName || order.orderNumber}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{order.orderNumber}</p>
          </div>
          <DeliveryStatusBadge status={currentStatus} />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            New status
          </span>
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            disabled={busy}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {DELIVERY_STATUSES[status]?.label ?? status.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
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
          disabled={busy || unchanged}
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
