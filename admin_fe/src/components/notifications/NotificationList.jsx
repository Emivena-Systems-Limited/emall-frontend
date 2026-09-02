import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { formatCount } from '../../utils/formatters'
import {
  formatNotificationRelative,
  groupNotificationsByDay,
} from '../../utils/normalizeAdminNotifications'
import { prefetchAdminNotification } from '../../hooks/useAdminNotifications'
import NotificationEventBadge, { NotificationEventMark } from './NotificationEventBadge'

export function NotificationListSkeleton({ rows = 6 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading notifications"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-start gap-3 px-5 py-4">
            <div className="skeleton-shimmer size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-48 rounded-md" />
              <div className="skeleton-shimmer h-3 w-full max-w-sm rounded-md" />
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function NotificationRow({ item }) {
  const queryClient = useQueryClient()

  return (
    <Link
      to={`/notifications/${item.id}`}
      onMouseEnter={() => prefetchAdminNotification(queryClient, item.id)}
      onFocus={() => prefetchAdminNotification(queryClient, item.id)}
      className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset sm:px-5"
    >
      <span aria-hidden="true">
        <NotificationEventMark event={item.event} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{item.title}</p>
          {!item.read && (
            <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />
          )}
        </div>
        {item.message ? (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-600">{item.message}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <NotificationEventBadge event={item.event} />
          <span className="text-[11px] text-slate-400">
            {item.actor}
            {item.subject ? ` · ${item.subject}` : ''}
          </span>
        </div>
      </div>
      <time
        dateTime={item.createdAt || undefined}
        className="shrink-0 pt-0.5 text-[11px] font-medium whitespace-nowrap text-slate-400"
      >
        {formatNotificationRelative(item.createdAt)}
      </time>
    </Link>
  )
}

export default function NotificationList({
  notifications,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasFilters = false,
}) {
  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Bell}
          title={hasFilters ? 'No notifications match this search' : 'No notifications yet'}
          description={
            hasFilters
              ? 'Try a different search, or clear it to see the latest activity.'
              : 'Admin activity will show up here as the marketplace is used.'
          }
          action={hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Clear search
            </button>
          ) : null}
        />
      </section>
    )
  }

  const groups = groupNotificationsByDay(notifications)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="bg-slate-50 px-4 py-2 text-[11px] font-bold tracking-wide text-slate-500 uppercase sm:px-5">
            {group.label}
          </p>
          <ul className="divide-y divide-slate-100">
            {group.items.map((item) => (
              <li key={item.id}>
                <NotificationRow item={item} />
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{rangeStart}–{rangeEnd}</span> of{' '}
          <span className="font-semibold text-slate-700">{formatCount(total)}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <ChevronLeft className="size-3.5" />
            Prev
          </button>
          <span className="min-w-16 text-center text-xs font-semibold text-slate-600">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Next
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
