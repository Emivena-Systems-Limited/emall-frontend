import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  CreditCard,
  Ellipsis,
  Gift,
  Package,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import AccountSectionShell from './AccountSectionShell'

const categories = ['All', 'Orders', 'Returns & Refunds', 'Payments', 'Promotions', 'Account']
const statuses = ['All Notifications', 'Unread', 'Read']

const categoryMeta = {
  Orders: { icon: Package, tone: 'bg-red-50 text-auth-primary' },
  'Returns & Refunds': { icon: RotateCcw, tone: 'bg-red-50 text-auth-primary' },
  Payments: { icon: CreditCard, tone: 'bg-slate-100 text-slate-700' },
  Promotions: { icon: Gift, tone: 'bg-red-50 text-auth-primary' },
  Account: { icon: ShieldCheck, tone: 'bg-slate-100 text-slate-700' },
}

const initialNotifications = [
  { id: 1, category: 'Orders', title: 'Your order is on the way', description: 'Order #EZ-20483 has left the dispatch centre and is moving toward you.', date: 'Today', time: '10:42 AM', unread: true, action: 'Track Order', href: '/account/orders' },
  { id: 2, category: 'Returns & Refunds', title: 'Return request approved', description: 'Your return for the 12-piece kitchen utensil set has been approved.', date: 'Today', time: '8:15 AM', unread: true, action: 'View Return', href: '/account/returns' },
  { id: 3, category: 'Payments', title: 'Payment received', description: 'We received your payment for order #EZ-20483. Your receipt is ready.', date: 'Yesterday', time: '4:30 PM', unread: false, action: 'View Details', href: '/account/orders' },
  { id: 4, category: 'Promotions', title: 'A new deal is waiting for you', description: 'Save on selected home and kitchen products while the offer lasts.', date: 'Yesterday', time: '11:05 AM', unread: true, action: 'Shop Now', href: '/' },
  { id: 5, category: 'Account', title: 'New sign-in to your account', description: 'A new sign-in was detected. Review your activity if this was not you.', date: '26 Aug', time: '7:18 PM', unread: true, action: 'View Activity', href: '/account/settings' },
  { id: 6, category: 'Orders', title: 'Order delivered', description: 'Order #EZ-20174 was delivered successfully. We hope you enjoy it.', date: '25 Aug', time: '2:12 PM', unread: false, action: 'View Details', href: '/account/orders' },
  { id: 7, category: 'Promotions', title: 'Back in stock', description: 'An item you viewed recently is available again from your preferred store.', date: '24 Aug', time: '9:00 AM', unread: false, action: 'View Product', href: '/' },
  { id: 8, category: 'Returns & Refunds', title: 'Refund completed', description: 'Your refund has been completed and sent to your original payment method.', date: '22 Aug', time: '3:46 PM', unread: false, action: 'View Return', href: '/account/returns' },
]

function emitUnreadCount(items) {
  window.dispatchEvent(new CustomEvent('account-notifications-updated', {
    detail: { unreadCount: items.filter((item) => item.unread).length },
  }))
}

