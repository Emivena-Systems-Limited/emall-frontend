import { Link, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, TicketPercent } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { formatCount } from '../../utils/formatters'
import { formatCouponUsage } from '../../utils/normalizeAdminCoupons'
import { prefetchAdminCoupon } from '../../hooks/useAdminCoupons'
import CouponActions from './CouponActions'
import CouponIdentity, { CouponRosterSkeleton } from './CouponIdentity'
import CouponStatusBadge, { CouponTypeBadge } from './CouponStatusBadge'

export { CouponRosterSkeleton }

export default function CouponRoster({
  coupons,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasFilters = false,
  onCreate,
  onEdit,
  onStatus,
  onRemove,
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const prefetch = (id) => prefetchAdminCoupon(queryClient, id)

  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={TicketPercent}
          title={hasFilters ? 'No coupons match these filters' : 'No coupons yet'}
          description={
            hasFilters
              ? 'Try a different status, store, or search, or clear the current filters.'
              : 'Create a code for a store and it will appear here for operators to pause or retire.'
          }
          action={hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={onCreate}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              New coupon
            </button>
          )}
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
              <th className="px-5 py-2.5">Code</th>
              <th className="px-5 py-2.5">Store</th>
              <th className="px-5 py-2.5">Offer</th>
              <th className="px-5 py-2.5">Checkouts</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <Link
                    to={`/coupons/${encodeURIComponent(coupon.id)}`}
                    onMouseEnter={() => prefetch(coupon.id)}
                    onFocus={() => prefetch(coupon.id)}
                    className="block rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <CouponIdentity coupon={coupon} />
                  </Link>
                </td>
                <td className="px-5 py-3">
                  {coupon.vendorId ? (
                    <Link
                      to={`/vendors/${encodeURIComponent(coupon.vendorId)}`}
                      className="text-sm font-medium text-slate-700 transition-colors hover:text-brand"
                    >
                      {coupon.vendorName}
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-500">{coupon.vendorName || '—'}</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <CouponTypeBadge type={coupon.type} />
                </td>
                <td className="px-5 py-3 text-slate-600">{formatCouponUsage(coupon)}</td>
                <td className="px-5 py-3"><CouponStatusBadge status={coupon.status} /></td>
                <td className="px-5 py-3 text-right">
                  <CouponActions
                    coupon={coupon}
                    onView={() => navigate(`/coupons/${encodeURIComponent(coupon.id)}`)}
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
        {coupons.map((coupon) => (
          <li key={coupon.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                to={`/coupons/${encodeURIComponent(coupon.id)}`}
                onMouseEnter={() => prefetch(coupon.id)}
                onFocus={() => prefetch(coupon.id)}
                className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <CouponIdentity coupon={coupon} />
              </Link>
              <CouponActions
                coupon={coupon}
                onView={() => navigate(`/coupons/${encodeURIComponent(coupon.id)}`)}
                onEdit={onEdit}
                onStatus={onStatus}
                onRemove={onRemove}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <CouponStatusBadge status={coupon.status} />
                <CouponTypeBadge type={coupon.type} />
              </div>
              <span className="text-xs text-slate-500">{formatCouponUsage(coupon)}</span>
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
