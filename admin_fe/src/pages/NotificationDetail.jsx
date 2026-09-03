import { Link, useNavigate, useParams } from 'react-router'
import { Bell, Calendar, Shield, Tag, User } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import SmartBackButton from '../components/navigation/SmartBackButton'
import SmartBackLink from '../components/navigation/SmartBackLink'
import NotificationEventBadge, { NotificationEventMark } from '../components/notifications/NotificationEventBadge'
import { NotificationListSkeleton } from '../components/notifications/NotificationList'
import { getNotificationEventMeta } from '../constants/notifications'
import { useAdminNotification } from '../hooks/useAdminNotifications'
import {
  formatNotificationRelative,
  formatNotificationTime,
} from '../utils/normalizeAdminNotifications'
import { parseApiError } from '../utils/parseApiError'

function FactRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200">
        <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium break-words text-slate-900">{children}</div>
      </div>
    </div>
  )
}

function NotificationDetailSkeleton() {
  return (
    <DashboardLayout pageTitle="Notification">
      <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading notification">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
          <div className="skeleton-shimmer h-3 w-28 rounded-md" />
          <div className="mt-5 flex items-start gap-4">
            <div className="skeleton-shimmer size-16 shrink-0 rounded-2xl" />
            <div className="space-y-2.5">
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              <div className="skeleton-shimmer h-8 w-56 rounded-md" />
              <div className="skeleton-shimmer h-3.5 w-40 rounded-md" />
            </div>
          </div>
        </section>
        <NotificationListSkeleton rows={4} />
      </div>
    </DashboardLayout>
  )
}

export default function NotificationDetail() {
  const { notificationId } = useParams()
  const navigate = useNavigate()
  const { notification, isLoading, isError, error, refetch } = useAdminNotification(notificationId)

  if (isLoading) return <NotificationDetailSkeleton />

  if (isError) {
    return (
      <DashboardLayout pageTitle="Notification">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Bell}
              title="Could not load this notification"
              description={parseApiError(error, 'This activity is unavailable right now.').message}
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
        </div>
      </DashboardLayout>
    )
  }

  if (!notification) {
    return (
      <DashboardLayout pageTitle="Notification">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Bell}
              title="This notification is not in the log"
              description="The link may be out of date, or this activity is no longer returned."
              action={(
                <SmartBackButton
                  fallback="/notifications"
                  fallbackLabel="Back to notifications"
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                />
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  const eventMeta = getNotificationEventMeta(notification.event)

  return (
    <DashboardLayout pageTitle={notification.title}>
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />

            <SmartBackLink
              fallback="/notifications"
              fallbackLabel="Back to notifications"
              variant="text-subtle"
              iconClassName="size-3.5"
              className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
            />

            <div className="flex min-w-0 items-start gap-4">
              <NotificationEventMark event={notification.event} size="lg" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Notification
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.75rem]">
                  {notification.title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <NotificationEventBadge event={notification.event} />
                  <p className="text-sm text-slate-500">
                    {formatNotificationRelative(notification.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <div className="grid items-start gap-4 lg:grid-cols-5">
          <DashboardReveal index={1} className="lg:col-span-3">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <h3 className="text-sm font-bold text-slate-900">Details</h3>
                <p className="text-xs text-slate-500">What happened and who was involved</p>
              </div>
              <div className="divide-y divide-slate-100 px-5">
                {notification.message ? (
                  <div className="py-4">
                    <p className="text-sm leading-relaxed text-slate-700">{notification.message}</p>
                  </div>
                ) : null}
                <FactRow icon={Tag} label="Activity">{eventMeta.label}</FactRow>
                <FactRow icon={User} label="By">{notification.actor}</FactRow>
                {notification.subject ? (
                  <FactRow icon={Bell} label="About">{notification.subject}</FactRow>
                ) : null}
                <FactRow icon={Calendar} label="When">
                  {formatNotificationTime(notification.createdAt)}
                </FactRow>
              </div>
            </section>
          </DashboardReveal>

          <DashboardReveal index={2} className="lg:col-span-2">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2">
                <Shield className="size-3.5 text-slate-400" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900">Context</h3>
              </div>
              {notification.details.length > 0 ? (
                <dl className="mt-3 divide-y divide-slate-100">
                  {notification.details.map((row) => (
                    <div key={`${row.label}-${row.value}`} className="flex justify-between gap-3 py-2.5">
                      <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{row.label}</dt>
                      <dd className="max-w-[60%] text-right text-sm font-medium break-words text-slate-800">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No extra context was returned with this activity.</p>
              )}
            </section>
          </DashboardReveal>
        </div>
      </div>
    </DashboardLayout>
  )
}