function NotificationCard({ notification, menuOpen, onOpen, onToggleMenu, onToggleRead, onDelete }) {
  const meta = categoryMeta[notification.category]
  const Icon = meta.icon

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => { if (event.key === 'Enter') onOpen() }}
      className={`relative flex cursor-pointer gap-3 border-b border-slate-100 px-4 py-4 transition focus-visible:outline-2 focus-visible:outline-auth-primary focus-visible:outline-offset-[-2px] sm:gap-4 sm:px-5 ${notification.unread ? 'bg-red-50/45' : 'bg-white hover:bg-slate-50/60'}`}
    >
      <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-950">{notification.title}</h3>
              {notification.unread ? <span className="size-2 shrink-0 rounded-full bg-auth-primary" aria-label="Unread" /> : null}
            </div>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">{notification.description}</p>
          </div>
          <div className="relative shrink-0">
            <button type="button" aria-label="More notification options" onClick={(event) => { event.stopPropagation(); onToggleMenu() }} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700">
              <Ellipsis className="size-4" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                <button type="button" onClick={(event) => { event.stopPropagation(); onToggleRead() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  {notification.unread ? <Check className="size-3.5" /> : <Bell className="size-3.5" />} Mark as {notification.unread ? 'read' : 'unread'}
                </button>
                <button type="button" onClick={(event) => { event.stopPropagation(); onDelete() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50">
                  <Trash2 className="size-3.5" /> Delete notification
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.7rem] font-medium text-slate-400">{notification.date} · {notification.time}</p>
          <Link to={notification.href} onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1 text-xs font-bold text-auth-primary hover:underline">
            {notification.action} <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function AccountNotificationsPanel() {
  const navigate = useNavigate()
  const [items, setItems] = useState(initialNotifications)
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All Notifications')
  const [visibleCount, setVisibleCount] = useState(5)
  const [openMenu, setOpenMenu] = useState(null)

  const unreadCount = items.filter((item) => item.unread).length
  const filteredItems = useMemo(() => items.filter((item) => {
    const categoryMatches = category === 'All' || item.category === category
    const statusMatches = status === 'All Notifications' || (status === 'Unread' ? item.unread : !item.unread)
    return categoryMatches && statusMatches
  }), [items, category, status])

  const updateItems = (updater) => {
    setItems((current) => {
      const next = updater(current)
      emitUnreadCount(next)
      return next
    })
  }

  const resetView = (callback) => {
    setVisibleCount(5)
    setOpenMenu(null)
    callback()
  }

  return (
    <AccountSectionShell eyebrow="Inbox" title="Notifications" description="Keep up with orders, payments, offers, and important account activity." icon={Bell}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-950">Your updates</h2>
              {unreadCount ? <span className="rounded-full bg-auth-primary px-2 py-0.5 text-[0.65rem] font-bold text-white">{unreadCount} unread</span> : null}
            </div>
            <p className="mt-1 text-xs text-slate-500">Everything that needs your attention, in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!unreadCount} onClick={() => updateItems((current) => current.map((item) => ({ ...item, unread: false })))} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-auth-primary/30 hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40">
              <CheckCheck className="size-4" /> Mark all as read
            </button>
            <button type="button" onClick={() => navigate('/account/settings')} className="inline-flex items-center gap-2 rounded-xl bg-auth-primary px-3.5 py-2 text-xs font-bold text-white transition hover:bg-auth-primary-hover">
              <Settings className="size-4" /> Notification Settings
            </button>
          </div>
        </div>

        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Notification categories">
            {categories.map((option) => (
              <button key={option} type="button" onClick={() => resetView(() => setCategory(option))} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition ${category === option ? 'bg-auth-primary text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-auth-primary/25 hover:text-auth-primary'}`}>
                {option}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1" aria-label="Notification status">
              {statuses.map((option) => (
                <button key={option} type="button" onClick={() => resetView(() => setStatus(option))} className={`rounded-lg px-3 py-1.5 text-[0.7rem] font-bold transition ${status === option ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>
                  {option}
                </button>
              ))}
            </div>
            <button type="button" disabled={!items.some((item) => !item.unread)} onClick={() => updateItems((current) => current.filter((item) => item.unread))} className="text-xs font-bold text-auth-primary hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline">
              Clear all read
            </button>
          </div>
        </div>

        {filteredItems.length ? (
          <>
            <div>
              {filteredItems.slice(0, visibleCount).map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  menuOpen={openMenu === notification.id}
                  onOpen={() => navigate(notification.href)}
                  onToggleMenu={() => setOpenMenu((current) => current === notification.id ? null : notification.id)}
                  onToggleRead={() => { updateItems((current) => current.map((item) => item.id === notification.id ? { ...item, unread: !item.unread } : item)); setOpenMenu(null) }}
                  onDelete={() => { updateItems((current) => current.filter((item) => item.id !== notification.id)); setOpenMenu(null) }}
                />
              ))}
            </div>
            {visibleCount < filteredItems.length ? (
              <div className="p-4 text-center sm:p-5">
                <button type="button" onClick={() => setVisibleCount((count) => count + 5)} className="rounded-xl border border-auth-primary px-6 py-2.5 text-xs font-bold text-auth-primary transition hover:bg-red-50">Load more notifications</button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-red-50 text-auth-primary"><CheckCheck className="size-7" /></span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-auth-primary">Inbox clear</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate-950">You’re all caught up!</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">There are no notifications in this view. We’ll let you know when something new needs your attention.</p>
            <Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-auth-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-auth-primary-hover"><ShoppingBag className="size-4" /> Continue Shopping</Link>
          </div>
        )}
      </div>
    </AccountSectionShell>
  )
}
