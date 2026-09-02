import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, Store, X } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import ChartSelect from '../components/dashboard/ChartSelect'
import VendorFiltersDrawer from '../components/vendors/VendorFiltersDrawer'
import VendorRoster, { VendorRosterSkeleton } from '../components/vendors/VendorRoster'
import VendorStatsGrid from '../components/vendors/VendorStatsGrid'
import {
  DEFAULT_VENDOR_FILTERS,
  VENDOR_PAGE_SIZE,
  VENDOR_SORT_OPTIONS,
  VENDOR_STATUS_TABS,
} from '../constants/vendorsData'
import { formatCount } from '../utils/formatters'
import { parseApiError } from '../utils/parseApiError'
import {
  countAllVendorFilters,
  countVendorDrawerFilters,
  filterVendors,
  getActiveStatusTab,
  getVendorFilterChips,
  getVendorSummary,
  paginateVendors,
  removeVendorFilterChip,
} from '../utils/vendorFilters'
import { useVendorRosterQuery } from '../hooks/useAdminVendors'

export default function Vendors() {
  const [filters, setFilters] = useState(DEFAULT_VENDOR_FILTERS)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const {
    vendors,
    allVendors,
    isLoading,
    isError,
    error,
    refetch,
  } = useVendorRosterQuery(filters)

  const summary = useMemo(() => getVendorSummary(allVendors), [allVendors])
  const filtered = useMemo(() => filterVendors(vendors, filters), [vendors, filters])
  const paged = useMemo(
    () => paginateVendors(filtered, page, VENDOR_PAGE_SIZE),
    [filtered, page],
  )
  const chips = useMemo(() => getVendorFilterChips(filters), [filters])
  const drawerFilterCount = countVendorDrawerFilters(filters)
  const allFilterCount = countAllVendorFilters(filters)
  const activeTab = getActiveStatusTab(filters.statuses)

  const updateFilters = (patch) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters((current) => ({ ...DEFAULT_VENDOR_FILTERS, sort: current.sort }))
    setPage(1)
  }

  const tabCounts = {
    all: summary.total,
    pending: summary.pending,
    approved: summary.approved,
    rejected: summary.rejected,
    suspended: summary.suspended,
  }

  return (
    <DashboardLayout pageTitle="Vendors">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                <Store className="size-5 text-brand" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Marketplace
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Vendor roster
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Approve, reject, inspect, and pause every store from one list — including accounts still in pending review.
                </p>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <VendorStatsGrid
            summary={summary}
            activeKey={activeTab}
            onSelect={(statuses) => updateFilters({ statuses })}
          />
        </DashboardReveal>

        <DashboardReveal index={2}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-wrap gap-2">
              {VENDOR_STATUS_TABS.map((tab) => {
                const active = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => updateFilters({ statuses: tab.statuses })}
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

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={filters.query}
                  onChange={(event) => updateFilters({ query: event.target.value })}
                  placeholder="Search store, owner, email, or region"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <ChartSelect
                  id="vendor-sort"
                  label="Sort vendors"
                  value={filters.sort}
                  options={VENDOR_SORT_OPTIONS}
                  onChange={(sort) => updateFilters({ sort })}
                />
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  aria-expanded={filtersOpen}
                  aria-haspopup="dialog"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
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
            </div>

            {chips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => {
                      setFilters((current) => removeVendorFilterChip(current, chip.key))
                      setPage(1)
                    }}
                    aria-label={`Remove ${chip.label} filter`}
                    className="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <span className="min-w-0 break-words">{chip.label}</span>
                    <X className="size-3.5 shrink-0 text-slate-400" />
                  </button>
                ))}
                {allFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-brand"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </section>
        </DashboardReveal>

        <DashboardReveal index={3}>
          {isLoading ? (
            <VendorRosterSkeleton />
          ) : isError ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <EmptyState
                icon={Store}
                title="Could not load vendors"
                description={parseApiError(error, 'The vendor roster is unavailable right now.').message}
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
            <VendorRoster
              vendors={paged.items}
              total={filtered.length}
              rangeStart={paged.rangeStart}
              rangeEnd={paged.rangeEnd}
              page={paged.page}
              totalPages={paged.totalPages}
              onPageChange={setPage}
              onClearFilters={clearFilters}
              hasFilters={allFilterCount > 0}
            />
          )}
        </DashboardReveal>
      </div>

      <VendorFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
        resultCount={filtered.length}
      />
    </DashboardLayout>
  )
}
