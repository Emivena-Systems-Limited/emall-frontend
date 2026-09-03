import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { BarChart3, Plus, Search, SlidersHorizontal, TicketPercent, X } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import CouponFiltersDrawer from '../components/coupons/CouponFiltersDrawer'
import CouponFormDrawer from '../components/coupons/CouponFormDrawer'
import CouponRemoveModal from '../components/coupons/CouponRemoveModal'
import CouponRoster, { CouponRosterSkeleton } from '../components/coupons/CouponRoster'
import CouponStatsGrid from '../components/coupons/CouponStatsGrid'
import CouponStatusModal from '../components/coupons/CouponStatusModal'
import { COUPON_STATUS_TABS } from '../constants/coupons'
import { useAdminCouponRoster, useCouponStatusCounts } from '../hooks/useAdminCoupons'
import { formatCount } from '../utils/formatters'
import { parseApiError } from '../utils/parseApiError'
import { countCouponDrawerFilters, getCouponFilterChips } from '../utils/couponFilters'

export default function Coupons() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [composer, setComposer] = useState(null)
  const [statusCoupon, setStatusCoupon] = useState(null)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const filters = { status, search, type, vendorId }
  const {
    coupons,
    pagination,
    isLoading,
    isPlaceholderData,
    isError,
    error,
    refetch,
  } = useAdminCouponRoster(filters, page)

  const drawerFilterCount = countCouponDrawerFilters({ type, vendorId })
  const chips = getCouponFilterChips({ type, vendorId, vendorName })
  const hasFilters = Boolean(query.trim() || status || drawerFilterCount)
  const activeTab = COUPON_STATUS_TABS.find((tab) => tab.status === status)?.key ?? 'all'
  const currentTotal = !isLoading && !isPlaceholderData ? pagination.total : null
  const summary = useCouponStatusCounts(status, currentTotal)
  const tabCounts = {
    all: summary.total,
    live: summary.live,
    paused: summary.paused,
  }

  const updateStatus = (nextStatus) => {
    setStatus(nextStatus)
    setPage(1)
  }

  const clearDrawerFilters = () => {
    setType('')
    setVendorId('')
    setVendorName('')
    setPage(1)
  }

  const clearFilters = () => {
    setQuery('')
    setSearch('')
    setStatus('')
    clearDrawerFilters()
  }

  const removeChip = (key) => {
    if (key === 'type') setType('')
    if (key === 'vendor') {
      setVendorId('')
      setVendorName('')
    }
    setPage(1)
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    document.querySelector('[data-dashboard-scroll-panel]')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <DashboardLayout pageTitle="Coupons">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                  <TicketPercent className="size-5 text-brand" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                    Growth
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Coupons
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Issue store codes, pause them at checkout, and watch how often shoppers redeem them.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/coupons/usage"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <BarChart3 className="size-4" aria-hidden="true" />
                  Usage
                </Link>
                <button
                  type="button"
                  onClick={() => setComposer({ mode: 'create' })}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  New coupon
                </button>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <CouponStatsGrid
            summary={summary}
            activeKey={activeTab}
            onSelect={updateStatus}
          />
        </DashboardReveal>

        <DashboardReveal index={2}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-wrap gap-2">
              {COUPON_STATUS_TABS.map((tab) => {
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

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label htmlFor="coupon-search" className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="coupon-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search code or note"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
                />
              </label>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                aria-expanded={filtersOpen}
                aria-haspopup="dialog"
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <SlidersHorizontal className="size-3.5" />
                Filters
                {drawerFilterCount > 0 && (
                  <span className="flex min-h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                    {drawerFilterCount}
                  </span>
                )}
              </button>
            </div>

            {chips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeChip(chip.key)}
                    aria-label={`Remove ${chip.label} filter`}
                    className="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <span className="min-w-0 break-words">{chip.label}</span>
                    <X className="size-3.5 shrink-0 text-slate-400" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearDrawerFilters}
                  className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-brand"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </DashboardReveal>

        <DashboardReveal index={3}>
          {isLoading ? (
            <CouponRosterSkeleton />
          ) : isError ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <EmptyState
                icon={TicketPercent}
                title="Could not load coupons"
                description={parseApiError(error, 'The coupon list is unavailable right now.').message}
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
            <CouponRoster
              coupons={coupons}
              total={pagination.total}
              rangeStart={pagination.from}
              rangeEnd={pagination.to}
              page={pagination.page}
              totalPages={pagination.lastPage}
              onPageChange={handlePageChange}
              onClearFilters={clearFilters}
              hasFilters={hasFilters}
              onCreate={() => setComposer({ mode: 'create' })}
              onEdit={(coupon) => setComposer({ mode: 'edit', coupon })}
              onStatus={setStatusCoupon}
              onRemove={setRemoving}
            />
          )}
        </DashboardReveal>
      </div>

      <CouponFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        type={type}
        vendorId={vendorId}
        vendorName={vendorName}
        onTypeChange={(value) => {
          setType(value)
          setPage(1)
        }}
        onVendorChange={({ vendorId: nextId, vendorName: nextName }) => {
          setVendorId(nextId)
          setVendorName(nextName)
          setPage(1)
        }}
        onClear={clearDrawerFilters}
        resultCount={pagination.total}
      />
      <CouponFormDrawer
        open={Boolean(composer)}
        mode={composer?.mode ?? 'create'}
        coupon={composer?.coupon ?? null}
        onClose={() => setComposer(null)}
      />
      <CouponStatusModal
        open={Boolean(statusCoupon)}
        coupon={statusCoupon}
        onClose={() => setStatusCoupon(null)}
      />
      <CouponRemoveModal
        open={Boolean(removing)}
        coupon={removing}
        onClose={() => setRemoving(null)}
      />
    </DashboardLayout>
  )
}
