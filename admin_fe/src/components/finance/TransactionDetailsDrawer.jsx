import { formatFinanceDateTime } from '../../constants/finance'
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from '../../constants/financeLedger'
import { formatOrderMoney } from '../../utils/formatters'
import SlideDrawer from '../vendors/SlideDrawer'
import { Receipt } from 'lucide-react'

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-900">{value}</dd>
    </div>
  )
}

export default function TransactionDetailsDrawer({ transaction, onClose }) {
  if (!transaction) return null
  const status = TRANSACTION_STATUSES[transaction.status]

  return (
    <SlideDrawer
      open
      onClose={onClose}
      labelledBy="transaction-details-title"
      title={transaction.id}
      subtitle={TRANSACTION_TYPES[transaction.type]}
      icon={Receipt}
      widthClass="max-w-lg"
    >
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex justify-end">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${status.className}`}>
              <span className={`size-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <dl>
            <Row label="Transaction reference" value={transaction.id} />
            <Row label="Order reference" value={transaction.orderId} />
            <Row label="Customer" value={transaction.customer} />
            <Row label="Vendor" value={transaction.vendorName} />
            <Row label="Payment method" value={transaction.method} />
            <Row label="Provider reference" value={transaction.providerRef || '—'} />
            <Row label="Date" value={formatFinanceDateTime(transaction.at)} />
            <Row label="Related payout" value={transaction.payoutId || '—'} />
          </dl>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-2">
          <dl>
            <Row label="Gross amount" value={formatOrderMoney(transaction.gross)} />
            <Row label="Fees" value={formatOrderMoney(transaction.fees)} />
            <Row label="Commission" value={formatOrderMoney(transaction.commission)} />
            <Row label="Refund amount" value={formatOrderMoney(transaction.refunds)} />
            <Row label="Amount" value={formatOrderMoney(transaction.amount)} />
          </dl>
        </section>
      </div>
    </SlideDrawer>
  )
}
