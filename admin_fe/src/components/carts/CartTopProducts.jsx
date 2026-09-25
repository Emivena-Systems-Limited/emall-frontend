import { Link } from 'react-router'
import { ChevronLeft, ChevronRight, Package, ShoppingBag } from 'lucide-react'
import OverflowTooltip from '../common/OverflowTooltip'
import EmptyState from '../dashboard/EmptyState'
import { formatCount } from '../../utils/formatters'

function basketsLabel(count) {
  return count === 1 ? '1 basket' : `${formatCount(count)} baskets`
}

function quantityLabel(count) {
  return count === 1 ? '1 item waiting' : `${formatCount(count)} items waiting`
}

export default function CartTopProducts({
  products = [],
  isLoading = false,
  isError = false,
  onRetry,
  compact = false,
  page = 1,
  totalPages = 1,
  total = 0,
  rangeStart = 0,
  rangeEnd = 0,
  onPageChange,
}) {
  const maxQuantity = products.reduce((max, row) => Math.max(max, Number(row.quantity) || 0), 0)
  const showPager = !compact && typeof onPageChange === 'function' && total > 0

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-bold text-slate-900">Most added</h2>
        <p className="text-xs text-slate-500">Listings sitting in baskets right now</p>
      </div>

      {isLoading ? (
        <div className="flex-1 divide-y divide-slate-100" aria-busy="true" aria-label="Loading top cart products">
          {Array.from({ length: compact ? 5 : 8 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3.5">
              <div className="skeleton-shimmer size-11 shrink-0 rounded-xl" />
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
          icon={ShoppingBag}
          title="Could not load rankings"
          description="Top cart listings are unavailable right now."
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
      ) : products.length === 0 ? (
        <EmptyState
          compact
          icon={Package}
          title="Nothing in baskets yet"
          description="When shoppers add listings, the most popular ones will rank here."
        />
      ) : (
        <ol className="flex-1 divide-y divide-slate-100">
          {products.map((row, index) => {
            const width = maxQuantity > 0 ? Math.max(8, (row.quantity / maxQuantity) * 100) : 8
            const body = (
              <>
                {row.image ? (
                  <img src={row.image} alt="" className="size-11 shrink-0 rounded-xl object-cover ring-1 ring-slate-200" />
                ) : (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
                    <Package className="size-4" aria-hidden="true" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <OverflowTooltip text={row.productName}>
                    <span className="block truncate text-sm font-semibold text-slate-900">{row.productName}</span>
                  </OverflowTooltip>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {quantityLabel(row.quantity)}
                    {' · '}
                    {basketsLabel(row.cartsCount)}
                  </span>
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${width}%` }} />
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-slate-400">
                  {rangeStart ? rangeStart + index : index + 1}
                </span>
              </>
            )

            return (
              <li key={row.id}>
                {row.productId ? (
                  <Link
                    to={`/products/${encodeURIComponent(row.productId)}`}
                    className="flex items-center gap-3 px-5 py-3.5 outline-none transition-colors hover:bg-slate-50/80 focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    {body}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}

      {showPager ? (
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
      ) : null}
    </section>
  )
}
