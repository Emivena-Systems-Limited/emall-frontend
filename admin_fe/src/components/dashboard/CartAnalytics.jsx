import { ShoppingBag } from 'lucide-react'
import {
  useAdminCartRoster,
  useCartAnalyticsStats,
  useCartTopProducts,
} from '../../hooks/useAdminCartAnalytics'
import { parseApiError } from '../../utils/parseApiError'
import CartMixChart from '../carts/CartMixChart'
import CartStatsGrid, { CartStatsSkeleton } from '../carts/CartStatsGrid'
import CartTopProducts from '../carts/CartTopProducts'
import CartOpenFeed from './CartOpenFeed'
import EmptyState from './EmptyState'

function MixSkeleton() {
  return (
    <section
      className="flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading cart mix"
    >
      <div className="skeleton-shimmer h-4 w-28 rounded-md" />
      <div className="mt-2 skeleton-shimmer h-3 w-40 rounded-md" />
      <div className="mt-8 skeleton-shimmer mx-auto size-40 rounded-full" />
    </section>
  )
}

export default function CartAnalytics() {
  const {
    stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorValue,
    refetch: refetchStats,
  } = useCartAnalyticsStats()
  const {
    items,
    isLoading: cartsLoading,
    isError: cartsError,
    refetch: refetchCarts,
  } = useAdminCartRoster({ status: 'active' }, 1)
  const {
    products,
    isLoading: topLoading,
    isError: topError,
    refetch: refetchTop,
  } = useCartTopProducts()
  const showMix = !statsError && (statsLoading || stats.mix.length > 0)

  return (
    <section className="space-y-5" aria-label="Cart analytics">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Carts</h2>
        <p className="text-xs text-slate-500">Open baskets, who is shopping, and what they add most</p>
      </div>

      {statsLoading ? (
        <CartStatsSkeleton />
      ) : statsError ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <EmptyState
            compact
            icon={ShoppingBag}
            title="Could not load cart stats"
            description={parseApiError(statsErrorValue, 'Cart analytics are unavailable right now.').message}
            action={(
              <button
                type="button"
                onClick={() => refetchStats()}
                className="cursor-pointer rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Try again
              </button>
            )}
          />
        </section>
      ) : (
        <CartStatsGrid stats={stats} />
      )}

      <div className="grid items-stretch gap-5 lg:grid-cols-5">
        {showMix ? (
          <div className="h-full lg:col-span-2">
            {statsLoading ? <MixSkeleton /> : <CartMixChart mix={stats.mix} />}
          </div>
        ) : null}
        <div className={`h-full ${showMix ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
          <CartOpenFeed
            items={items}
            isLoading={cartsLoading}
            isError={cartsError}
            onRetry={() => refetchCarts()}
          />
        </div>
      </div>

      <CartTopProducts
        products={products}
        isLoading={topLoading}
        isError={topError}
        onRetry={() => refetchTop()}
        compact
      />
    </section>
  )
}
