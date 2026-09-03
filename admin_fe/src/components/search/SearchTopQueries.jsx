import { Search } from 'lucide-react'
import OverflowTooltip from '../common/OverflowTooltip'
import EmptyState from '../dashboard/EmptyState'
import { SEARCH_DASHBOARD_QUERY_LIMIT } from '../../constants/searchAnalytics'
import { formatCount } from '../../utils/formatters'

function searchesLabel(count) {
  return count === 1 ? '1 lookup' : `${formatCount(count)} lookups`
}

function shoppersLabel(count) {
  return count === 1 ? '1 shopper' : `${formatCount(count)} shoppers`
}

export default function SearchTopQueries({
  queries = [],
  isLoading = false,
  isError = false,
  onRetry,
  compact = false,
}) {
  const rows = compact ? queries.slice(0, SEARCH_DASHBOARD_QUERY_LIMIT) : queries
  const maxSearches = rows.reduce((max, row) => Math.max(max, Number(row.searches) || 0), 0)

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-bold text-slate-900">Top searches</h2>
        <p className="text-xs text-slate-500">What shoppers type most often</p>
      </div>

      {isLoading ? (
        <div className="flex-1 divide-y divide-slate-100" aria-busy="true" aria-label="Loading top searches">
          {Array.from({ length: compact ? 5 : 8 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-3 w-40 rounded-md" />
                <div className="skeleton-shimmer h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          compact
          icon={Search}
          title="Could not load rankings"
          description="Top searches are unavailable right now."
          action={onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="cursor-pointer rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Try again
            </button>
          ) : null}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          compact
          icon={Search}
          title="No searches yet"
          description="When shoppers look for listings, the most common terms will rank here."
        />
      ) : (
        <ol className="flex-1 divide-y divide-slate-100">
          {rows.map((row, index) => {
            const width = maxSearches > 0 ? Math.max(8, (row.searches / maxSearches) * 100) : 8
            const meta = [
              searchesLabel(row.searches),
              row.shoppers > 0 ? shoppersLabel(row.shoppers) : '',
            ].filter(Boolean).join(' · ')

            return (
              <li key={row.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="min-w-0 flex-1">
                  <OverflowTooltip text={row.query}>
                    <span className="block truncate text-sm font-semibold text-slate-900">“{row.query}”</span>
                  </OverflowTooltip>
                  <span className="mt-0.5 block text-xs text-slate-500">{meta}</span>
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${width}%` }} />
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-slate-400">{index + 1}</span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
