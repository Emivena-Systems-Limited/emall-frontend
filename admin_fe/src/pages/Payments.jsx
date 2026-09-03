import { useEffect, useState } from 'react'
import { Search, Wallet } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import PaymentRefundModal from '../components/payments/PaymentRefundModal'
import PaymentRoster, { PaymentRosterSkeleton } from '../components/payments/PaymentRoster'
import PaymentStatsGrid from '../components/payments/PaymentStatsGrid'
import PaymentStatusModal from '../components/payments/PaymentStatusModal'
import { PAYMENT_STATUS_TABS } from '../constants/payments'
import { useAdminPaymentRoster, useAdminPaymentStats } from '../hooks/useAdminPayments'
import { formatCount } from '../utils/formatters'
import { parseApiError } from '../utils/parseApiError'

export default function Payments() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [statusItem, setStatusItem] = useState(null)
  const [refundItem, setRefundItem] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const filters = { status, search }
  const {
    items,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminPaymentRoster(filters, page)
  const { stats } = useAdminPaymentStats()

  const hasFilters = Boolean(query.trim() || status)
  const activeTab = PAYMENT_STATUS_TABS.find((tab) => tab.status === status)?.key ?? 'all'
  const tabCounts = {
    all: stats.total,
    paid: stats.paid,
    pending: stats.pending,
    failed: stats.failed,
    refunded: stats.refunded,
  }

  const updateStatus = (nextStatus) => {
    setStatus(nextStatus)
    setPage(1)
  }

  const clearFilters = () => {
    setQuery('')
    setSearch('')
    setStatus('')
    setPage(1)
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    document.querySelector('[data-dashboard-scroll-panel]')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <DashboardLayout pageTitle="Payments">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                <Wallet className="size-5 text-brand" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Finance
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Payments
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Watch captured checkouts, correct payment status, and refund duplicate charges.
                </p>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <PaymentStatsGrid
            stats={stats}
            activeKey={activeTab}
            onSelect={updateStatus}
          />
        </DashboardReveal>

        <DashboardReveal index={2}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-wrap gap-2">
              {PAYMENT_STATUS_TABS.map((tab) => {
                const active = activeTab === tab.key
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
                    <span className={`tabular-nums ${active ? 'text-white/70' : 'text-slate-400'}`}>
                      {formatCount(tabCounts[tab.key])}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4">
              <label htmlFor="payment-search" className="relative block min-w-0">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="payment-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search order, reference, or shopper"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
                />
              </label>
            </div>
          </section>
        </DashboardReveal>

        <DashboardReveal index={3}>
          {isLoading ? (
            <PaymentRosterSkeleton />
          ) : isError ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <EmptyState
                icon={Wallet}
                title="Could not load payments"
                description={parseApiError(error, 'The payment list is unavailable right now.').message}
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
            <PaymentRoster
              items={items}
              total={pagination.total}
              rangeStart={pagination.from}
              rangeEnd={pagination.to}
              page={pagination.page}
              totalPages={pagination.lastPage}
              onPageChange={handlePageChange}
              onClearFilters={clearFilters}
              hasFilters={hasFilters}
              status={status}
              onStatus={setStatusItem}
              onRefund={setRefundItem}
            />
          )}
        </DashboardReveal>
      </div>

      <PaymentStatusModal
        open={Boolean(statusItem)}
        item={statusItem}
        onClose={() => setStatusItem(null)}
      />
      <PaymentRefundModal
        open={Boolean(refundItem)}
        item={refundItem}
        onClose={() => setRefundItem(null)}
      />
    </DashboardLayout>
  )
}
