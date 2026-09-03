import { Link, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Boxes, ChevronLeft, ChevronRight } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import OverflowTooltip from '../common/OverflowTooltip'
import { formatCount } from '../../utils/formatters'
import { prefetchAdminInventory } from '../../hooks/useAdminInventory'
import InventoryActions from './InventoryActions'
import InventoryIdentity, { InventoryRosterSkeleton } from './InventoryIdentity'
import InventoryStatusBadge from './InventoryStatusBadge'

export { InventoryRosterSkeleton }

export default function InventoryRoster({
  items,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasFilters = false,
  view = '',
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const prefetch = (id) => prefetchAdminInventory(queryClient, id)
  const showStore = items.some((item) => item.vendorId || item.vendorName)

  if (total === 0) {
    const emptyTitle = hasFilters
      ? 'No stock records match these filters'
      : view === 'low'
        ? 'No low-stock items'
        : view === 'out'
          ? 'Nothing is out of stock'
          : 'No inventory yet'
    const emptyCopy = hasFilters
      ? 'Try a different store or search, or clear the current filters.'
      : view === 'low'
        ? 'No listings are at or below their alert level right now.'
        : view === 'out'
          ? 'Every tracked option still has units on hand.'
          : 'Stock records will appear here once they are returned by the API.'

    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Boxes}
          title={emptyTitle}
          description={emptyCopy}
          action={hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Clear filters
            </button>
          ) : null}
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
              <th className="px-5 py-2.5">Listing</th>
              {showStore ? <th className="px-5 py-2.5">Store</th> : null}
              <th className="px-5 py-2.5">On hand</th>
              <th className="px-5 py-2.5">Reserved</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <Link
                    to={`/inventory/${encodeURIComponent(item.id)}`}
                    onMouseEnter={() => prefetch(item.id)}
                    onFocus={() => prefetch(item.id)}
                    className="block max-w-72 rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <InventoryIdentity item={item} />
                  </Link>
                </td>
                {showStore ? (
                  <td className="px-5 py-3">
                    <div className="max-w-36">
                      <OverflowTooltip text={item.vendorName}>
                        {item.vendorId ? (
                          <Link
                            to={`/vendors/${encodeURIComponent(item.vendorId)}`}
                            className="block w-full truncate whitespace-nowrap text-sm font-medium text-slate-700 transition-colors hover:text-brand"
                          >
                            {item.vendorName || 'Store'}
                          </Link>
                        ) : (
                          <span className="block w-full truncate whitespace-nowrap text-sm text-slate-500">
                            {item.vendorName || '—'}
                          </span>
                        )}
                      </OverflowTooltip>
                    </div>
                  </td>
                ) : null}
                <td className="px-5 py-3 font-semibold tabular-nums text-slate-800">
                  {formatCount(item.quantity)}
                </td>
                <td className="px-5 py-3 tabular-nums text-slate-600">
                  {formatCount(item.reserved)}
                </td>
                <td className="px-5 py-3">
                  <InventoryStatusBadge status={item.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <InventoryActions
                    item={item}
                    onView={() => navigate(`/inventory/${encodeURIComponent(item.id)}`)}
                    onOpenListing={() => item.productId && navigate(`/products/${encodeURIComponent(item.productId)}`)}
                    onOpenStore={() => item.vendorId && navigate(`/vendors/${encodeURIComponent(item.vendorId)}`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                to={`/inventory/${encodeURIComponent(item.id)}`}
                onMouseEnter={() => prefetch(item.id)}
                onFocus={() => prefetch(item.id)}
                className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <InventoryIdentity item={item} />
              </Link>
              <InventoryActions
                item={item}
                onView={() => navigate(`/inventory/${encodeURIComponent(item.id)}`)}
                onOpenListing={() => item.productId && navigate(`/products/${encodeURIComponent(item.productId)}`)}
                onOpenStore={() => item.vendorId && navigate(`/vendors/${encodeURIComponent(item.vendorId)}`)}
              />
            </div>
            {item.vendorName ? (
              <p className="mt-2 max-w-52 truncate text-xs text-slate-500">{item.vendorName}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <InventoryStatusBadge status={item.status} />
              <span className="text-xs font-semibold tabular-nums text-slate-600">
                {formatCount(item.quantity)} on hand
              </span>
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
