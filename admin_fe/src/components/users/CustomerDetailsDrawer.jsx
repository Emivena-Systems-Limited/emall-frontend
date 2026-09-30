import { useState } from 'react'
import { Activity, Mail, MapPin, Phone, ShoppingBag, Star, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import SlideDrawer from '../vendors/SlideDrawer'
import UserIdentity from './UserIdentity'
import UserStatusBadge from './UserStatusBadge'
import { useAdminUser, useAdminUserActivity, useAdminUserOrders, useAdminUserReviews } from '../../hooks/useAdminUsers'
import { formatCount, formatOrderMoney } from '../../utils/formatters'
import { formatUserDate, formatUserDateTime } from '../../utils/normalizeAdminUsers'
import { formatPhoneDisplay } from '../../utils/phoneUtils'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'Orders' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'activity', label: 'Activity' },
]

function Metric({ label, value }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-lg font-bold tabular-nums text-slate-950">{value}</p></div>
}

export default function CustomerDetailsDrawer({ customer, initialTab = 'overview', onClose, onStatus }) {
  const [tab, setTab] = useState(initialTab)
  const id = customer?.id
  const detail = useAdminUser(id)
  const ordersQuery = useAdminUserOrders(id, 1)
  const reviewsQuery = useAdminUserReviews(id, 1)
  const activityQuery = useAdminUserActivity(id, 1)
  const user = detail.user || customer

  return (
    <SlideDrawer open={Boolean(customer)} onClose={onClose} labelledBy="customer-details-title" title="Customer details" subtitle="Profile, orders, reviews and account activity" icon={UserRound} widthClass="max-w-2xl" footer={user ? <div className="flex gap-2"><Link to={`/users/${encodeURIComponent(user.id)}`} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">Open full profile</Link><button type="button" onClick={() => onStatus?.(user)} className="flex-1 cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Manage account</button></div> : null}>
      {!user ? <div className="py-20 text-center text-sm text-slate-500">Loading customer…</div> : <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3"><UserIdentity user={user} size="lg" /><UserStatusBadge status={user.status} /></div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4"><div><p className="text-slate-400">Customer ID</p><p className="mt-1 truncate font-mono font-semibold text-slate-700" title={user.id}>{user.id}</p></div><div><p className="text-slate-400">Date joined</p><p className="mt-1 font-semibold text-slate-700">{formatUserDate(user.joinedAt)}</p></div><div><p className="text-slate-400">Location</p><p className="mt-1 truncate font-semibold text-slate-700">{user.locationLabel || '—'}</p></div><div><p className="text-slate-400">Last active</p><p className="mt-1 font-semibold text-slate-700">{formatUserDateTime(user.lastLoginAt)}</p></div></div>
        </section>
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">{TABS.map((item) => <button key={item.key} type="button" onClick={() => setTab(item.key)} className={`min-w-24 flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold ${tab === item.key ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{item.label}</button>)}</div>

        {tab === 'overview' && <div className="space-y-4">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Total orders" value={formatCount(user.counts?.orders ?? 0)} /><Metric label="Total spent" value={formatOrderMoney(user.counts?.spent ?? 0)} /><Metric label="Total reviews" value={formatCount(user.counts?.reviews ?? 0)} /><Metric label="Return requests" value={formatCount(user.counts?.returns ?? 0)} /></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="font-bold text-slate-900">Contact information</h3><div className="mt-3 divide-y divide-slate-100 text-sm"><p className="flex items-center gap-3 py-3 text-slate-600"><Mail className="size-4 text-slate-400" />{user.email || 'No email address'}</p><p className="flex items-center gap-3 py-3 text-slate-600"><Phone className="size-4 text-slate-400" />{user.phone ? formatPhoneDisplay(user.phone) : 'No phone number'}</p><p className="flex items-center gap-3 py-3 text-slate-600"><MapPin className="size-4 text-slate-400" />{[user.locationLabel, user.district].filter(Boolean).join(' · ') || 'No location'}</p></div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-900">Recent orders</h3><button type="button" onClick={() => setTab('orders')} className="cursor-pointer text-xs font-semibold text-brand">View all</button></div><OrderPreview {...ordersQuery} /></section>
        </div>}
        {tab === 'orders' && <section className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="font-bold text-slate-900">Order history</h3><OrderPreview {...ordersQuery} limit={20} /></section>}
        {tab === 'reviews' && <CustomerReviews {...reviewsQuery} />}
        {tab === 'activity' && <CustomerActivity {...activityQuery} user={user} />}
      </div>}
    </SlideDrawer>
  )
}

