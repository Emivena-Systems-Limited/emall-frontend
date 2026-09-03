import { Link } from 'react-router'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import OverflowTooltip from '../common/OverflowTooltip'
import { formatCount } from '../../utils/formatters'
import { formatSearchAt } from '../../utils/normalizeSearchAnalytics'

function resultLabel(count) {
  if (count <= 0) return 'No matches'
  return count === 1 ? '1 listing' : `${formatCount(count)} listings`
}

function ShopperCell({ item }) {
  if (item.shopperId) {
    return (
      <div className="max-w-44">
        <OverflowTooltip text={item.shopperName}>
          <Link
            to={`/users/${encodeURIComponent(item.shopperId)}`}
            className="block w-full truncate whitespace-nowrap text-sm font-medium text-slate-700 transition-colors hover:text-brand"
          >
            {item.shopperName}
          </Link>
        </OverflowTooltip>
        {item.shopperEmail ? (
          <p className="mt-0.5 truncate text-xs text-slate-400">{item.shopperEmail}</p>
        ) : null}
      </div>
    )
  }

  return <span className="text-sm text-slate-500">{item.shopperName || 'Guest'}</span>
}

export function SearchRosterSkeleton({ rows = 6 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading search activity"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3 w-40 rounded-md" />
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function SearchRoster({
  items,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
}) {
  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Search}
          title="No lookups yet"
          description="When shoppers search the catalogue, those terms will show up here."
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-2.5">Search</th>
              <th className="px-5 py-2.5">Shopper</th>
              <th className="px-5 py-2.5">Result</th>
              <th className="px-5 py-2.5">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <OverflowTooltip text={item.query}>
                    <p className="max-w-72 truncate font-semibold text-slate-900">“{item.query}”</p>
                  </OverflowTooltip>
                  {item.sourceLabel ? (
                    <p className="mt-0.5 text-xs text-slate-400">{item.sourceLabel}</p>
                  ) : null}
                </td>
                <td className="px-5 py-3">
                  <ShopperCell item={item} />
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">
                  {resultLabel(item.resultsCount)}
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-500">
                  {formatSearchAt(item.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="px-4 py-3.5">
            <OverflowTooltip text={item.query}>
              <p className="truncate text-sm font-semibold text-slate-900">“{item.query}”</p>
            </OverflowTooltip>
            <p className="mt-1 text-xs text-slate-500">
              {resultLabel(item.resultsCount)}
              {item.sourceLabel ? ` · ${item.sourceLabel}` : ''}
              {' · '}
              {formatSearchAt(item.createdAt)}
            </p>
            <div className="mt-2">
              <ShopperCell item={item} />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{rangeStart}–{rangeEnd}</span> of{' '}
          <span className="font-semibold text-slate-700">{formatCount(total)}</span>
        </p>
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </button>
            <span className="min-w-16 text-center text-xs font-semibold text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Next
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
