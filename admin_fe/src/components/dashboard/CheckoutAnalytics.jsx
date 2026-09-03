import { ShoppingCart } from 'lucide-react'
import {
  useCheckoutAnalyticsRecent,
  useCheckoutAnalyticsStats,
} from '../../hooks/useAdminCheckoutAnalytics'
import { parseApiError } from '../../utils/parseApiError'
import CheckoutMixChart from './CheckoutMixChart'
import CheckoutRecentFeed from './CheckoutRecentFeed'
import CheckoutStatsGrid, { CheckoutStatsSkeleton } from './CheckoutStatsGrid'
import EmptyState from './EmptyState'

function MixSkeleton() {
  return (
    <section
      className="flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading checkout mix"
    >
      <div className="skeleton-shimmer h-4 w-28 rounded-md" />
      <div className="mt-2 skeleton-shimmer h-3 w-40 rounded-md" />
      <div className="mt-8 skeleton-shimmer mx-auto size-40 rounded-full" />
    </section>
  )
}

export default function CheckoutAnalytics() {
  const {
    stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorValue,
    refetch: refetchStats,
  } = useCheckoutAnalyticsStats()
  const {
    items,
    isLoading: recentLoading,
    isError: recentError,
    refetch: refetchRecent,
  } = useCheckoutAnalyticsRecent()
  const showMix = !statsError && (statsLoading || stats.mix.length > 0)

  return (
    <section className="space-y-5" aria-label="Checkout analytics">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Checkout</h2>
        <p className="text-xs text-slate-500">Orders, baskets, and recent paid checkouts</p>
      </div>

      {statsLoading ? (
        <CheckoutStatsSkeleton />
      ) : statsError ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <EmptyState
            compact
            icon={ShoppingCart}
            title="Could not load checkout stats"
            description={parseApiError(statsErrorValue, 'Checkout analytics are unavailable right now.').message}
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
        <CheckoutStatsGrid stats={stats} />
      )}

      <div className="grid items-stretch gap-5 lg:grid-cols-5">
        {showMix ? (
          <div className="h-full lg:col-span-2">
            {statsLoading ? <MixSkeleton /> : <CheckoutMixChart mix={stats.mix} />}
          </div>
        ) : null}
        <div className={`h-full ${showMix ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
          <CheckoutRecentFeed
            items={items}
            isLoading={recentLoading}
            isError={recentError}
            onRetry={() => refetchRecent()}
          />
        </div>
      </div>
    </section>
  )
}
