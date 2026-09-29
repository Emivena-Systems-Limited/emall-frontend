import { Link } from 'react-router'
import { Receipt } from 'lucide-react'
import { formatFinanceDateTime, payoutMenuActions } from '../../constants/finance'
import { formatOrderMoney } from '../../utils/formatters'
import SlideDrawer from '../vendors/SlideDrawer'
import PayoutStatusBadge from './PayoutStatusBadge'

function MoneyRow({ label, value, emphasis = false }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-2 text-sm ${emphasis ? 'border-t border-slate-200 pt-3' : ''}`}>
      <span className={emphasis ? 'font-semibold text-slate-900' : 'text-slate-500'}>{label}</span>
      <span className={`tabular-nums ${emphasis ? 'text-base font-bold text-slate-950' : 'font-semibold text-slate-800'}`}>
        {formatOrderMoney(value)}
      </span>
    </div>
  )
}

export default function PayoutDetailsDrawer({ payout, canManage, onClose, onAction }) {
  if (!payout) return null
  const actions = payoutMenuActions(payout, canManage).filter((action) => action !== 'view')

  return (
    <SlideDrawer
      open
      onClose={onClose}
      labelledBy="payout-details-title"
      title={payout.id}
      subtitle={payout.vendorName}
      icon={Receipt}
      widthClass="max-w-lg"
      footer={actions.length ? (
        <div className="flex flex-col gap-2">
          {actions.map((action) => {
            if (action === 'vendor') {
              return (
                <Link
                  key={action}
                  to={`/vendors/${encodeURIComponent(payout.vendorId)}`}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  View vendor
                </Link>
              )
            }
            const danger = action === 'cancel'
            const label = action === 'approve' ? 'Process payout' : action === 'retry' ? 'Retry failed payout' : 'Cancel payout'
            return (
              <button
                key={action}
                type="button"
                onClick={() => onAction(payout, action)}
                className={`w-full cursor-pointer rounded-xl py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  danger
                    ? 'bg-rose-700 text-white hover:bg-rose-800 focus-visible:ring-rose-600'
                    : 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-brand'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      ) : null}
    >
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
            <PayoutStatusBadge status={payout.status} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-slate-400">Method</dt>
              <dd className="mt-0.5 font-semibold text-slate-900">{payout.method}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Vendor</dt>
              <dd className="mt-0.5 font-semibold text-slate-900">{payout.vendorName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Scheduled</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{formatFinanceDateTime(payout.scheduledAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Processed</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{formatFinanceDateTime(payout.processedAt)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-slate-400">Payment reference</dt>
              <dd className="mt-0.5 font-mono text-xs font-semibold text-slate-900">{payout.reference || '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-2">
          <h3 className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Settlement</h3>
          <MoneyRow label="Gross sales" value={payout.gross} />
          <MoneyRow label="Platform commission" value={payout.commission} />
          <MoneyRow label="Other deductions" value={payout.fees} />
          {payout.refunds > 0 ? <MoneyRow label="Refund adjustments" value={payout.refunds} /> : null}
          <MoneyRow label="Net payout" value={payout.amount} emphasis />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <h3 className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-900">Related transactions</h3>
          <ul className="divide-y divide-slate-100">
            {payout.transactions.map((transaction) => (
              <li key={transaction.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="font-mono text-xs font-semibold text-slate-800">{transaction.orderNumber}</span>
                <span className="text-sm font-semibold tabular-nums text-slate-900">{formatOrderMoney(transaction.amount)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">Activity</h3>
          <ol className="mt-3 space-y-3">
            {[...payout.history].reverse().map((event) => (
              <li key={event.id} className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                <div>
                  <p className="text-sm text-slate-800">{event.label}</p>
                  <p className="text-[11px] text-slate-400">{formatFinanceDateTime(event.at)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </SlideDrawer>
  )
}
