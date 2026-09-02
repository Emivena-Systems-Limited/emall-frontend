import { useDeferredValue, useMemo, useState } from 'react'
import { Bell, Search } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import NotificationList, { NotificationListSkeleton } from '../components/notifications/NotificationList'
import { useAdminNotifications } from '../hooks/useAdminNotifications'
import { formatCount } from '../utils/formatters'
import { parseApiError } from '../utils/parseApiError'
import { notificationMatchesQuery } from '../utils/normalizeAdminNotifications'

export default function Notifications() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const deferredQuery = useDeferredValue(query)

  const {
    notifications,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminNotifications(page)

  const filtered = useMemo(
    () => notifications.filter((item) => notificationMatchesQuery(item, deferredQuery)),
    [notifications, deferredQuery],
  )
  const searching = Boolean(deferredQuery.trim())
  const visibleTotal = searching ? filtered.length : pagination.total

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    document.querySelector('[data-dashboard-scroll-panel]')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                <Bell className="size-5 text-brand" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Command
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Notifications
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Recent admin activity across the marketplace.
                </p>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                {pagination.total > 0 ? `${formatCount(pagination.total)} in the log` : 'Activity log'}
              </p>
            </div>
            <label htmlFor="notification-search" className="relative mt-3 block min-w-0">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <input
                id="notification-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this page"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
              />
            </label>
          </section>
        </DashboardReveal>

        <DashboardReveal index={2}>
          {isLoading ? (
            <NotificationListSkeleton />
          ) : isError ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <EmptyState
                icon={Bell}
                title="Could not load notifications"
                description={parseApiError(error, 'The activity log is unavailable right now.').message}
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
            <NotificationList
              notifications={filtered}
              total={visibleTotal}
              rangeStart={searching ? (filtered.length ? 1 : 0) : pagination.from}
              rangeEnd={searching ? filtered.length : pagination.to}
              page={pagination.page}
              totalPages={pagination.lastPage}
              onPageChange={handlePageChange}
              onClearFilters={() => setQuery('')}
              hasFilters={searching}
            />
          )}
        </DashboardReveal>
      </div>
    </DashboardLayout>
  )
}
