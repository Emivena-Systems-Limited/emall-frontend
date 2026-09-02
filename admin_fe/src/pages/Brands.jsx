import { useDeferredValue, useMemo, useState } from 'react'
import { Award, Plus, Search } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import BrandFormDrawer from '../components/brands/BrandFormDrawer'
import BrandRemoveModal from '../components/brands/BrandRemoveModal'
import BrandRoster, { BrandRosterSkeleton } from '../components/brands/BrandRoster'
import BrandStatsGrid from '../components/brands/BrandStatsGrid'
import BrandStatusModal from '../components/brands/BrandStatusModal'
import { BRAND_STATUS_TABS } from '../constants/brands'
import { useBrandRosterQuery, useBrandStatusCounts } from '../hooks/useAdminBrands'
import { formatCount } from '../utils/formatters'
import { parseApiError } from '../utils/parseApiError'
import { brandMatchesQuery } from '../utils/normalizeAdminBrands'

export default function Brands() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [composer, setComposer] = useState(null)
  const [statusBrand, setStatusBrand] = useState(null)
  const [removing, setRemoving] = useState(null)
  const deferredQuery = useDeferredValue(query)

  const {
    brands,
    pagination,
    isLoading,
    isPlaceholderData,
    isError,
    error,
    refetch,
  } = useBrandRosterQuery(status, page)

  const filtered = useMemo(
    () => brands.filter((brand) => brandMatchesQuery(brand, deferredQuery)),
    [brands, deferredQuery],
  )
  const searching = Boolean(deferredQuery.trim())
  const visibleTotal = searching ? filtered.length : pagination.total
  const hasFilters = Boolean(query.trim() || status)
  const activeTab = BRAND_STATUS_TABS.find((tab) => tab.status === status)?.key ?? 'all'
  const currentTotal = !isLoading && !isPlaceholderData ? pagination.total : null
  const summary = useBrandStatusCounts(status, currentTotal)
  const tabCounts = {
    all: summary.total,
    pending: summary.pending,
    approved: summary.approved,
    rejected: summary.rejected,
  }

  const updateStatus = (nextStatus) => {
    setStatus(nextStatus)
    setPage(1)
  }

  const clearFilters = () => {
    setQuery('')
    setStatus('')
    setPage(1)
  }

  return (
    <DashboardLayout pageTitle="Brands">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                  <Award className="size-5 text-brand" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                    Marketplace
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Brands
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Approve, rename, and retire labels shoppers use to find products.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setComposer({ mode: 'create' })}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <Plus className="size-4" aria-hidden="true" />
                New brand
              </button>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <BrandStatsGrid
            summary={summary}
            activeKey={activeTab}
            onSelect={updateStatus}
          />
        </DashboardReveal>

        <DashboardReveal index={2}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-wrap gap-2">
              {BRAND_STATUS_TABS.map((tab) => {
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

            <label htmlFor="brand-search" className="relative mt-4 block min-w-0">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <input
                id="brand-search"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search brand name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
              />
            </label>
          </section>
        </DashboardReveal>

        <DashboardReveal index={3}>
          {isLoading ? (
            <BrandRosterSkeleton />
          ) : isError ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <EmptyState
                icon={Award}
                title="Could not load brands"
                description={parseApiError(error, 'The brand list is unavailable right now.').message}
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
            <BrandRoster
              brands={filtered}
              total={visibleTotal}
              rangeStart={searching ? (filtered.length ? 1 : 0) : pagination.from}
              rangeEnd={searching ? filtered.length : pagination.to}
              page={pagination.page}
              totalPages={pagination.lastPage}
              onPageChange={setPage}
              onClearFilters={clearFilters}
              hasFilters={hasFilters}
              onEdit={(brand) => setComposer({ mode: 'edit', brand })}
              onStatus={setStatusBrand}
              onRemove={setRemoving}
            />
          )}
        </DashboardReveal>
      </div>

      <BrandFormDrawer
        open={Boolean(composer)}
        mode={composer?.mode}
        brand={composer?.brand ?? null}
        onClose={() => setComposer(null)}
      />
      <BrandStatusModal
        open={Boolean(statusBrand)}
        brand={statusBrand}
        onClose={() => setStatusBrand(null)}
      />
      <BrandRemoveModal
        open={Boolean(removing)}
        brand={removing}
        onClose={() => setRemoving(null)}
      />
    </DashboardLayout>
  )
}
