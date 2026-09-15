import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, CheckCheck, ChevronRight, Ellipsis, LoaderCircle, Package, Settings, ShoppingBag, Trash2 } from 'lucide-react'
import AccountSectionShell from './AccountSectionShell'
import { notify } from '../../lib/notify'
import { clearReadNotifications, deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead, markNotificationUnread } from '../../services/notificationService'
import { notificationQueryKeys } from '../../hooks/useNotificationUnreadCount'

const categories = [
  ['All', ''], ['Orders', 'orders'], ['Returns & Refunds', 'returns_refunds'],
  ['Payments', 'payments'], ['Promotions', 'promotions'], ['Account', 'account_security'],
]
const statuses = [['All Notifications', ''], ['Unread', 'unread'], ['Read', 'read']]
function unwrapList(payload) {
  const source = payload?.notifications ?? payload?.items ?? payload?.data?.notifications ?? payload?.data?.items ?? payload?.data ?? payload
  return Array.isArray(source) ? source : Array.isArray(source?.data) ? source.data : []
}

function categoryName(value) {
  const key = String(value || '').toLowerCase()
  if (key.includes('return') || key.includes('refund')) return 'Returns & Refunds'
  if (key.includes('payment')) return 'Payments'
  if (key.includes('promo') || key.includes('offer')) return 'Promotions'
  if (key.includes('order') || key.includes('delivery')) return 'Orders'
  return 'Account'
}

function normalizeItems(payload) {
  return unwrapList(payload).map((item, index) => {
    const data = item.data && typeof item.data === 'object' ? item.data : {}
    const stamp = item.created_at ?? item.sent_at ?? item.date ?? item.updated_at
    const parsed = stamp ? new Date(stamp) : null
    const valid = parsed && !Number.isNaN(parsed.getTime())
    return {
      id: item.id ?? item.notification_id ?? String(index),
      category: categoryName(item.category ?? item.type ?? data.category),
      title: item.title ?? item.subject ?? data.title ?? 'Account update',
      description: item.message ?? item.body ?? item.description ?? data.message ?? data.body ?? '',
      date: valid ? parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '',
      time: valid ? parsed.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '',
      unread: !(item.is_read ?? item.read ?? item.read_at),
      action: item.action_label ?? data.action_label ?? 'View details',
      href: item.action_url ?? item.url ?? data.action_url ?? data.url ?? '',
    }
  })
}

function safePath(value) {
  if (!value || typeof value !== 'string') return null
  if (value.startsWith('/') && !value.startsWith('//')) return value
  try {
    const url = new URL(value)
    return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : null
  } catch { return null }
}

