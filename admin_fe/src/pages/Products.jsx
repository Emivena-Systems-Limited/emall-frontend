import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Inbox, Package, Search, Sparkles } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import ProductRoster, { ProductRosterSkeleton } from '../components/products/ProductRoster'
import ProductStatsGrid from '../components/products/ProductStatsGrid'
import ProductStatusModal from '../components/products/ProductStatusModal'
import ProductRemoveModal from '../components/products/ProductRemoveModal'
import ProductVisibilityModal from '../components/products/ProductVisibilityModal'
import { PRODUCT_STATUS_TABS, PRODUCT_VISIBILITY_OPTIONS } from '../constants/adminProducts'
import { useAdminProductRoster, useProductStatusCounts } from '../hooks/useAdminProducts'
import { formatCount } from '../utils/formatters'
import { parseApiError } from '../utils/parseApiError'

export default function Products() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [visibility, setVisibility] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [vendorLabel, setVendorLabel] = useState('')
  const [page, setPage] = useState(1)
  const [statusProduct, setStatusProduct] = useState(null)
  const [visibilityProduct, setVisibilityProduct] = useState(null)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const filters = { status, visibility, vendorId, search }
  const {
    products,
    pagination,
    isLoading,
    isPlaceholderData,
    isError,
    error,
    refetch,
  } = useAdminProductRoster(filters, page)

  const vendorOptions = useMemo(() => {
    const map = new Map()
    if (vendorId) map.set(vendorId, vendorLabel || 'Selected store')
    products.forEach((product) => {
      if (product.vendorId) map.set(product.vendorId, product.vendorName || 'Store')
    })
    return [...map.entries()]
  }, [products, vendorId, vendorLabel])

  const hasFilters = Boolean(query.trim() || status || visibility || vendorId)
  const activeTab = PRODUCT_STATUS_TABS.find((tab) => tab.status === status)?.key ?? 'all'
  const currentTotal = !isLoading && !isPlaceholderData ? pagination.total : null
  const summary = useProductStatusCounts(status, currentTotal)
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
    setSearch('')
    setStatus('')
    setVisibility('')
    setVendorId('')
    setVendorLabel('')
    setPage(1)
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    document.querySelector('[data-dashboard-scroll-panel]')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <DashboardLayout pageTitle="Catalogue">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                  <Package className="size-5 text-brand" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                    Marketplace
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Catalogue
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Review vendor listings, open the shopper preview, and decide what goes live.
                  </p>
                </div>
              </div>
              <Link
                to="/products/pending"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                Review desk
                {summary.pending > 0 ? (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold tabular-nums">
                    {formatCount(summary.pending)}
                  </span>
                ) : null}
              </Link>
            </div>
          </header>
        </DashboardReveal>

        {summary.pending > 0 && status !== 'pending' ? (
          <DashboardReveal index={1}>
            <Link
              to="/products/pending"
              className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-amber-950 shadow-[0_16px_45px_rgba(15,23,42,0.04)] transition-colors hover:bg-amber-100/80"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 ring-1 ring-amber-200">
                  <Inbox className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{formatCount(summary.pending)} listings need a decision</span>
                  <span className="block text-xs text-amber-800/80">Open the review desk to approve or send back with a note.</span>
                </span>
              </span>
              <span className="shrink-0 text-xs font-bold">Open desk</span>
            </Link>
          </DashboardReveal>
        ) : null}

        <DashboardReveal index={2}>
          <ProductStatsGrid
            summary={summary}
            activeKey={activeTab}
            onSelect={updateStatus}
          />
        </DashboardReveal>

        <DashboardReveal index={3}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-wrap gap-2">
              {PRODUCT_STATUS_TABS.map((tab) => {
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

            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
              <label htmlFor="product-search" className="relative min-w-0">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="product-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search listings"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
                />
              </label>
              <label htmlFor="product-vendor" className="sr-only">Store</label>
              <select
                id="product-vendor"
                value={vendorId}
                onChange={(event) => {
                  const nextId = event.target.value
                  setVendorId(nextId)
                  setVendorLabel(vendorOptions.find(([id]) => id === nextId)?.[1] ?? '')
                  setPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
              >
                <option value="">Any store</option>
                {vendorOptions.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <label htmlFor="product-visibility" className="sr-only">Visibility</label>
              <select
                id="product-visibility"
                value={visibility}
                onChange={(event) => {
                  setVisibility(event.target.value)
                  setPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
              >
                {PRODUCT_VISIBILITY_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>{option.label}</option>
                ))}
              </select>
            </div>
          </section>
        </DashboardReveal>

        <DashboardReveal index={4}>
          {isLoading ? (
            <ProductRosterSkeleton />
          ) : isError ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <EmptyState
                icon={Package}
                title="Could not load products"
                description={parseApiError(error, 'The catalogue is unavailable right now.').message}
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
            <ProductRoster
              products={products}
              total={pagination.total}
              rangeStart={pagination.from}
              rangeEnd={pagination.to}
              page={pagination.page}
              totalPages={pagination.lastPage}
              onPageChange={handlePageChange}
              onClearFilters={clearFilters}
              hasFilters={hasFilters}
              onStatus={setStatusProduct}
              onVisibility={setVisibilityProduct}
              onRemove={setRemoving}
            />
          )}
        </DashboardReveal>
      </div>

      <ProductStatusModal
        open={Boolean(statusProduct)}
        product={statusProduct}
        onClose={() => setStatusProduct(null)}
      />
      <ProductVisibilityModal
        open={Boolean(visibilityProduct)}
        product={visibilityProduct}
        onClose={() => setVisibilityProduct(null)}
      />
      <ProductRemoveModal
        open={Boolean(removing)}
        product={removing}
        onClose={() => setRemoving(null)}
      />
    </DashboardLayout>
  )
}
