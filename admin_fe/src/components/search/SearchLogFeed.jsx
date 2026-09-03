import { Link } from 'react-router'
import { Search } from 'lucide-react'
import OverflowTooltip from '../common/OverflowTooltip'
import EmptyState from '../dashboard/EmptyState'
import { SEARCH_DASHBOARD_LOG_LIMIT } from '../../constants/searchAnalytics'
import { formatCount } from '../../utils/formatters'
import { formatSearchAt } from '../../utils/normalizeSearchAnalytics'

function resultLabel(count) {
  if (count <= 0) return 'No matches'
  return count === 1 ? '1 listing' : `${formatCount(count)} listings`
}

export default function SearchLogFeed({
  items = [],
  isLoading = false,
  isError = false,
  onRetry,
}) {
  const rows = items.slice(0, SEARCH_DASHBOARD_LOG_LIMIT)

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Latest lookups</h2>
          <p className="text-xs text-slate-500">What people typed most recently</p>
        </div>
        <Link
          to="/searches"
          className="text-xs font-bold text-brand transition-colors hover:text-brand-hover"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex-1 divide-y divide-slate-100" aria-busy="true" aria-label="Loading latest lookups">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3.5">
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
          icon={Search}
          title="Could not load lookups"
          description="Recent searches are unavailable right now."
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
          icon={Search}
          title="No lookups yet"
          description="When shoppers search the catalogue, those terms will show up here."
        />
      ) : (
        <ul className="flex-1 divide-y divide-slate-100">
          {rows.map((item) => (
            <li key={item.id} className="px-5 py-3.5">
              <OverflowTooltip text={item.query}>
                <p className="truncate text-sm font-semibold text-slate-900">“{item.query}”</p>
              </OverflowTooltip>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {item.shopperId ? (
                  <Link
                    to={`/users/${encodeURIComponent(item.shopperId)}`}
                    className="font-medium text-slate-600 transition-colors hover:text-brand"
                  >
                    {item.shopperName}
                  </Link>
                ) : (
                  item.shopperName
                )}
                {' · '}
                {resultLabel(item.resultsCount)}
                {item.sourceLabel ? ` · ${item.sourceLabel}` : ''}
                {item.createdAt ? ` · ${formatSearchAt(item.createdAt)}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
