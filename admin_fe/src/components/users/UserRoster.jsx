import { Link, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { formatCount } from '../../utils/formatters'
import { formatUserDateTime } from '../../utils/normalizeAdminUsers'
import { formatPhoneDisplay } from '../../utils/phoneUtils'
import { prefetchAdminUser } from '../../hooks/useAdminUsers'
import UserActions from './UserActions'
import UserIdentity, { UserRosterSkeleton } from './UserIdentity'
import UserStatusBadge from './UserStatusBadge'

export { UserRosterSkeleton }

export default function UserRoster({
  users,
  total,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
  hasFilters = false,
  onStatus,
  onArchive,
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const prefetch = (id) => prefetchAdminUser(queryClient, id)

  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Users}
          title={hasFilters ? 'No users match these filters' : 'No users yet'}
          description={
            hasFilters
              ? 'Try a different status or search, or clear the current filters.'
              : 'Shopper accounts will appear here once they are returned by the API.'
          }
          action={hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Clear filters
            </button>
          ) : null}
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-2.5">User</th>
              <th className="px-5 py-2.5">Location</th>
              <th className="px-5 py-2.5">Activity</th>
              <th className="px-5 py-2.5">Last seen</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <Link
                    to={`/users/${encodeURIComponent(user.id)}`}
                    onMouseEnter={() => prefetch(user.id)}
                    onFocus={() => prefetch(user.id)}
                    className="block rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <UserIdentity user={user} />
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  <p className="truncate">{user.locationLabel || '—'}</p>
                  {user.district && user.district !== user.city ? (
                    <p className="mt-0.5 truncate text-xs text-slate-400">{user.district}</p>
                  ) : null}
                </td>
                <td className="px-5 py-3 text-slate-600">
                  <p className="tabular-nums">{formatCount(user.counts?.orders ?? 0)} orders</p>
                  <p className="mt-0.5 text-xs tabular-nums text-slate-400">
                    {formatCount(user.counts?.addresses ?? 0)} addresses
                  </p>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {formatUserDateTime(user.lastLoginAt)}
                </td>
                <td className="px-5 py-3">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <UserActions
                    user={user}
                    onView={() => navigate(`/users/${encodeURIComponent(user.id)}`)}
                    onStatus={onStatus}
                    onArchive={onArchive}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {users.map((user) => (
          <li key={user.id} className="px-4 py-3.5">
            <Link
              to={`/users/${encodeURIComponent(user.id)}`}
              onMouseEnter={() => prefetch(user.id)}
              onFocus={() => prefetch(user.id)}
              className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <div className="flex items-start justify-between gap-3">
                <UserIdentity user={user} />
                <UserStatusBadge status={user.status} compact />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {user.phone ? formatPhoneDisplay(user.phone) : 'No phone'}
                {user.locationLabel ? ` · ${user.locationLabel}` : ''}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {formatCount(user.counts?.orders ?? 0)} orders
                {' · '}
                {formatCount(user.counts?.addresses ?? 0)} addresses
                {user.lastLoginAt ? ` · ${formatUserDateTime(user.lastLoginAt)}` : ''}
              </p>
            </Link>
            <div className="mt-2 flex justify-end">
              <UserActions
                user={user}
                onView={() => navigate(`/users/${encodeURIComponent(user.id)}`)}
                onStatus={onStatus}
                onArchive={onArchive}
              />
            </div>
          </li>
        ))}
      </ul>

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
