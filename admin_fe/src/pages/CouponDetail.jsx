import { Link, useNavigate, useParams } from 'react-router'
import { useState } from 'react'
import {
  Calendar,
  Clock,
  Layers,
  Pause,
  Pencil,
  Play,
  ShoppingBag,
  Store,
  TicketPercent,
  Trash2,
  UserRound,
} from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import SmartBackButton from '../components/navigation/SmartBackButton'
import SmartBackLink from '../components/navigation/SmartBackLink'
import CouponFormDrawer from '../components/coupons/CouponFormDrawer'
import CouponIdentity, { CouponRosterSkeleton } from '../components/coupons/CouponIdentity'
import CouponRemoveModal from '../components/coupons/CouponRemoveModal'
import CouponStatusBadge, { CouponTypeBadge } from '../components/coupons/CouponStatusBadge'
import CouponStatusModal from '../components/coupons/CouponStatusModal'
import { getCouponStatusMeta, getCouponTypeMeta } from '../constants/coupons'
import { useAdminCoupon } from '../hooks/useAdminCoupons'
import { formatCount, formatOrderMoney } from '../utils/formatters'
import {
  formatCouponDateTime,
  formatCouponOffer,
} from '../utils/normalizeAdminCoupons'
import { parseApiError } from '../utils/parseApiError'

function FactRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200">
        <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium break-words text-slate-900">{children}</div>
      </div>
    </div>
  )
}

function CountCard({ label, value, hint }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  )
}

function CouponDetailSkeleton() {
  return (
    <DashboardLayout pageTitle="Coupon">
      <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading coupon">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
          <div className="skeleton-shimmer h-3 w-28 rounded-md" />
          <div className="mt-5 flex items-start gap-4">
            <div className="skeleton-shimmer size-16 shrink-0 rounded-2xl" />
            <div className="space-y-2.5">
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              <div className="skeleton-shimmer h-8 w-48 rounded-md" />
              <div className="skeleton-shimmer h-3.5 w-56 rounded-md" />
            </div>
          </div>
        </section>
        <CouponRosterSkeleton rows={4} />
      </div>
    </DashboardLayout>
  )
}

