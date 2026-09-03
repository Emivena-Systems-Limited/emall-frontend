import { Link } from 'react-router'
import { ShoppingBag } from 'lucide-react'
import OverflowTooltip from '../common/OverflowTooltip'
import EmptyState from './EmptyState'
import { formatOrderMoney } from '../../utils/formatters'
import CartIdentity from '../carts/CartIdentity'
import { CART_DASHBOARD_FEED_LIMIT } from '../../constants/cartAnalytics'

export default function CartOpenFeed({ items = [], isLoading, isError, onRetry }) {
  const rows = items.slice(0, CART_DASHBOARD_FEED_LIMIT)

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Open baskets</h2>
          <p className="text-xs text-slate-500">Latest carts still being filled</p>
        </div>
        <Link
          to="/carts"
          className="text-xs font-bold text-brand transition-colors hover:text-brand-hover"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex-1 divide-y divide-slate-100" aria-busy="true" aria-label="Loading open baskets">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3.5">
              <div className="skeleton-shimmer size-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-3 w-36 rounded-md" />
                <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          compact
          icon={ShoppingBag}
          title="Could not load baskets"
          description="Open carts are unavailable right now."
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
      ) : rows.length === 0 ? (
        <EmptyState
          compact
          icon={ShoppingBag}
          title="No open baskets"
          description="Shopper carts will show up here while they are still browsing."
        />
      ) : (
        <div className="flex-1 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-2.5">Basket</th>
                <th className="px-5 py-2.5">Shopper</th>
                <th className="px-5 py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((cart) => (
                <tr key={cart.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3">
                    <CartIdentity cart={cart} />
                  </td>
                  <td className="px-5 py-3">
                    {cart.shopperId ? (
                      <div className="max-w-36">
                        <OverflowTooltip text={cart.shopperName}>
                          <Link
                            to={`/users/${encodeURIComponent(cart.shopperId)}`}
                            className="block w-full truncate font-medium text-slate-700 transition-colors hover:text-brand"
                          >
                            {cart.shopperName}
                          </Link>
                        </OverflowTooltip>
                      </div>
                    ) : (
                      <span className="text-slate-500">{cart.shopperName || 'Guest'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-slate-900">
                    {cart.itemsCount > 0 ? formatOrderMoney(cart.total) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
