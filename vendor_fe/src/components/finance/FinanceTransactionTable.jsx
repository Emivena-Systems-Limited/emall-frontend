import { ArrowUpRight, Receipt } from 'lucide-react'
import { Link } from 'react-router'
import { formatMoney, formatTransactionDate } from '../../utils/financeUtils'
import TransactionStatusBadge from './TransactionStatusBadge'
import TransactionTypeBadge from './TransactionTypeBadge'

const TABLE_HEAD_CLASS =
  'whitespace-nowrap px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400'

function TransactionMobileCard({ transaction, onViewDetails }) {
  const isCredit = transaction.amount > 0

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-slate-400">{transaction.id}</p>
          <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
            {transaction.description}
          </p>
          <p className="mt-1 text-xs text-slate-500">{formatTransactionDate(transaction.date)}</p>
        </div>
        <p className={`shrink-0 text-sm font-bold tabular-nums ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
          {formatMoney(transaction.amount, { showSign: true })}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TransactionTypeBadge type={transaction.type} />
        <TransactionStatusBadge status={transaction.status} />
        {transaction.orderId && (
          <Link
            to={`/orders/${transaction.orderId}`}
            className="text-xs font-semibold text-brand hover:underline"
          >
            {transaction.orderId}
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={() => onViewDetails(transaction)}
        className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
      >
        View Details
        <ArrowUpRight className="size-3.5" />
      </button>
    </article>
  )
}

export default function FinanceTransactionTable({ transactions, onViewDetails }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          <Receipt className="size-6" strokeWidth={1.5} />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-800">No transactions match your filters</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Try adjusting your search, date range, or filter criteria.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 p-4 lg:hidden">
        {transactions.map((txn) => (
          <TransactionMobileCard
            key={txn.id}
            transaction={txn}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-225 border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className={TABLE_HEAD_CLASS}>Date</th>
              <th className={TABLE_HEAD_CLASS}>Description</th>
              <th className={TABLE_HEAD_CLASS}>Type</th>
              <th className={TABLE_HEAD_CLASS}>Order ID</th>
              <th className={`${TABLE_HEAD_CLASS} text-right`}>Amount</th>
              <th className={TABLE_HEAD_CLASS}>Status</th>
              <th className={`${TABLE_HEAD_CLASS} text-right`}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((txn) => {
              const isCredit = txn.amount > 0
              return (
                <tr key={txn.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-500">
                    {formatTransactionDate(txn.date)}
                  </td>
                  <td className="max-w-60 px-5 py-3.5">
                    <p className="truncate font-medium text-slate-900">{txn.description}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-400">{txn.id}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <TransactionTypeBadge type={txn.type} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    {txn.orderId ? (
                      <Link
                        to={`/orders/${txn.orderId}`}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        {txn.orderId}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className={`whitespace-nowrap px-5 py-3.5 text-right font-bold tabular-nums ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {formatMoney(txn.amount, { showSign: true })}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <TransactionStatusBadge status={txn.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onViewDetails(txn)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand-light"
                    >
                      View Details
                      <ArrowUpRight className="size-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
