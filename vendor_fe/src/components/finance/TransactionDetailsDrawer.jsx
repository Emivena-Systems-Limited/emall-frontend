import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { Receipt, X } from 'lucide-react'
import { formatMoney, formatTransactionDate } from '../../utils/financeUtils'
import TransactionStatusBadge from './TransactionStatusBadge'
import TransactionTypeBadge from './TransactionTypeBadge'

function DetailRow({ label, value, highlight = false, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd
        className={`text-right text-sm font-semibold ${
          highlight ? 'text-lg font-bold text-slate-950' : 'text-slate-900'
        } ${mono ? 'font-mono text-xs tracking-wide' : ''}`}
      >
        {value}
      </dd>
    </div>
  )
}

export default function TransactionDetailsDrawer({ transaction, onClose }) {
  useEffect(() => {
    if (!transaction) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [transaction, onClose])

  if (!transaction) return null

  const isCredit = transaction.netAmount > 0

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-drawer-title"
        className="slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="relative overflow-hidden border-b border-slate-200 bg-linear-to-br from-brand-light/60 via-white to-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-brand/15">
                <Receipt className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand/70">
                  Transaction Details
                </p>
                <h2 id="transaction-drawer-title" className="truncate text-lg font-bold text-slate-900">
                  {transaction.id}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close panel"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <TransactionTypeBadge type={transaction.type} />
            <TransactionStatusBadge status={transaction.status} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <p className="text-sm leading-relaxed text-slate-600">{transaction.description}</p>

          <div className="mt-6 rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Net Amount</p>
            <p className={`mt-1 font-sans text-3xl font-bold tabular-nums ${isCredit ? 'text-emerald-600' : 'text-slate-950'}`}>
              {formatMoney(transaction.netAmount, { showSign: true })}
            </p>
          </div>

          <dl className="mt-6 divide-y divide-slate-100">
            <DetailRow label="Transaction ID" value={transaction.id} mono />
            {transaction.orderNumber && (
              <DetailRow
                label="Order Number"
                value={
                  <Link
                    to={`/orders/${transaction.orderNumber}`}
                    className="text-brand hover:underline"
                  >
                    {transaction.orderNumber}
                  </Link>
                }
              />
            )}
            <DetailRow label="Transaction Type" value={<TransactionTypeBadge type={transaction.type} />} />
            <DetailRow label="Description" value={transaction.description} />
            {transaction.grossAmount > 0 && (
              <DetailRow label="Gross Amount" value={formatMoney(transaction.grossAmount)} />
            )}
            {transaction.platformFee > 0 && (
              <DetailRow label="Platform Fee" value={`−${formatMoney(transaction.platformFee)}`} />
            )}
            {transaction.shippingFee > 0 && (
              <DetailRow label="Shipping Fee" value={formatMoney(transaction.shippingFee)} />
            )}
            {transaction.advertisementCharge > 0 && (
              <DetailRow label="Advertisement Charge" value={`−${formatMoney(transaction.advertisementCharge)}`} />
            )}
            {transaction.refundAmount > 0 && (
              <DetailRow label="Refund Amount" value={`−${formatMoney(transaction.refundAmount)}`} />
            )}
            <DetailRow
              label="Net Amount"
              value={formatMoney(transaction.netAmount, { showSign: true })}
              highlight
            />
            <DetailRow label="Transaction Date" value={formatTransactionDate(transaction.date)} />
            <DetailRow label="Payment Status" value={<TransactionStatusBadge status={transaction.status} />} />
          </dl>
        </div>

        <div className="shrink-0 border-t border-slate-200 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </aside>
    </>,
    document.body,
  )
}
