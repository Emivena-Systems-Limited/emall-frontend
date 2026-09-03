import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Store } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import SmartNavLink from '../navigation/SmartNavLink'
import { formatCount } from '../../utils/formatters'
import {
  formatJoinedDate,
  getStoreInitials,
  getVendorAvatarTone,
} from '../../utils/vendorFilters'
import { prefetchAdminVendor } from '../../hooks/useAdminVendors'
import VendorActionsMenu from './VendorActionsMenu'
import VendorStatusBadge from './VendorStatusBadge'

function VendorIdentity({ vendor }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1 ${getVendorAvatarTone(vendor.id)}`}>
        {getStoreInitials(vendor.store)}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">{vendor.store}</p>
        <p className="truncate text-xs text-slate-500">{vendor.owner}</p>
      </div>
    </div>
  )
}

export function VendorRosterSkeleton() {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading vendors"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="skeleton-shimmer size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-40 rounded-md" />
              <div className="skeleton-shimmer h-3 w-28 rounded-md" />
            </div>
            <div className="skeleton-shimmer hidden h-6 w-20 rounded-full sm:block" />
            <div className="skeleton-shimmer hidden h-4 w-16 rounded-md md:block" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function VendorRoster({
  vendors,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasFilters = false,
}) {
  const queryClient = useQueryClient()
  const prefetch = (id) => prefetchAdminVendor(queryClient, id)

  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Store}
          title={hasFilters ? 'No vendors match these filters' : 'No vendors yet'}
          description={
            hasFilters
              ? 'Try a different status, region, or clear the current filters to see the full roster.'
              : 'Approved, pending, rejected, and suspended stores will appear here once they are returned by the API.'
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
              <th className="px-5 py-2.5">Store</th>
              <th className="px-5 py-2.5">Region</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5">Listings</th>
              <th className="px-5 py-2.5">Reviews</th>
              <th className="px-5 py-2.5">Joined</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <SmartNavLink
                    to={`/vendors/${vendor.id}`}
                    onMouseEnter={() => prefetch(vendor.id)}
                    onFocus={() => prefetch(vendor.id)}
                    className="block rounded-xl outline-none transition-colors hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <VendorIdentity vendor={vendor} />
                  </SmartNavLink>
                </td>
                <td className="px-5 py-3 text-slate-600">{vendor.region}</td>
                <td className="px-5 py-3"><VendorStatusBadge status={vendor.status} /></td>
                <td className="px-5 py-3 tabular-nums text-slate-600">
                  <SmartNavLink
                    to={`/vendors/${vendor.id}/products`}
                    onMouseEnter={() => prefetch(vendor.id)}
                    className="font-semibold text-slate-700 transition-colors hover:text-brand"
                  >
                    {formatCount(vendor.listings)}
                  </SmartNavLink>
                </td>
                <td className="px-5 py-3 tabular-nums text-slate-600">{formatCount(vendor.reviewsCount)}</td>
                <td className="px-5 py-3 text-slate-500">{formatJoinedDate(vendor.joinedAt)}</td>
                <td className="px-5 py-3 text-right">
                  <VendorActionsMenu vendor={vendor} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {vendors.map((vendor) => (
          <li key={vendor.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <SmartNavLink
                to={`/vendors/${vendor.id}`}
                onMouseEnter={() => prefetch(vendor.id)}
                onFocus={() => prefetch(vendor.id)}
                className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <VendorIdentity vendor={vendor} />
              </SmartNavLink>
              <VendorActionsMenu vendor={vendor} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <VendorStatusBadge status={vendor.status} />
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                {vendor.region}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold tabular-nums text-slate-800">{formatCount(vendor.listings)} listings · {formatCount(vendor.reviewsCount)} reviews</span>
              <span>{formatJoinedDate(vendor.joinedAt)}</span>
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
