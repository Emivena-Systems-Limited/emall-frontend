import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, Star, X } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import ReviewFiltersDrawer from '../components/reviews/ReviewFiltersDrawer'
import ReviewFeaturedModal from '../components/reviews/ReviewFeaturedModal'
import ReviewRemoveModal from '../components/reviews/ReviewRemoveModal'
import ReviewRoster, { ReviewRosterSkeleton } from '../components/reviews/ReviewRoster'
import ReviewStatsGrid from '../components/reviews/ReviewStatsGrid'
import ReviewStatusModal from '../components/reviews/ReviewStatusModal'
import { REVIEW_STATUS_TABS } from '../constants/reviews'
import { useAdminReviewRoster, useReviewStatusCounts } from '../hooks/useAdminReviews'
import { formatCount } from '../utils/formatters'
import { parseApiError } from '../utils/parseApiError'
import { countReviewDrawerFilters, getReviewFilterChips } from '../utils/reviewFilters'

export default function Reviews() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [rating, setRating] = useState('')
  const [featured, setFeatured] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statusReview, setStatusReview] = useState(null)
  const [featuredReview, setFeaturedReview] = useState(null)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const filters = { status, search, rating, featured, vendorId }
  const {
    reviews,
    pagination,
    isLoading,
    isPlaceholderData,
    isError,
    error,
    refetch,
  } = useAdminReviewRoster(filters, page)

  const drawerFilterCount = countReviewDrawerFilters({ rating, featured, vendorId })
  const chips = getReviewFilterChips({ rating, featured, vendorId, vendorName })
  const hasFilters = Boolean(query.trim() || status || drawerFilterCount)
  const activeTab = REVIEW_STATUS_TABS.find((tab) => tab.status === status)?.key ?? 'all'
  const currentTotal = !isLoading && !isPlaceholderData ? pagination.total : null
  const summary = useReviewStatusCounts(status, currentTotal)
  const tabCounts = {
    all: summary.total,
    visible: summary.visible,
    hidden: summary.hidden,
  }

  const updateStatus = (nextStatus) => {
    setStatus(nextStatus)
    setPage(1)
  }

  const clearDrawerFilters = () => {
    setRating('')
    setFeatured('')
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
    if (key === 'rating') setRating('')
    if (key === 'featured') setFeatured('')
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
    <DashboardLayout pageTitle="Reviews">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                <Star className="size-5 text-brand" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Trust
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Reviews
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Approve genuine feedback, hide abuse, and feature comments that help shoppers decide.
                </p>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <ReviewStatsGrid
            summary={summary}
            activeKey={activeTab}
            onSelect={updateStatus}
          />
        </DashboardReveal>

        <DashboardReveal index={2}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-wrap gap-2">
              {REVIEW_STATUS_TABS.map((tab) => {
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
              <label htmlFor="review-search" className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="review-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search shopper, listing, or comment"
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
            <ReviewRosterSkeleton />
          ) : isError ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <EmptyState
                icon={Star}
                title="Could not load reviews"
                description={parseApiError(error, 'The review list is unavailable right now.').message}
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
            <ReviewRoster
              reviews={reviews}
              total={pagination.total}
              rangeStart={pagination.from}
              rangeEnd={pagination.to}
              page={pagination.page}
              totalPages={pagination.lastPage}
              onPageChange={handlePageChange}
              onClearFilters={clearFilters}
              hasFilters={hasFilters}
              onStatus={setStatusReview}
              onFeatured={setFeaturedReview}
              onRemove={setRemoving}
            />
          )}
        </DashboardReveal>
      </div>

      <ReviewFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        rating={rating}
        featured={featured}
        vendorId={vendorId}
        vendorName={vendorName}
        onRatingChange={(value) => {
          setRating(value)
          setPage(1)
        }}
        onFeaturedChange={(value) => {
          setFeatured(value)
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
      <ReviewStatusModal
        open={Boolean(statusReview)}
        review={statusReview}
        onClose={() => setStatusReview(null)}
      />
      <ReviewFeaturedModal
        open={Boolean(featuredReview)}
        review={featuredReview}
        onClose={() => setFeaturedReview(null)}
      />
      <ReviewRemoveModal
        open={Boolean(removing)}
        review={removing}
        onClose={() => setRemoving(null)}
      />
    </DashboardLayout>
  )
}