function CustomerReviews({ reviews = [], isLoading, isError, refetch }) {
  if (isLoading) return <LoadingRows />
  if (isError) return <LoadError label="Customer reviews" onRetry={refetch} />
  if (!reviews.length) return <section className="rounded-2xl border border-slate-200 bg-white py-14 text-center"><Star className="mx-auto size-7 text-slate-300" /><h3 className="mt-3 font-bold text-slate-900">No customer reviews</h3><p className="mt-1 text-sm text-slate-500">Reviews written by this customer will appear here.</p></section>
  return <section className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">{reviews.map((review, index) => { const product = review.product?.name ?? review.product_name ?? review.title ?? 'Product review'; const body = review.comment ?? review.review ?? review.body ?? review.description ?? ''; const rating = Number(review.rating ?? review.stars ?? 0); return <article key={review.id ?? index} className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-slate-900">{product}</h3><p className="mt-1 text-xs text-slate-400">{formatUserDate(review.created_at ?? review.createdAt)}</p></div>{rating > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700"><Star className="size-3 fill-current" />{rating}</span>}</div>{body && <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>}</article>})}</section>
}

function CustomerActivity({ activity = [], isLoading, isError, refetch, user }) {
  if (isLoading) return <LoadingRows />
  if (isError) return <LoadError label="Customer activity" onRetry={refetch} />
  const items = activity.length ? activity : [{ id: 'last', title: 'Last account activity', created_at: user.lastLoginAt }, { id: 'joined', title: 'Customer joined', created_at: user.joinedAt }].filter((item) => item.created_at)
  if (!items.length) return <section className="rounded-2xl border border-slate-200 bg-white py-14 text-center"><Activity className="mx-auto size-7 text-slate-300" /><h3 className="mt-3 font-bold text-slate-900">No account activity</h3></section>
  return <section className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="font-bold text-slate-900">Account activity</h3><div className="mt-3 space-y-3">{items.map((item, index) => <div key={item.id ?? index} className="flex gap-3 rounded-xl bg-slate-50 p-3"><Activity className="mt-0.5 size-4 shrink-0 text-brand" /><div><p className="text-sm font-semibold text-slate-800">{item.title ?? item.action ?? item.event ?? item.type ?? 'Account activity'}</p>{(item.description ?? item.message) && <p className="mt-0.5 text-xs text-slate-500">{item.description ?? item.message}</p>}<p className="mt-1 text-xs text-slate-400">{formatUserDateTime(item.created_at ?? item.createdAt ?? item.timestamp ?? item.occurred_at)}</p></div></div>)}</div></section>
}

function LoadingRows() { return <div className="space-y-2">{[1, 2, 3].map((item) => <div key={item} className="skeleton-shimmer h-20 rounded-xl" />)}</div> }
function LoadError({ label, onRetry }) { return <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center"><p className="text-sm font-semibold text-rose-700">{label} could not be loaded.</p><button type="button" onClick={() => onRetry?.()} className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 ring-1 ring-rose-200">Try again</button></section> }

function OrderPreview({ orders = [], isLoading, isError, limit = 4 }) {
  if (isLoading) return <div className="mt-3 space-y-2">{[1, 2, 3].map((item) => <div key={item} className="skeleton-shimmer h-12 rounded-xl" />)}</div>
  if (isError) return <p className="mt-4 text-sm text-rose-600">Order history could not be loaded.</p>
  if (!orders.length) return <div className="py-8 text-center"><ShoppingBag className="mx-auto size-6 text-slate-300" /><p className="mt-2 text-sm text-slate-500">No orders yet</p></div>
  return <div className="mt-3 divide-y divide-slate-100">{orders.slice(0, limit).map((order) => <Link key={order.id} to={`/orders/${encodeURIComponent(order.apiId || order.id)}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-brand"><div><p className="font-semibold text-slate-800">{order.orderNumber || order.id}</p><p className="text-xs text-slate-400">{order.orderDate ? formatUserDate(order.orderDate) : '—'}</p></div><div className="text-right"><p className="font-bold text-slate-800">{formatOrderMoney(order.totalAmount ?? 0)}</p><p className="text-xs capitalize text-slate-400">{order.deliveryStatus || order.status || 'Processing'}</p></div></Link>)}</div>
}
