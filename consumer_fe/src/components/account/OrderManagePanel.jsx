import { Link } from 'react-router'
import { Clock3, Lock, XCircle } from 'lucide-react'
import { canCancelOrder, getOrderCancellationBlockReason } from '../../utils/normalizeOrders'

export default function OrderManagePanel({ order, onCancelRequest, className = '', compact = false }) {
  const shell = compact
    ? 'p-4 rounded-xl'
    : 'p-5 sm:p-6 rounded-2xl'
  const iconShell = compact ? 'size-9 rounded-lg' : 'size-11 rounded-xl'
  const iconSize = compact ? 'size-4' : 'size-5'
  const titleClass = compact ? 'text-xs font-bold' : 'text-sm font-bold'
  const bodyClass = compact ? 'mt-1 text-xs leading-5' : 'mt-2 text-sm leading-6 sm:mt-1'
  const buttonClass = compact
    ? 'px-4 py-2 text-xs rounded-lg'
    : 'px-5 py-3 text-sm rounded-xl'

  if (order.status === 'Cancelled') {
    return (
      <article className={`w-full border border-red-200 bg-linear-to-br from-red-50 to-white ${shell} ${className}`}>
        <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
          <span className={`flex shrink-0 items-center justify-center bg-red-100 text-red-600 ${iconShell}`}>
            <XCircle className={iconSize} strokeWidth={1.8} aria-hidden />
          </span>
          <div>
            <h3 className={`${titleClass} text-slate-950`}>Order cancelled</h3>
            <p className={`${bodyClass} text-slate-600`}>
              This order is no longer active. Refunds, if applicable, will follow your payment provider&apos;s timeline.
            </p>
          </div>
        </div>
      </article>
    )
  }

  if (canCancelOrder(order.raw)) {
    return (
      <article className={`w-full overflow-hidden border border-blue-200 bg-linear-to-br from-blue-50 via-white to-white ${shell} ${className}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
            <span className={`flex shrink-0 items-center justify-center bg-blue-100 text-blue-700 ${iconShell}`}>
              <Clock3 className={iconSize} strokeWidth={1.8} aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className={`${titleClass} text-slate-950`}>Still processing</h3>
              <p className={`${bodyClass} text-slate-600`}>
                You can cancel this order while it&apos;s being processed. Once it moves to ready for shipment, cancellation won&apos;t be available online.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onCancelRequest(order)}
            className={`inline-flex w-full shrink-0 items-center justify-center border border-red-200 bg-white font-bold text-red-600 transition hover:border-red-300 hover:bg-red-50 sm:w-auto ${buttonClass}`}
          >
            Cancel this order
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className={`w-full border border-slate-200 bg-slate-50 ${shell} ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
          <span className={`flex shrink-0 items-center justify-center bg-slate-200 text-slate-600 ${iconShell}`}>
            <Lock className={iconSize} strokeWidth={1.8} aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className={`${titleClass} text-slate-950`}>Cancellation unavailable</h3>
            <p className={`${bodyClass} text-slate-600`}>
              {getOrderCancellationBlockReason(order.raw)}
            </p>
          </div>
        </div>
        <Link
          to="/account/support"
          className={`inline-flex w-full shrink-0 items-center justify-center border border-slate-300 bg-white font-bold text-auth-primary transition hover:border-auth-primary hover:bg-red-50 sm:w-auto ${buttonClass}`}
        >
          Contact support
        </Link>
      </div>
    </article>
  )
}