function NotificationCard({ item, menuOpen, busy, onOpen, onMenu, onRead, onDelete }) {
  return <article role={item.href ? 'link' : undefined} tabIndex={item.href ? 0 : undefined} onClick={item.href ? onOpen : undefined} onKeyDown={(event) => { if (item.href && event.key === 'Enter') onOpen() }} className={`relative flex gap-4 border-b border-slate-100 px-4 py-4 sm:px-5 ${item.href ? 'cursor-pointer' : ''} ${item.unread ? 'bg-red-50/45' : 'bg-white hover:bg-slate-50/60'}`}>
    <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-auth-primary"><Package className="size-4.5" /></span>
    <div className="min-w-0 flex-1">
      <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="text-sm font-bold text-slate-950">{item.title}</h3>{item.unread && <span className="size-2 shrink-0 rounded-full bg-auth-primary" aria-label="Unread" />}</div><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">{item.description}</p></div>
        <div className="relative shrink-0"><button type="button" disabled={busy} aria-label="More notification options" onClick={(event) => { event.stopPropagation(); onMenu() }} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white disabled:opacity-50"><Ellipsis className="size-4" /></button>
          {menuOpen && <div className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button type="button" onClick={(event) => { event.stopPropagation(); onRead() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50">{item.unread ? <Check className="size-3.5" /> : <Bell className="size-3.5" />} Mark as {item.unread ? 'read' : 'unread'}</button><button type="button" onClick={(event) => { event.stopPropagation(); onDelete() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" /> Delete notification</button></div>}
        </div></div>
      <div className="mt-3 flex items-center justify-between gap-3"><p className="text-[0.7rem] font-medium text-slate-400">{[item.date, item.time].filter(Boolean).join(' · ')}</p>{item.href && <span className="inline-flex items-center gap-1 text-xs font-bold text-auth-primary">{item.action}<ChevronRight className="size-3.5" /></span>}</div>
    </div>
  </article>
}

export default function AccountNotificationsPanel() {
  const navigate = useNavigate()
  const client = useQueryClient()
  const [category, setCategory] = useState(categories[0])
  const [status, setStatus] = useState(statuses[0])
  const [page, setPage] = useState(1)
  const [openMenu, setOpenMenu] = useState(null)
  const filters = useMemo(() => ({ ...(category[1] && { category: category[1] }), page, per_page: 10 }), [category, page])
  const list = useQuery({ queryKey: notificationQueryKeys.list(filters), queryFn: () => getNotifications(filters), retry: false })
  const allItems = useMemo(() => normalizeItems(list.data), [list.data])
  const items = useMemo(() => allItems.filter((item) => status[1] === '' || (status[1] === 'unread' ? item.unread : !item.unread)), [allItems, status])
  const pagination = list.data?.pagination ?? list.data?.meta ?? list.data?.data?.pagination ?? {}
  const unread = allItems.filter((item) => item.unread).length
  const hasNotifications = Number(pagination.total ?? 0) > 0 || allItems.length > 0
  const refresh = () => { client.invalidateQueries({ queryKey: notificationQueryKeys.all }); client.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }) }
  const toggle = useMutation({ mutationFn: ({ item }) => item.unread ? markNotificationRead(item.id) : markNotificationUnread(item.id), onSuccess: refresh, onError: (error) => notify.error(error.message || 'Could not update notification'), onSettled: () => setOpenMenu(null) })
  const readAll = useMutation({ mutationFn: () => markAllNotificationsRead(category[1] || undefined), onSuccess: () => { notify.success('Notifications marked as read'); refresh() }, onError: (error) => notify.error(error.message || 'Could not mark notifications as read') })
  const remove = useMutation({ mutationFn: deleteNotification, onSuccess: () => { notify.success('Notification deleted'); refresh() }, onError: (error) => notify.error(error.message || 'Could not delete notification'), onSettled: () => setOpenMenu(null) })
  const clear = useMutation({ mutationFn: () => clearReadNotifications(category[1] || undefined), onSuccess: () => { notify.success('Read notifications cleared'); refresh() }, onError: (error) => notify.error(error.message || 'Could not clear notifications') })
  const filter = (setter, option) => { setPage(1); setOpenMenu(null); setter(option) }
  const open = (item) => { const path = safePath(item.href); if (path) { if (item.unread) toggle.mutate({ item }); navigate(path) } }

  return <AccountSectionShell eyebrow="Inbox" title="Notifications" description="Keep up with orders, payments, offers, and important account activity." icon={Bell}><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
    <div className={`flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between ${hasNotifications ? 'border-b border-slate-100' : ''}`}><div><div className="flex items-center gap-2"><h2 className="text-lg font-extrabold">Your updates</h2>{unread > 0 && <span className="rounded-full bg-auth-primary px-2 py-0.5 text-[0.65rem] font-bold text-white">{unread} unread</span>}</div><p className="mt-1 text-xs text-slate-500">Everything that needs your attention, in one place.</p></div><div className="flex flex-wrap gap-2">{hasNotifications && unread > 0 && <button type="button" disabled={readAll.isPending} onClick={() => readAll.mutate()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold disabled:opacity-40"><CheckCheck className="size-4" /> Mark all as read</button>}<Link to="/account/notifications/settings" className="inline-flex items-center gap-2 rounded-xl bg-auth-primary px-3.5 py-2 text-xs font-bold text-white"><Settings className="size-4" /> Notification Settings</Link></div></div>
    {hasNotifications && <div className="border-b border-slate-100 p-5"><div className="flex gap-2 overflow-x-auto">{categories.map((option) => <button key={option[0]} type="button" onClick={() => filter(setCategory, option)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold ${category[1] === option[1] ? 'bg-auth-primary text-white' : 'border border-slate-200 text-slate-600'}`}>{option[0]}</button>)}</div><div className="mt-3 flex items-center justify-between gap-3"><div className="flex rounded-xl bg-slate-100 p-1">{statuses.map((option) => <button key={option[0]} type="button" onClick={() => filter(setStatus, option)} className={`rounded-lg px-3 py-1.5 text-[0.7rem] font-bold ${status[1] === option[1] ? 'bg-white shadow-sm' : 'text-slate-500'}`}>{option[0]}</button>)}</div>{allItems.some((item) => !item.unread) && <button type="button" disabled={clear.isPending} onClick={() => { if (window.confirm('Clear all read notifications in this view?')) clear.mutate() }} className="text-xs font-bold text-auth-primary disabled:opacity-40">Clear all read</button>}</div></div>}
    {list.isLoading ? <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-5 animate-spin" /> Loading notifications…</div> : list.isError ? <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center"><Bell className="size-8 text-auth-primary" /><h3 className="mt-3 text-lg font-extrabold">Notifications could not be loaded</h3><p className="mt-1 text-sm text-slate-500">{list.error?.message || 'Please try again.'}</p><button type="button" onClick={() => list.refetch()} className="mt-4 rounded-xl bg-auth-primary px-4 py-2 text-xs font-bold text-white">Try again</button></div> : items.length ? <><div>{items.map((item) => <NotificationCard key={item.id} item={item} menuOpen={openMenu === item.id} busy={toggle.isPending || remove.isPending} onOpen={() => open(item)} onMenu={() => setOpenMenu((current) => current === item.id ? null : item.id)} onRead={() => toggle.mutate({ item })} onDelete={() => { if (window.confirm('Delete this notification?')) remove.mutate(item.id) }} />)}</div>{(pagination.last_page > 1 || pagination.total > items.length) && <div className="flex items-center justify-center gap-3 p-4"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">Previous</button><span className="text-xs text-slate-500">Page {pagination.current_page ?? page} of {pagination.last_page ?? '?'}</span><button type="button" disabled={pagination.last_page ? page >= pagination.last_page : items.length < 10} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">Next</button></div>}</> : <div className="flex min-h-80 flex-col items-center justify-center p-6 text-center"><span className="flex size-16 items-center justify-center rounded-2xl bg-red-50 text-auth-primary"><CheckCheck className="size-7" /></span><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-auth-primary">Inbox clear</p><h3 className="mt-2 text-2xl font-extrabold">You’re all caught up!</h3><p className="mt-2 text-sm text-slate-500">There are no notifications in this view.</p><Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-auth-primary px-5 py-2.5 text-sm font-bold text-white"><ShoppingBag className="size-4" /> Continue Shopping</Link></div>}
  </div></AccountSectionShell>
}
