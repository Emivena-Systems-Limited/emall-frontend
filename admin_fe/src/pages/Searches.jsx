import { useState } from 'react'
import { Search } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import SearchRoster, { SearchRosterSkeleton } from '../components/search/SearchRoster'
import SearchStatsGrid, { SearchStatsSkeleton } from '../components/search/SearchStatsGrid'
import SearchTopQueries from '../components/search/SearchTopQueries'
import {
  useSearchAnalyticsStats,
  useSearchLogs,
  useSearchTopQueries,
} from '../hooks/useAdminSearchAnalytics'
import { parseApiError } from '../utils/parseApiError'

export default function Searches() {
  const [page, setPage] = useState(1)
  const {
    items,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  } = useSearchLogs(page)
  const { stats, isLoading: statsLoading } = useSearchAnalyticsStats()
  const {
    queries,
    isLoading: topLoading,
    isError: topError,
    refetch: refetchTop,
  } = useSearchTopQueries()

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    document.querySelector('[data-dashboard-scroll-panel]')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <DashboardLayout pageTitle="Search">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                <Search className="size-5 text-brand" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Marketplace
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Search
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  See what shoppers type, which terms miss, and who is looking.
                </p>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          {statsLoading ? <SearchStatsSkeleton /> : <SearchStatsGrid stats={stats} />}
        </DashboardReveal>

        <DashboardReveal index={2}>
          <div className="grid items-start gap-5 xl:grid-cols-5">
            <div className="min-w-0 xl:col-span-3">
              {isLoading ? (
                <SearchRosterSkeleton />
              ) : isError ? (
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                  <EmptyState
                    icon={Search}
                    title="Could not load lookups"
                    description={parseApiError(error, 'Search activity is unavailable right now.').message}
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
                <SearchRoster
                  items={items}
                  total={pagination.total}
                  rangeStart={pagination.from}
                  rangeEnd={pagination.to}
                  page={pagination.page}
                  totalPages={pagination.lastPage}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
            <div className="min-w-0 xl:col-span-2">
              <SearchTopQueries
                queries={queries}
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
