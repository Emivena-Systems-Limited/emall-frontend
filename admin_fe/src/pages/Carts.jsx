import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import CartRoster, { CartRosterSkeleton } from '../components/carts/CartRoster'
import CartStatsGrid, { CartStatsSkeleton } from '../components/carts/CartStatsGrid'
import CartTopProducts from '../components/carts/CartTopProducts'
import { CART_STATUS_TABS } from '../constants/cartAnalytics'
import {
  useAdminCartRoster,
  useCartAnalyticsStats,
  useCartTopProducts,
} from '../hooks/useAdminCartAnalytics'
import { formatCount } from '../utils/formatters'
import { parseApiError } from '../utils/parseApiError'

export default function Carts() {
  const [status, setStatus] = useState('active')
  const [page, setPage] = useState(1)
  const {
    items,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminCartRoster({ status }, page)
  const { stats, isLoading: statsLoading } = useCartAnalyticsStats()
  const {
    products,
    isLoading: topLoading,
    isError: topError,
    refetch: refetchTop,
  } = useCartTopProducts()

  const activeTab = CART_STATUS_TABS.find((tab) => tab.status === status)?.key ?? 'active'
  const tabCounts = {
    active: stats.active,
    all: stats.total,
  }
  const hasFilters = status !== 'active'

  const updateStatus = (nextStatus) => {
    setStatus(nextStatus)
    setPage(1)
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    document.querySelector('[data-dashboard-scroll-panel]')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <DashboardLayout pageTitle="Carts">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                <ShoppingBag className="size-5 text-brand" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Marketplace
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Carts
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  See open baskets, who is shopping, and which listings they add most.
                </p>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          {statsLoading ? <CartStatsSkeleton /> : <CartStatsGrid stats={stats} />}
        </DashboardReveal>

        <DashboardReveal index={2}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-wrap gap-2">
              {CART_STATUS_TABS.map((tab) => {
                const active = activeTab === tab.key
                const count = tabCounts[tab.key]
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => updateStatus(tab.status)}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                      active
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                    {count > 0 ? (
                      <span className={`tabular-nums ${active ? 'text-white/70' : 'text-slate-400'}`}>
                        {formatCount(count)}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </section>
        </DashboardReveal>

        <DashboardReveal index={3}>
          <div className="grid items-start gap-5 xl:grid-cols-5">
            <div className="min-w-0 xl:col-span-3">
              {isLoading ? (
                <CartRosterSkeleton />
              ) : isError ? (
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                  <EmptyState
                    icon={ShoppingBag}
                    title="Could not load carts"
                    description={parseApiError(error, 'The cart list is unavailable right now.').message}
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
              ) : (
                <CartRoster
                  items={items}
                  total={pagination.total}
                  rangeStart={pagination.from}
                  rangeEnd={pagination.to}
                  page={pagination.page}
                  totalPages={pagination.lastPage}
                  onPageChange={handlePageChange}
                  onClearFilters={() => updateStatus('active')}
                  hasFilters={hasFilters}
                  status={status}
                />
              )}
            </div>
            <div className="min-w-0 xl:col-span-2">
              <CartTopProducts
                products={products}
                isLoading={topLoading}
                isError={topError}
                onRetry={() => refetchTop()}
              />
            </div>
          </div>
        </DashboardReveal>
      </div>
    </DashboardLayout>
  )
}
