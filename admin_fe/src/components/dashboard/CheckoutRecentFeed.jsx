import { Link } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import PaymentStatusBadge from '../orders/PaymentStatusBadge'
import { formatOrderMoney } from '../../utils/formatters'
import { formatCheckoutDate } from '../../utils/normalizeCheckoutAnalytics'
import EmptyState from './EmptyState'

export default function CheckoutRecentFeed({ items = [], isLoading, isError, onRetry }) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Recent checkouts</h2>
          <p className="text-xs text-slate-500">Latest paid orders from checkout</p>
        </div>
        <Link
          to="/orders"
          className="text-xs font-bold text-brand transition-colors hover:text-brand-hover"
        >
          Orders
        </Link>
      </div>

      {isLoading ? (
        <div className="flex-1 divide-y divide-slate-100" aria-busy="true" aria-label="Loading recent checkouts">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-3 w-36 rounded-md" />
                <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              </div>
              <div className="skeleton-shimmer h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          compact
          icon={ShoppingCart}
          title="Could not load checkouts"
          description="Recent checkout orders are unavailable right now."
          action={(
            <button
              type="button"
              onClick={onRetry}
              className="cursor-pointer rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Try again
            </button>
          )}
        />
      ) : items.length === 0 ? (
        <EmptyState
          compact
          icon={ShoppingCart}
          title="No checkouts yet"
          description="When shoppers finish paying, those orders will show up here."
        />
      ) : (
        <ul className="flex-1 divide-y divide-slate-100">
          {items.map((item) => {
            const href = `/orders/${encodeURIComponent(item.orderId)}`
            return (
              <li key={item.id}>
                <Link
                  to={href}
                  className="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/80"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-semibold text-slate-900">
                      {item.orderNumber || 'Order'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {item.shopperName || 'Shopper'}
                      {' · '}
                      {formatOrderMoney(item.amount)}
                      {' · '}
                      {formatCheckoutDate(item.createdAt)}
                    </p>
                  </div>
                  <PaymentStatusBadge status={item.paymentStatus} />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
