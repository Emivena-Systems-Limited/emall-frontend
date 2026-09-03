import { TicketPercent } from 'lucide-react'
import { formatCouponOffer } from '../../utils/normalizeAdminCoupons'

export function CouponRosterSkeleton({ rows = 6 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading coupons"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="skeleton-shimmer size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-32 rounded-md" />
              <div className="skeleton-shimmer h-3 w-40 rounded-md" />
            </div>
            <div className="skeleton-shimmer hidden h-6 w-20 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function CouponIdentity({ coupon, size = 'md' }) {
  const frame = size === 'lg' ? 'size-16' : size === 'sm' ? 'size-8' : 'size-10'
  const rounded = size === 'lg' ? 'rounded-2xl' : 'rounded-xl'
  const offer = formatCouponOffer(coupon)

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={`flex ${frame} ${rounded} shrink-0 items-center justify-center bg-brand-light text-brand ring-1 ring-brand-muted`}>
        <TicketPercent className={size === 'lg' ? 'size-7' : 'size-4'} strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className={`truncate tracking-wide ${size === 'lg' ? 'text-xl font-bold text-slate-950' : 'font-semibold text-slate-900'}`}>
          {coupon?.code || 'CODE'}
        </p>
        <p className={`truncate ${size === 'lg' ? 'mt-0.5 text-sm text-slate-500' : 'text-xs text-slate-500'}`}>
          {offer}
          {size === 'lg' && coupon?.vendorName ? ` · ${coupon.vendorName}` : ''}
        </p>
      </div>
    </div>
  )
}
