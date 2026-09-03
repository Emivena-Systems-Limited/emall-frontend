import { Link, useNavigate, useParams } from 'react-router'
import { useState } from 'react'
import {
  Archive,
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingBag,
  Star,
  UserRound,
} from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import UserAddressList from '../components/users/UserAddressList'
import UserArchiveModal from '../components/users/UserArchiveModal'
import UserIdentity, { UserRosterSkeleton } from '../components/users/UserIdentity'
import UserOrderHistory from '../components/users/UserOrderHistory'
import UserStatusBadge from '../components/users/UserStatusBadge'
import UserStatusModal from '../components/users/UserStatusModal'
import { getUserStatusMeta } from '../constants/adminUsers'
import {
  useAdminUser,
  useAdminUserAddresses,
  useAdminUserOrders,
} from '../hooks/useAdminUsers'
import { formatCount, formatOrderMoney } from '../utils/formatters'
import { formatUserDate, formatUserDateTime } from '../utils/normalizeAdminUsers'
import { parseApiError } from '../utils/parseApiError'
import { formatPhoneDisplay } from '../utils/phoneUtils'

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

function CountCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        {Icon ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-slate-200">
            <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  )
}

function UserDetailSkeleton() {
  return (
    <DashboardLayout pageTitle="User">
      <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading user">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
          <div className="skeleton-shimmer h-3 w-28 rounded-md" />
          <div className="mt-5 flex items-start gap-4">
            <div className="skeleton-shimmer size-14 shrink-0 rounded-2xl" />
            <div className="space-y-2.5">
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              <div className="skeleton-shimmer h-8 w-48 rounded-md" />
              <div className="skeleton-shimmer h-3.5 w-56 rounded-md" />
            </div>
          </div>
        </section>
        <UserRosterSkeleton rows={4} />
      </div>
    </DashboardLayout>
  )
}

