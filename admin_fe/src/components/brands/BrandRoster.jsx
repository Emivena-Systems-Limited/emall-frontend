import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Award, ChevronLeft, ChevronRight } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { formatCount } from '../../utils/formatters'
import { formatBrandDate } from '../../utils/normalizeAdminBrands'
import { prefetchAdminBrand } from '../../hooks/useAdminBrands'
import BrandActions from './BrandActions'
import BrandIdentity, { BrandRosterSkeleton } from './BrandIdentity'
import BrandStatusBadge from './BrandStatusBadge'

export { BrandRosterSkeleton }

export default function BrandRoster({
  brands,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasFilters = false,
  onEdit,
  onStatus,
  onRemove,
}) {
  const queryClient = useQueryClient()
  const prefetch = (id) => prefetchAdminBrand(queryClient, id)

  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Award}
          title={hasFilters ? 'No brands match these filters' : 'No brands yet'}
          description={
            hasFilters
              ? 'Try a different status or search, or clear the current filters to see the full list.'
              : 'Approved, pending, and rejected labels will appear here once they are added.'
          }
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
              <th className="px-5 py-2.5">Brand</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5">Added</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {brands.map((brand) => (
              <tr key={brand.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <Link
                    to={`/brands/${brand.id}`}
                    onMouseEnter={() => prefetch(brand.id)}
                    onFocus={() => prefetch(brand.id)}
                    className="block rounded-xl outline-none transition-colors hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <BrandIdentity brand={brand} />
                  </Link>
                </td>
                <td className="px-5 py-3"><BrandStatusBadge status={brand.status} /></td>
                <td className="px-5 py-3 text-slate-500">{formatBrandDate(brand.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <BrandActions
                    brand={brand}
                    onEdit={onEdit}
                    onStatus={onStatus}
                    onRemove={onRemove}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {brands.map((brand) => (
          <li key={brand.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                to={`/brands/${brand.id}`}
                onMouseEnter={() => prefetch(brand.id)}
                onFocus={() => prefetch(brand.id)}
                className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <BrandIdentity brand={brand} />
              </Link>
              <BrandActions
                brand={brand}
                onEdit={onEdit}
                onStatus={onStatus}
                onRemove={onRemove}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <BrandStatusBadge status={brand.status} />
              <span className="text-xs text-slate-500">{formatBrandDate(brand.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{rangeStart}–{rangeEnd}</span> of{' '}
          <span className="font-semibold text-slate-700">{formatCount(total)}</span>
        </p>
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
      </div>
    </section>
  )
}
