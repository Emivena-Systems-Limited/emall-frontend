import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { ORDER_STATUSES, VENDOR_UPDATABLE_STATUSES } from '../../constants/orders'
import OrderStatusBadge from './OrderStatusBadge'

function getStatusOptions(currentStatus) {
  const options = [...VENDOR_UPDATABLE_STATUSES]
  if (currentStatus && !options.includes(currentStatus)) {
    options.unshift(currentStatus)
  }
  return options
}

export default function UpdateOrderStatusModal({
  open,
  order,
  onClose,
  onConfirm,
  isLoading = false,
}) {
  const [selectedStatus, setSelectedStatus] = useState(order?.orderStatus ?? '')

  useEffect(() => {
    if (open && order) {
      setSelectedStatus(order.orderStatus)
    }
  }, [open, order])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isLoading) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, isLoading, onClose])

  if (!open || !order) return null

  const statusOptions = getStatusOptions(order.orderStatus)
  const hasChange = selectedStatus !== order.orderStatus

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-order-status-title"
    >
      <button
        type="button"
        aria-label="Close dialog"
        disabled={isLoading}
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-slate-950/50 backdrop-blur-sm disabled:cursor-not-allowed"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.28)]">
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <h2 id="update-order-status-title" className="text-lg font-bold text-slate-950">
            Update order status
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Choose a new status for order <span className="font-semibold text-slate-700">{order.orderNumber}</span>.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current</span>
            <OrderStatusBadge status={order.orderStatus} />
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              New status
            </span>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              disabled={isLoading}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUSES[status]?.label ?? status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(order, selectedStatus)}
            disabled={isLoading || !hasChange}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            Update status
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
