import { Link } from 'react-router'
import { Store } from 'lucide-react'
import OverflowTooltip from '../common/OverflowTooltip'
import EmptyState from './EmptyState'
import { useVendorPerformance } from '../../hooks/useAdminVendorPerformance'
import { formatCount, formatOrderMoney } from '../../utils/formatters'
import { getStoreInitials, getVendorAvatarTone } from '../../utils/vendorFilters'

function ordersLabel(count) {
  return count === 1 ? '1 order' : `${formatCount(count)} orders`
}

function unitsLabel(count) {
  return count === 1 ? '1 item' : `${formatCount(count)} items`
}

export default function VendorPerformance() {
  const { vendors, isLoading, isError, refetch } = useVendorPerformance()
  const maxSales = vendors.reduce((max, row) => Math.max(max, Number(row.sales) || 0), 0)

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Store performance</h2>
          <p className="text-xs text-slate-500">Gross sales, orders, and items moved</p>
        </div>
        <Link
          to="/vendors"
          className="text-xs font-bold text-brand transition-colors hover:text-brand-hover"
        >
          Stores
        </Link>
      </div>

      {isLoading ? (
        <div className="flex-1 divide-y divide-slate-100" aria-busy="true" aria-label="Loading store performance">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3.5">
              <div className="skeleton-shimmer size-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-3 w-36 rounded-md" />
                <div className="skeleton-shimmer h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          compact
          icon={Store}
          title="Could not load performance"
          description="Store sales rankings are unavailable right now."
          action={(
            <button
              type="button"
              onClick={() => refetch()}
              className="cursor-pointer rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Try again
            </button>
          )}
        />
      ) : vendors.length === 0 ? (
        <EmptyState
          compact
          icon={Store}
          title="No store sales yet"
          description="When stores start selling, they will rank here by sales."
        />
      ) : (
        <ol className="flex-1 divide-y divide-slate-100">
          {vendors.map((row, index) => {
            const width = maxSales > 0 ? Math.max(8, (row.sales / maxSales) * 100) : 8
            const meta = [ordersLabel(row.orders), unitsLabel(row.units)].join(' · ')
            const body = (
              <>
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ring-1 ${getVendorAvatarTone(row.vendorId || row.id)}`}>
                  {getStoreInitials(row.storeName)}
                </span>
                <span className="min-w-0 flex-1">
                  <OverflowTooltip text={row.storeName}>
                    <span className="block truncate text-sm font-semibold text-slate-900">{row.storeName}</span>
                  </OverflowTooltip>
                  <span className="mt-0.5 block text-xs font-semibold tabular-nums text-slate-800">
                    {formatOrderMoney(row.sales)}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">{meta}</span>
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${width}%` }} />
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-slate-400">{index + 1}</span>
              </>
            )

            return (
              <li key={row.id}>
                {row.vendorId ? (
                  <Link
                    to={`/vendors/${encodeURIComponent(row.vendorId)}`}
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
    </section>
  )
}
