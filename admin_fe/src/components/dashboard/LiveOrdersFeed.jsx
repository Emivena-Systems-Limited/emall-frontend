import { Link } from 'react-router'
import { Package } from 'lucide-react'
import OverflowTooltip from '../common/OverflowTooltip'
import { useAdminOrderRoster } from '../../hooks/useAdminOrders'
import { formatOrderDate, getOrderApiId } from '../../utils/normalizeAdminOrders'
import { formatOrderMoney } from '../../utils/formatters'
import DeliveryStatusBadge from '../orders/DeliveryStatusBadge'

export default function LiveOrdersFeed() {
  const { orders, isLoading } = useAdminOrderRoster({}, 1)
  const items = orders.slice(0, 6)

  return (
    <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Orders</h2>
          <p className="text-xs text-slate-500">Latest marketplace checkouts</p>
        </div>
        <Link
          to="/orders"
          className="text-xs font-bold text-brand transition-colors hover:text-brand-hover"
        >
          View all
        </Link>
      </div>
      {isLoading ? (
        <div className="flex-1 divide-y divide-slate-100">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3.5">
              <div className="skeleton-shimmer size-11 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-3 w-40 rounded-md" />
                <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-5 py-8 text-center">
          <p className="text-sm text-slate-500">No orders yet.</p>
        </div>
      ) : (
        <div className="min-w-0 flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">Order</th>
                <th className="px-3 py-2.5">Store</th>
                <th className="w-[1%] whitespace-nowrap px-3 py-2.5">Total</th>
                <th className="w-[1%] whitespace-nowrap px-3 py-2.5 pr-4 sm:pr-5">Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((order) => {
                const apiId = getOrderApiId(order)
                return (
                  <tr key={apiId || order.id} className="hover:bg-slate-50/70">
                    <td className="min-w-0 px-4 py-3 sm:px-5">
                      <Link
                        to={`/orders/${encodeURIComponent(apiId)}`}
                        className="flex min-w-0 items-center gap-2.5"
                      >
                        {order.image ? (
                          <img src={order.image} alt="" className="size-10 shrink-0 rounded-xl object-cover ring-1 ring-slate-200" />
                        ) : (
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
                            <Package className="size-4" aria-hidden="true" />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-semibold tabular-nums text-slate-900">{order.orderNumber}</span>
                          <span className="mt-0.5 block truncate text-xs text-slate-500">{formatOrderDate(order.orderDate)}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="min-w-0 max-w-0 px-3 py-3">
                      <OverflowTooltip text={order.vendorName}>
                        <span className="block truncate whitespace-nowrap text-slate-700">
                          {order.vendorName || '—'}
                        </span>
                      </OverflowTooltip>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold tabular-nums text-slate-900">
                      {formatOrderMoney(order.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 pr-4 sm:pr-5">
                      <DeliveryStatusBadge status={order.deliveryStatus} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
