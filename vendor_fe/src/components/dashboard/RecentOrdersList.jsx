import { Link } from 'react-router'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { RECENT_ORDERS } from '../../constants/ordersData'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import OrderStatusBadge from './OrderStatusBadge'
import ProductThumbnail from './ProductThumbnail'
import EmptyState from './EmptyState'

function formatOrderDateTime(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RecentOrdersList({ orders = RECENT_ORDERS }) {
  const preset = EMPTY_STATE_PRESETS.orders

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
              <ShoppingBag className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Recent orders</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">Latest vendor orders across your store</p>
        </div>
        {orders.length > 0 && (
          <Link
            to="/orders"
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-cyan-700 transition-colors hover:text-cyan-900"
          >
            View all orders
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={preset.icon}
          title={preset.title}
          description={preset.description}
        />
      ) : (
        <>
          <div className="hidden grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1fr)_auto_auto] gap-4 border-b border-slate-100 px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 lg:grid">
            <span>Product</span>
            <span>Order</span>
            <span>Date & time</span>
            <span>Status</span>
            <span className="text-right">Amount</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="block cursor-pointer px-5 py-4 transition-colors hover:bg-slate-50/80 lg:grid lg:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1fr)_auto_auto] lg:items-center lg:gap-4"
                >
                  <div className="flex items-start gap-3 lg:contents">
                    <ProductThumbnail src={order.thumbnail} alt={order.productName} />

                    <div className="min-w-0 flex-1 lg:col-span-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{order.productName}</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">{order.id}</p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-bold text-slate-900 lg:hidden">
                          GH₵ {order.amount.toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 lg:hidden">
                        {formatOrderDateTime(order.dateTime)}
                      </p>
                      <div className="mt-2 lg:hidden">
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 hidden text-xs text-slate-600 lg:col-span-1 lg:mt-0 lg:block">
                    {formatOrderDateTime(order.dateTime)}
                  </p>

                  <div className="hidden lg:block">
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <p className="hidden whitespace-nowrap text-sm font-bold text-slate-900 lg:block lg:text-right">
                    GH₵ {order.amount.toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
