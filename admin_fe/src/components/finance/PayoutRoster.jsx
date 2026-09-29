import { ChevronLeft, ChevronRight, Wallet } from 'lucide-react'
import { formatFinanceDate } from '../../constants/finance'
import { formatCount, formatOrderMoney } from '../../utils/formatters'
import EmptyState from '../dashboard/EmptyState'
import OverflowTooltip from '../common/OverflowTooltip'
import PayoutActions from './PayoutActions'
import TruncatedCell from './TruncatedCell'
import PayoutStatusBadge from './PayoutStatusBadge'

export default function PayoutRoster({
  items,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  hasFilters,
  onClearFilters,
  canManage,
  onAction,
}) {
  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Wallet}
          title={hasFilters ? 'No payouts match these filters' : 'No payouts in this period'}
          description={hasFilters
            ? 'Try another vendor, status, or amount, or clear the current filters.'
            : 'Scheduled vendor payouts for the selected dates will show up here.'}
          action={hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Clear filters
            </button>
          ) : null}
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">Payout ID</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">Vendor</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">Payout method</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">Amount</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">Status</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">Scheduled</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">Processed</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((payout) => (
              <tr key={payout.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => onAction(payout, 'view')}
                    className="cursor-pointer font-mono text-xs font-semibold text-slate-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {payout.id}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <TruncatedCell text={payout.vendorName} />
                </td>
                <td className="px-5 py-3">
                  <TruncatedCell text={payout.method} className="text-sm text-slate-600" />
                </td>
                <td className="px-5 py-3 text-sm font-semibold tabular-nums text-slate-950">{formatOrderMoney(payout.amount)}</td>
                <td className="px-5 py-3"><PayoutStatusBadge status={payout.status} /></td>
                <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500">{formatFinanceDate(payout.scheduledAt)}</td>
                <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500">{formatFinanceDate(payout.processedAt)}</td>
                <td className="px-5 py-3 text-right">
                  <PayoutActions payout={payout} canManage={canManage} onAction={onAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {items.map((payout) => (
          <li key={payout.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onAction(payout, 'view')}
                className="min-w-0 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <p className="font-mono text-xs font-semibold text-slate-900">{payout.id}</p>
                <div className="mt-1">
                  <OverflowTooltip text={payout.vendorName}>
                    <p className="truncate whitespace-nowrap text-sm font-medium text-slate-700">{payout.vendorName}</p>
                  </OverflowTooltip>
                </div>
                <p className="mt-1 text-sm font-bold tabular-nums text-slate-950">{formatOrderMoney(payout.amount)}</p>
              </button>
              <PayoutActions payout={payout} canManage={canManage} onAction={onAction} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <PayoutStatusBadge status={payout.status} />
              <span className="flex min-w-0 items-center gap-1 text-xs text-slate-500">
                <span className="min-w-0 max-w-28">
                  <OverflowTooltip text={payout.method}>
                    <span className="block truncate whitespace-nowrap">{payout.method}</span>
                  </OverflowTooltip>
                </span>
                <span className="whitespace-nowrap">· {formatFinanceDate(payout.scheduledAt)}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{rangeStart}–{rangeEnd}</span> of{' '}
          <span className="font-semibold text-slate-700">{formatCount(total)}</span>
        </p>
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </button>
            <span className="min-w-16 text-center text-xs font-semibold text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Next
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
