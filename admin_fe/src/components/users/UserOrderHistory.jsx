import { Link } from 'react-router'
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import DeliveryStatusBadge from '../orders/DeliveryStatusBadge'
import OrderItemPrice from '../orders/OrderItemPrice'
import PaymentStatusBadge from '../orders/PaymentStatusBadge'
import { formatCount } from '../../utils/formatters'
import { formatOrderDate, getOrderApiId } from '../../utils/normalizeAdminOrders'

export function UserOrderHistorySkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading order history">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-5 py-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton-shimmer h-3.5 w-32 rounded-md" />
            <div className="skeleton-shimmer h-3 w-48 rounded-md" />
          </div>
          <div className="skeleton-shimmer h-4 w-16 rounded-md" />
        </div>
      ))}
    </div>
  )
}

export default function UserOrderHistory({
  orders,
  pagination,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onPageChange,
}) {
  if (isLoading) return <UserOrderHistorySkeleton />

  if (isError) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Could not load order history"
        description={errorMessage || 'Orders for this shopper are unavailable right now.'}
        action={(
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Try again
          </button>
        )}
      />
    )
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders yet"
        description="Checkouts from this shopper will appear here."
      />
    )
  }

  const { page, lastPage, from, to, total } = pagination

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-2.5">Order</th>
              <th className="px-5 py-2.5">Store</th>
              <th className="px-5 py-2.5">Total</th>
              <th className="px-5 py-2.5">Payment</th>
              <th className="px-5 py-2.5">Delivery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const apiId = getOrderApiId(order)
              return (
                <tr key={apiId || order.id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-5 py-3">
                    <Link
                      to={`/orders/${encodeURIComponent(apiId)}`}
                      className="font-semibold text-slate-900 transition-colors hover:text-brand"
                    >
                      {order.orderNumber || 'Order'}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">{formatOrderDate(order.orderDate)}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{order.vendorName || '—'}</td>
                  <td className="px-5 py-3">
                    <OrderItemPrice amount={order.totalAmount} align="left" />
                  </td>
                  <td className="px-5 py-3">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-5 py-3">
                    <DeliveryStatusBadge status={order.deliveryStatus} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {orders.map((order) => {
          const apiId = getOrderApiId(order)
          return (
            <li key={apiId || order.id} className="px-5 py-3.5">
              <Link
                to={`/orders/${encodeURIComponent(apiId)}`}
                className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{order.orderNumber || 'Order'}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {order.vendorName || 'Store'}
                      {' · '}
                      {formatOrderDate(order.orderDate)}
                    </p>
                  </div>
                  <OrderItemPrice amount={order.totalAmount} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <DeliveryStatusBadge status={order.deliveryStatus} />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {total > pagination.perPage || lastPage > 1 ? (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{from}–{to}</span> of{' '}
            <span className="font-semibold text-slate-700">{formatCount(total)}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </button>
            <span className="min-w-12 text-center text-xs font-semibold text-slate-600">
              {page} / {lastPage}
            </span>
            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
