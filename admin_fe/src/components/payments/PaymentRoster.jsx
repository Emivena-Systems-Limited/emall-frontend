import { Link, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Wallet } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import OverflowTooltip from '../common/OverflowTooltip'
import PaymentStatusBadge from '../orders/PaymentStatusBadge'
import { formatCount } from '../../utils/formatters'
import { formatPaymentDate } from '../../utils/normalizeAdminPayments'
import { prefetchAdminPayment } from '../../hooks/useAdminPayments'
import PaymentActions from './PaymentActions'
import PaymentIdentity, { PaymentRosterSkeleton } from './PaymentIdentity'

export { PaymentRosterSkeleton }

export default function PaymentRoster({
  items,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasFilters = false,
  status = '',
  onStatus,
  onRefund,
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const prefetch = (id) => prefetchAdminPayment(queryClient, id)

  if (total === 0) {
    const emptyTitle = hasFilters
      ? 'No payments match these filters'
      : status === 'paid'
        ? 'No captured payments'
        : status === 'pending'
          ? 'Nothing is waiting to clear'
          : status === 'failed'
            ? 'No failed payments'
            : status === 'refunded'
              ? 'No refunds yet'
              : 'No payments yet'
    const emptyCopy = hasFilters
      ? 'Try a different status or search, or clear the current filters.'
      : 'Checkout charges will appear here once they are returned by the API.'

    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Wallet}
          title={emptyTitle}
          description={emptyCopy}
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
              <th className="px-5 py-2.5">Payment</th>
              <th className="px-5 py-2.5">Shopper</th>
              <th className="px-5 py-2.5">Order</th>
              <th className="px-5 py-2.5">Method</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5">When</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <Link
                    to={`/payments/${encodeURIComponent(item.id)}`}
                    onMouseEnter={() => prefetch(item.id)}
                    onFocus={() => prefetch(item.id)}
                    className="block max-w-52 rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <PaymentIdentity item={item} />
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <div className="max-w-36">
                    <OverflowTooltip text={item.shopperName}>
                      {item.shopperId ? (
                        <Link
                          to={`/users/${encodeURIComponent(item.shopperId)}`}
                          className="block w-full truncate whitespace-nowrap text-sm font-medium text-slate-700 transition-colors hover:text-brand"
                        >
                          {item.shopperName || 'Shopper'}
                        </Link>
                      ) : (
                        <span className="block w-full truncate whitespace-nowrap text-sm text-slate-500">
                          {item.shopperName || '—'}
                        </span>
                      )}
                    </OverflowTooltip>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {item.orderId ? (
                    <div className="max-w-36">
                      <OverflowTooltip text={item.orderNumber || item.orderId}>
                        <Link
                          to={`/orders/${encodeURIComponent(item.orderId)}`}
                          className="block w-full truncate font-mono text-xs font-semibold text-slate-800 transition-colors hover:text-brand"
                        >
                          {item.orderNumber || item.orderId}
                        </Link>
                      </OverflowTooltip>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">{item.method || '—'}</td>
                <td className="px-5 py-3">
                  <PaymentStatusBadge status={item.status} />
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500">
                  {formatPaymentDate(item.paidAt || item.createdAt)}
                </td>
                <td className="px-5 py-3 text-right">
                  <PaymentActions
                    item={item}
                    onView={() => navigate(`/payments/${encodeURIComponent(item.id)}`)}
                    onStatus={() => onStatus(item)}
                    onRefund={() => onRefund(item)}
                    onOpenOrder={() => item.orderId && navigate(`/orders/${encodeURIComponent(item.orderId)}`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                to={`/payments/${encodeURIComponent(item.id)}`}
                onMouseEnter={() => prefetch(item.id)}
                onFocus={() => prefetch(item.id)}
                className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <PaymentIdentity item={item} />
              </Link>
              <PaymentActions
                item={item}
                onView={() => navigate(`/payments/${encodeURIComponent(item.id)}`)}
                onStatus={() => onStatus(item)}
                onRefund={() => onRefund(item)}
                onOpenOrder={() => item.orderId && navigate(`/orders/${encodeURIComponent(item.orderId)}`)}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <PaymentStatusBadge status={item.status} />
              <span className="text-xs text-slate-500">{item.method || formatPaymentDate(item.paidAt || item.createdAt)}</span>
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
