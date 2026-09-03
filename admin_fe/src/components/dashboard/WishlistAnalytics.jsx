import { Heart } from 'lucide-react'
import {
  useWishlistAnalyticsStats,
  useWishlistTopProducts,
} from '../../hooks/useAdminWishlistAnalytics'
import { parseApiError } from '../../utils/parseApiError'
import WishlistStatsGrid, { WishlistStatsSkeleton } from '../wishlists/WishlistStatsGrid'
import WishlistTopProducts from '../wishlists/WishlistTopProducts'
import EmptyState from './EmptyState'

export default function WishlistAnalytics() {
  const {
    stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorValue,
    refetch: refetchStats,
  } = useWishlistAnalyticsStats()
  const {
    products,
    isLoading: topLoading,
    isError: topError,
    refetch: refetchTop,
  } = useWishlistTopProducts()

  return (
    <section className="space-y-5" aria-label="Wishlist analytics">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Wishlist</h2>
        <p className="text-xs text-slate-500">What shoppers save for later, and which listings they heart most</p>
      </div>

      {statsLoading ? (
        <WishlistStatsSkeleton />
      ) : statsError ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <EmptyState
            compact
            icon={Heart}
            title="Could not load wishlist stats"
            description={parseApiError(statsErrorValue, 'Wishlist analytics are unavailable right now.').message}
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
        <WishlistStatsGrid stats={stats} />
      )}

      <WishlistTopProducts
        products={products}
        isLoading={topLoading}
        isError={topError}
        onRetry={() => refetchTop()}
        compact
      />
    </section>
  )
}
