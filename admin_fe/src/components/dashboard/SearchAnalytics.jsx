import { Search } from 'lucide-react'
import {
  useSearchAnalyticsStats,
  useSearchLogs,
  useSearchTopQueries,
} from '../../hooks/useAdminSearchAnalytics'
import { parseApiError } from '../../utils/parseApiError'
import SearchLogFeed from '../search/SearchLogFeed'
import SearchMixChart, { SearchMixSkeleton } from '../search/SearchMixChart'
import SearchStatsGrid, { SearchStatsSkeleton } from '../search/SearchStatsGrid'
import SearchTopQueries from '../search/SearchTopQueries'
import EmptyState from './EmptyState'

export default function SearchAnalytics() {
  const {
    stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorValue,
    refetch: refetchStats,
  } = useSearchAnalyticsStats()
  const {
    items,
    isLoading: logsLoading,
    isError: logsError,
    refetch: refetchLogs,
  } = useSearchLogs(1)
  const {
    queries,
    isLoading: topLoading,
    isError: topError,
    refetch: refetchTop,
  } = useSearchTopQueries()

  const useSourceMix = stats.sourceMix.length > 0
  const mix = useSourceMix ? stats.sourceMix : stats.outcomeMix
  const chartIsSource = useSourceMix || mix.length === 0

  return (
    <section className="space-y-5" aria-label="Search analytics">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Search</h2>
        <p className="text-xs text-slate-500">What shoppers look up, where they search, and which terms miss</p>
      </div>

      {statsLoading ? (
        <SearchStatsSkeleton />
      ) : statsError ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <EmptyState
            compact
            icon={Search}
            title="Could not load search stats"
            description={parseApiError(statsErrorValue, 'Search analytics are unavailable right now.').message}
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
        <SearchStatsGrid stats={stats} />
      )}

      <div className="grid items-stretch gap-5 lg:grid-cols-5">
        <div className="h-full lg:col-span-2">
          {statsLoading ? (
            <SearchMixSkeleton />
          ) : (
            <SearchMixChart
              mix={mix}
              title={chartIsSource ? 'Where they searched' : 'Did they find it'}
              subtitle={chartIsSource
                ? 'Storefront versus app and other sources'
                : 'Lookups that returned listings versus none'}
              emptyTitle="No search mix yet"
              emptyDescription="When shoppers look things up, this chart will show where those lookups come from."
            />
          )}
        </div>
        <div className="h-full lg:col-span-3">
          <SearchLogFeed
            items={items}
            isLoading={logsLoading}
            isError={logsError}
            onRetry={() => refetchLogs()}
          />
        </div>
      </div>

      <SearchTopQueries
        queries={queries}
        isLoading={topLoading}
        isError={topError}
        onRetry={() => refetchTop()}
        compact
      />
    </section>
  )
}
