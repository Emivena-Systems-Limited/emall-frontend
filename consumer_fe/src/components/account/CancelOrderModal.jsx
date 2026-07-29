import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, PackageX, ShieldAlert, X } from 'lucide-react'
import { formatOrderNumber } from '../../utils/normalizeOrders'

const currency = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
})

export default function CancelOrderModal({ order, isPending, onClose, onConfirm }) {
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    setAcknowledged(false)
  }, [order?.id])

  useEffect(() => {
    if (!order) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isPending) {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPending, onClose, order])

  if (!order) return null

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-order-title"
      onClick={isPending ? undefined : onClose}
    >
      <div
        className="relative my-auto flex w-full max-w-sm max-h-[min(92dvh,28rem)] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden bg-linear-to-br from-[#9f2d22] via-auth-primary to-[#e06755] px-4 py-3.5 text-white">
          <div className="relative flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
              <PackageX className="size-4.5" strokeWidth={1.8} aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id="cancel-order-title" className="text-sm font-bold leading-snug tracking-tight sm:text-base">
                Cancel order{' '}
                <span className="tabular-nums">{formatOrderNumber(order.id, { withHash: true })}</span>?
              </h2>
              <p className="mt-1 text-[0.6875rem] leading-4 text-white/85">
                Processing will stop. You won&apos;t be charged again if payment is still pending.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50"
              aria-label="Close cancel order dialog"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 py-3.5">
          <article className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.625rem] font-bold uppercase tracking-widest text-slate-500">Order summary</p>
                <p className="mt-0.5 truncate text-xs font-bold text-slate-950">{order.title}</p>
                <p className="mt-0.5 text-[0.6875rem] text-slate-500">
                  {order.items} {order.items === 1 ? 'item' : 'items'} · {order.date}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-slate-950">{currency.format(order.amount)}</p>
            </div>
          </article>

          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3">
            <div className="flex items-start gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                <ShieldAlert className="size-3.5" strokeWidth={2} aria-hidden />
              </span>
              <div>
                <p className="text-xs font-bold text-amber-950">Before you continue</p>
                <ul className="mt-1 space-y-1 text-[0.6875rem] leading-4 text-amber-900/90">
                  <li>Only available while the order is still processing.</li>
                  <li>Refund timing depends on your payment method.</li>
                </ul>
              </div>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-red-200 hover:bg-red-50/30">
            <input
              type="checkbox"
              checked={acknowledged}
              disabled={isPending}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="mt-0.5 size-3.5 rounded border-slate-300 text-auth-primary focus:ring-auth-primary"
            />
            <span className="text-[0.6875rem] leading-4 text-slate-700">
              I understand this order will be cancelled and{' '}
              <strong className="font-semibold text-slate-900">cannot be restored</strong>.
            </span>
          </label>
        </div>

        <div className="grid shrink-0 gap-2 border-t border-slate-100 p-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Keep my order
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!acknowledged || isPending}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Cancelling…
              </>
            ) : (
              <>
                <AlertTriangle className="size-3.5" aria-hidden />
                Yes, cancel order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