export default function CouponDetail() {
  const { couponId } = useParams()
  const navigate = useNavigate()
  const { coupon, isLoading, isError, error, refetch } = useAdminCoupon(couponId)
  const [editing, setEditing] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [removing, setRemoving] = useState(false)

  if (isLoading) return <CouponDetailSkeleton />

  if (isError) {
    return (
      <DashboardLayout pageTitle="Coupon">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={TicketPercent}
              title="Could not load this coupon"
              description={parseApiError(error, 'This coupon is unavailable right now.').message}
              action={(
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  Try again
                </button>
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  if (!coupon) {
    return (
      <DashboardLayout pageTitle="Coupon">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={TicketPercent}
              title="This coupon is not on the list"
              description="The link may be out of date, or this code is no longer returned by the API."
              action={(
                <SmartBackButton
                  fallback="/coupons"
                  fallbackLabel="Back to coupons"
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                />
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  const statusMeta = getCouponStatusMeta(coupon.status)
  const typeMeta = getCouponTypeMeta(coupon.type)
  const live = coupon.status === 'live'

  return (
    <DashboardLayout pageTitle={coupon.code}>
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />

            <SmartBackLink
              fallback="/coupons"
              fallbackLabel="Back to coupons"
              variant="text-subtle"
              iconClassName="size-3.5"
              className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
            />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Coupon
                </p>
                <div className="mt-3">
                  <CouponIdentity coupon={coupon} size="lg" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CouponStatusBadge status={coupon.status} />
                  <CouponTypeBadge type={coupon.type} />
                  <p className="text-sm text-slate-500">{statusMeta.hint}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setStatusOpen(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  {live ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                  {live ? 'Pause' : 'Turn on'}
                </button>
                <button
                  type="button"
                  onClick={() => setRemoving(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <CountCard label="Offer" value={formatCouponOffer(coupon)} hint={typeMeta.helper} />
            <CountCard
              label="Total checkouts"
              value={formatCount(coupon.usedCount)}
              hint={
                coupon.usageLimit != null
                  ? `Cap of ${formatCount(coupon.usageLimit)} across all shoppers`
                  : 'No overall cap across shoppers'
              }
            />
            <CountCard
              label="Times per shopper"
              value={coupon.perUserLimit != null ? formatCount(coupon.perUserLimit) : 'No cap'}
              hint="How often the same person can redeem it"
            />
            <CountCard
              label="Minimum basket"
              value={coupon.minimumPurchase != null ? formatOrderMoney(coupon.minimumPurchase) : 'None'}
              hint="Required before the code applies"
            />
          </div>
        </DashboardReveal>

        <div className="grid items-start gap-4 lg:grid-cols-5">
          <DashboardReveal index={2} className="lg:col-span-3">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <h3 className="text-sm font-bold text-slate-900">Details</h3>
                <p className="text-xs text-slate-500">How this code behaves at checkout</p>
              </div>
              <div className="divide-y divide-slate-100 px-5">
                <FactRow icon={TicketPercent} label="Code">{coupon.code}</FactRow>
                <FactRow icon={ShoppingBag} label="Offer">{formatCouponOffer(coupon)}</FactRow>
                {coupon.maximumDiscount != null ? (
                  <FactRow icon={ShoppingBag} label="Discount cap">{formatOrderMoney(coupon.maximumDiscount)}</FactRow>
                ) : null}
                <FactRow icon={ShoppingBag} label="Total checkouts">
                  {coupon.usageLimit != null
                    ? `${formatCount(coupon.usedCount)} of ${formatCount(coupon.usageLimit)} across all shoppers`
                    : `${formatCount(coupon.usedCount)} so far · no overall cap`}
                </FactRow>
                <FactRow icon={UserRound} label="Times per shopper">
                  {coupon.perUserLimit != null
                    ? `${formatCount(coupon.perUserLimit)} for the same person`
                    : 'No per-shopper cap'}
                </FactRow>
                <FactRow icon={Layers} label="Stacking">
                  {coupon.stackable ? 'Can combine with another offer' : 'Does not stack'}
                </FactRow>
                {coupon.description ? (
                  <FactRow icon={TicketPercent} label="Note">{coupon.description}</FactRow>
                ) : null}
                {coupon.startsAt || coupon.expiresAt ? (
                  <FactRow icon={Calendar} label="Window">
                    {coupon.startsAt ? formatCouponDateTime(coupon.startsAt) : 'No start'}
                    {' → '}
                    {coupon.expiresAt ? formatCouponDateTime(coupon.expiresAt) : 'No end'}
                  </FactRow>
                ) : null}
                {coupon.createdAt ? (
                  <FactRow icon={Calendar} label="Created">{formatCouponDateTime(coupon.createdAt)}</FactRow>
                ) : null}
                {coupon.updatedAt && coupon.updatedAt !== coupon.createdAt ? (
                  <FactRow icon={Clock} label="Last updated">{formatCouponDateTime(coupon.updatedAt)}</FactRow>
                ) : null}
              </div>
            </section>
          </DashboardReveal>

          <DashboardReveal index={3} className="lg:col-span-2">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <h3 className="text-sm font-bold text-slate-900">Store</h3>
                <p className="text-xs text-slate-500">The vendor this code belongs to</p>
              </div>
              <div className="px-5 py-4">
                {coupon.vendorId ? (
                  <Link
                    to={`/vendors/${encodeURIComponent(coupon.vendorId)}`}
                    className="flex items-center gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-200">
                      <Store className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">{coupon.vendorName}</span>
                      <span className="text-xs text-slate-500">Open store profile</span>
                    </span>
                  </Link>
                ) : (
                  <p className="text-sm text-slate-500">{coupon.vendorName || 'No store attached'}</p>
                )}
                <Link
                  to="/coupons/usage"
                  className="mt-4 inline-flex text-xs font-semibold text-brand hover:underline"
                >
                  View usage across all codes
                </Link>
              </div>
            </section>
          </DashboardReveal>
        </div>
      </div>

      <CouponFormDrawer
        open={editing}
        mode="edit"
        coupon={coupon}
        onClose={() => setEditing(false)}
      />
      <CouponStatusModal
        open={statusOpen}
        coupon={coupon}
        onClose={() => setStatusOpen(false)}
      />
      <CouponRemoveModal
        open={removing}
        coupon={coupon}
        onClose={() => setRemoving(false)}
        onRemoved={() => navigate('/coupons', { replace: true })}
      />
    </DashboardLayout>
  )
}
