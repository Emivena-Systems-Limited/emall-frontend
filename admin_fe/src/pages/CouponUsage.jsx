import { Link } from 'react-router'
import { Banknote, ShoppingBag, TicketPercent, Users } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import SmartBackButton from '../components/navigation/SmartBackButton'
import SmartBackLink from '../components/navigation/SmartBackLink'
import CouponUsageCharts from '../components/coupons/CouponUsageCharts'
import { useAdminCouponUsage } from '../hooks/useAdminCoupons'
import { formatCount, formatOrderMoney } from '../utils/formatters'
import { formatCouponDateTime } from '../utils/normalizeAdminCoupons'
import { parseApiError } from '../utils/parseApiError'

function KpiCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-slate-200">
          <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  )
}

function UsageSkeleton() {
  return (
    <DashboardLayout pageTitle="Coupon usage">
      <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading coupon usage">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-24 rounded-2xl border border-slate-200 bg-white">
              <div className="skeleton-shimmer m-4 h-16 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="skeleton-shimmer h-80 rounded-2xl" />
      </div>
    </DashboardLayout>
  )
}

export default function CouponUsage() {
  const { usage, isLoading, isError, error, refetch } = useAdminCouponUsage()

  if (isLoading) return <UsageSkeleton />

  if (isError) {
    return (
      <DashboardLayout pageTitle="Coupon usage">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={TicketPercent}
              title="Could not load usage"
              description={parseApiError(error, 'Coupon analytics are unavailable right now.').message}
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

  const totals = usage?.totals ?? {}
  const recent = usage?.recent ?? []
  const top = usage?.top ?? []
  const byType = usage?.byType ?? []
  const empty = !totals.redemptions && !totals.discount && top.length === 0 && recent.length === 0

  return (
    <DashboardLayout pageTitle="Coupon usage">
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Growth</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Coupon usage
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              How often shoppers redeem codes, and how much those discounts take off the basket.
            </p>
          </header>
        </DashboardReveal>

        {empty ? (
          <DashboardReveal index={1}>
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <EmptyState
                icon={TicketPercent}
                title="No redemptions yet"
                description="When shoppers use a code at checkout, usage and savings will show up here."
                action={(
                  <SmartBackButton
                    fallback="/coupons"
                    fallbackLabel="Back to coupons"
                    className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  />
                )}
              />
            </section>
          </DashboardReveal>
        ) : (
          <>
            <DashboardReveal index={1}>
              <div className={`grid grid-cols-2 gap-3 ${totals.shoppers > 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                <KpiCard
                  icon={ShoppingBag}
                  label="Redemptions"
                  value={formatCount(totals.redemptions)}
                  hint="Times a code was applied"
                />
                <KpiCard
                  icon={Banknote}
                  label="Discount given"
                  value={formatOrderMoney(totals.discount)}
                  hint="Taken off checkout totals"
                />
                <KpiCard
                  icon={TicketPercent}
                  label="Codes tracked"
                  value={formatCount(totals.coupons || top.length)}
                  hint={totals.live ? `${formatCount(totals.live)} live` : 'From the usage report'}
                />
                {totals.shoppers > 0 ? (
                  <KpiCard
                    icon={Users}
                    label="Shoppers"
                    value={formatCount(totals.shoppers)}
                    hint="People who used a code"
                  />
                ) : null}
              </div>
            </DashboardReveal>

            <DashboardReveal index={2}>
              <CouponUsageCharts top={top} byType={byType} />
            </DashboardReveal>

            {recent.length > 0 ? (
              <DashboardReveal index={3}>
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                  <div className="border-b border-slate-100 px-5 py-3.5">
                    <h3 className="text-sm font-bold text-slate-900">Recent redemptions</h3>
                    <p className="text-xs text-slate-500">Latest times a code was applied at checkout</p>
                  </div>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-2.5">Code</th>
                          <th className="px-5 py-2.5">Shopper</th>
                          <th className="px-5 py-2.5">Discount</th>
                          <th className="px-5 py-2.5">When</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recent.map((row) => (
                          <tr key={row.id}>
                            <td className="px-5 py-3 font-semibold tracking-wide text-slate-900">{row.code}</td>
                            <td className="px-5 py-3 text-slate-600">{row.shopperName}</td>
                            <td className="px-5 py-3 tabular-nums text-slate-700">{formatOrderMoney(row.discount)}</td>
                            <td className="px-5 py-3 text-slate-500">{formatCouponDateTime(row.usedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ul className="divide-y divide-slate-100 md:hidden">
                    {recent.map((row) => (
                      <li key={row.id} className="px-5 py-3.5">
                        <p className="font-semibold tracking-wide text-slate-900">{row.code}</p>
                        <p className="mt-0.5 text-sm text-slate-600">{row.shopperName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatOrderMoney(row.discount)} · {formatCouponDateTime(row.usedAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              </DashboardReveal>
            ) : null}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
