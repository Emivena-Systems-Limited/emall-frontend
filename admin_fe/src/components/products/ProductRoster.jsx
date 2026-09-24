import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import SmartNavLink from '../navigation/SmartNavLink'
import { formatCount, formatCedi } from '../../utils/formatters'
import { prefetchAdminProduct } from '../../hooks/useAdminProducts'
import useNavigationState from '../../hooks/useNavigationState'
import ProductActions from './ProductActions'
import ProductIdentity, { ProductRosterSkeleton } from './ProductIdentity'
import ProductStatusBadge, { ProductVisibilityBadge } from './ProductStatusBadge'

export { ProductRosterSkeleton }

export default function ProductRoster({
  products,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasFilters = false,
  onStatus,
  onVisibility,
  onViewReason,
  onViewVariations,
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const navigationState = useNavigationState()
  const prefetch = (id) => prefetchAdminProduct(queryClient, id)

  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Package}
          title={hasFilters ? 'No listings match these filters' : 'No products yet'}
          description={
            hasFilters
              ? 'Try a different review status, visibility, or search, or clear the current filters.'
              : 'Vendor listings will appear here as they are submitted for review.'
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
        <table className="min-w-full table-fixed text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-[42%] px-5 py-2.5">Listing</th>
              <th className="px-5 py-2.5">Category</th>
              <th className="px-5 py-2.5">Price</th>
              <th className="px-5 py-2.5">Stock</th>
              <th className="px-5 py-2.5">Review</th>
              <th className="px-5 py-2.5">Shoppers</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-slate-50/80">
                <td className="max-w-0 px-5 py-3">
                  <SmartNavLink
                    to={`/products/${product.id}`}
                    onMouseEnter={() => prefetch(product.id)}
                    onFocus={() => prefetch(product.id)}
                    className="block min-w-0 rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <ProductIdentity product={product} />
                  </SmartNavLink>
                </td>
                <td className="max-w-0 truncate px-5 py-3 text-slate-600" title={product.category}>
                  {product.category || '—'}
                </td>
                <td className="px-5 py-3">
                  <p className="font-semibold tabular-nums text-slate-900">{formatCedi(product.price)}</p>
                  {product.hasDiscount ? (
                    <p className="text-xs tabular-nums text-slate-400 line-through">{formatCedi(product.regularPrice)}</p>
                  ) : null}
                </td>
                <td className="px-5 py-3 tabular-nums text-slate-700">
                  {product.stock == null ? '—' : formatCount(product.stock)}
                </td>
                <td className="px-5 py-3">
                  <ProductStatusBadge status={product.approvalStatus} />
                </td>
                <td className="px-5 py-3">
                  <ProductVisibilityBadge isActive={product.isActive} approvalStatus={product.approvalStatus} />
                </td>
                <td className="px-5 py-3 text-right">
                  <ProductActions
                    product={product}
                    onView={() => navigate(`/products/${product.id}`, { state: navigationState })}
                    onStatus={onStatus}
                    onVisibility={onVisibility}
                    onViewReason={onViewReason}
                    onViewVariations={onViewVariations}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {products.map((product) => (
          <li key={product.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <SmartNavLink
                to={`/products/${product.id}`}
                onMouseEnter={() => prefetch(product.id)}
                onFocus={() => prefetch(product.id)}
                className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <ProductIdentity product={product} />
              </SmartNavLink>
              <ProductActions
                product={product}
                onView={() => navigate(`/products/${product.id}`, { state: navigationState })}
                onStatus={onStatus}
                onVisibility={onVisibility}
                onViewReason={onViewReason}
                onViewVariations={onViewVariations}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <ProductStatusBadge status={product.approvalStatus} />
              <ProductVisibilityBadge isActive={product.isActive} approvalStatus={product.approvalStatus} />
              <span className="min-w-0 truncate text-xs text-slate-500">{product.category || '—'}</span>
              <span className="text-xs font-semibold tabular-nums text-slate-700">{formatCedi(product.price)}</span>
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