export default function UserDetail() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user, isLoading, isPlaceholderData, isSuccess, isError, error, refetch } = useAdminUser(userId)
  const [statusOpen, setStatusOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [addressPage, setAddressPage] = useState(1)
  const [orderPage, setOrderPage] = useState(1)

  const hasEmbeddedAddresses = Array.isArray(user?.addresses)
  const addressesQuery = useAdminUserAddresses(userId, addressPage, {
    enabled: Boolean(userId) && isSuccess && !isPlaceholderData && !hasEmbeddedAddresses,
  })
  const ordersQuery = useAdminUserOrders(userId, orderPage)

  if (isLoading) return <UserDetailSkeleton />

  if (isError) {
    return (
      <DashboardLayout pageTitle="User">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={UserRound}
              title="Could not load this user"
              description={parseApiError(error, 'This account is unavailable right now.').message}
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

  if (!user) {
    return (
      <DashboardLayout pageTitle="User">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={UserRound}
              title="This user is not on the roster"
              description="The link may be out of date, or this account is no longer returned by the API."
              action={(
                <button
                  type="button"
                  onClick={() => navigate('/users')}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  Back to users
                </button>
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  const statusMeta = getUserStatusMeta(user.status)
  const embeddedAddresses = Array.isArray(user.addresses) ? user.addresses : []
  const addresses = hasEmbeddedAddresses ? embeddedAddresses : (addressesQuery.addresses ?? [])
  const addressPagination = hasEmbeddedAddresses
    ? {
      page: 1,
      lastPage: 1,
      perPage: Math.max(embeddedAddresses.length, 1),
      total: embeddedAddresses.length,
      from: embeddedAddresses.length ? 1 : 0,
      to: embeddedAddresses.length,
    }
    : addressesQuery.pagination
  const addressesLoading = !hasEmbeddedAddresses && (isPlaceholderData || addressesQuery.isLoading)
  const ordersCount = Math.max(user.counts?.orders ?? 0, ordersQuery.pagination.total ?? 0)
  const addressCount = Math.max(user.counts?.addresses ?? 0, addressPagination.total ?? 0, addresses.length)
  const reviewsCount = user.counts?.reviews ?? 0
  const wishlistCount = user.counts?.wishlist ?? 0
  const spent = user.counts?.spent ?? 0

  return (
    <DashboardLayout pageTitle={user.name}>
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />

            <Link
              to="/users"
              className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
            >
              <ArrowLeft className="size-3.5" />
              Back to users
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  {user.kindLabel}
                </p>
                <div className="mt-3">
                  <UserIdentity user={user} size="lg" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <UserStatusBadge status={user.status} />
                  <p className="text-sm text-slate-500">{statusMeta.hint}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStatusOpen(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Shield className="size-3.5" />
                  Update status
                </button>
                <button
                  type="button"
                  onClick={() => setArchiveOpen(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Archive className="size-3.5" />
                  Archive
                </button>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <div className={`grid grid-cols-2 gap-3 ${spent > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
            <CountCard
              icon={ShoppingBag}
              label="Orders"
              value={formatCount(ordersCount)}
              hint="Marketplace checkouts"
            />
            <CountCard
              icon={MapPin}
              label="Addresses"
              value={formatCount(addressCount)}
              hint="Saved destinations"
            />
            <CountCard
              icon={Star}
              label="Reviews"
              value={formatCount(reviewsCount)}
              hint="Feedback left"
            />
            <CountCard
              icon={Heart}
              label="Saved items"
              value={formatCount(wishlistCount)}
              hint="On their list"
            />
            {spent > 0 ? (
              <CountCard
                label="Lifetime spend"
                value={formatOrderMoney(spent)}
                hint="Captured checkout total"
              />
            ) : null}
          </div>
        </DashboardReveal>

        <div className="grid items-start gap-4 lg:grid-cols-5">
          <DashboardReveal index={2} className="lg:col-span-3">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <h3 className="text-sm font-bold text-slate-900">Profile</h3>
                <p className="text-xs text-slate-500">Contact and account activity</p>
              </div>
              <div className="divide-y divide-slate-100 px-5">
                <FactRow icon={UserRound} label="Name">{user.name}</FactRow>
                <FactRow icon={Mail} label="Email">
                  {user.email ? (
                    <a href={`mailto:${user.email}`} className="text-slate-900 transition-colors hover:text-brand">
                      {user.email}
                    </a>
                  ) : '—'}
                  {user.emailVerifiedAt !== undefined ? (
                    <p className={`mt-0.5 text-xs font-medium ${user.emailVerifiedAt ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {user.emailVerifiedAt ? `Confirmed ${formatUserDate(user.emailVerifiedAt)}` : 'Email not confirmed'}
                    </p>
                  ) : null}
                </FactRow>
                <FactRow icon={Phone} label="Phone">
                  {user.phone ? (
                    <a href={`tel:+${String(user.phone).replace(/\D/g, '')}`} className="text-slate-900 transition-colors hover:text-brand">
                      {formatPhoneDisplay(user.phone)}
                    </a>
                  ) : '—'}
                  {user.phoneVerifiedAt !== undefined ? (
                    <p className={`mt-0.5 text-xs font-medium ${user.phoneVerifiedAt ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {user.phoneVerifiedAt ? `Confirmed ${formatUserDate(user.phoneVerifiedAt)}` : 'Phone not confirmed'}
                    </p>
                  ) : null}
                </FactRow>
                {user.locationLabel || user.district ? (
                  <FactRow icon={MapPin} label="Location">
                    <p>{user.locationLabel || user.district || '—'}</p>
                    {user.district && user.locationLabel ? (
                      <p className="mt-0.5 text-xs font-medium text-slate-500">{user.district}</p>
                    ) : null}
                  </FactRow>
                ) : null}
                {user.joinedAt ? (
                  <FactRow icon={Calendar} label="Joined">{formatUserDate(user.joinedAt)}</FactRow>
                ) : null}
                {user.lastLoginAt ? (
                  <FactRow icon={Clock} label="Last activity">{formatUserDateTime(user.lastLoginAt)}</FactRow>
                ) : null}
              </div>
              {user.rejectionReason ? (
                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Note</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{user.rejectionReason}</p>
                </div>
              ) : null}
            </section>
          </DashboardReveal>

          <DashboardReveal index={3} className="lg:col-span-2">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
                <MapPin className="size-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Addresses</h3>
                  <p className="text-xs text-slate-500">Saved checkout destinations</p>
                </div>
              </div>
              <UserAddressList
                addresses={addresses}
                pagination={addressPagination}
                isLoading={addressesLoading}
                isError={!hasEmbeddedAddresses && addressesQuery.isError}
                errorMessage={parseApiError(addressesQuery.error, 'Saved addresses are unavailable right now.').message}
                onRetry={addressesQuery.refetch}
                onPageChange={setAddressPage}
              />
            </section>
          </DashboardReveal>
        </div>

        <DashboardReveal index={4}>
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
              <ShoppingBag className="size-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Order history</h3>
                <p className="text-xs text-slate-500">Marketplace checkouts for this shopper</p>
              </div>
            </div>
            <UserOrderHistory
              orders={ordersQuery.orders}
              pagination={ordersQuery.pagination}
              isLoading={ordersQuery.isLoading}
              isError={ordersQuery.isError}
              errorMessage={parseApiError(ordersQuery.error, 'Order history is unavailable right now.').message}
              onRetry={ordersQuery.refetch}
              onPageChange={setOrderPage}
            />
          </section>
        </DashboardReveal>
      </div>

      <UserStatusModal
        open={statusOpen}
        user={user}
        onClose={() => setStatusOpen(false)}
      />
      <UserArchiveModal
        open={archiveOpen}
        user={user}
        onClose={() => setArchiveOpen(false)}
        onArchived={() => navigate('/users', { replace: true })}
      />
    </DashboardLayout>
  )
}
