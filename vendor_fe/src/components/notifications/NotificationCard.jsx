import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Check, Mail, MoreHorizontal, Trash2 } from 'lucide-react'
import {
  formatNotificationExactTime,
  formatNotificationTime,
  getNotificationType,
} from '../../utils/notificationUtils'

function NotificationMenu({ notification, onMarkRead, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleOutside = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notification options"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onMarkRead(notification.id, !notification.read)
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            {notification.read ? (
              <Mail className="size-3.5 text-slate-400" strokeWidth={2} />
            ) : (
              <Check className="size-3.5 text-slate-400" strokeWidth={2} />
            )}
            {notification.read ? 'Mark as unread' : 'Mark as read'}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onDelete(notification.id)
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="size-3.5" strokeWidth={2} />
            Delete notification
          </button>
        </div>
      )}
    </div>
  )
}

export default function NotificationCard({ notification, onMarkRead, onDelete }) {
  const navigate = useNavigate()
  const type = getNotificationType(notification.type)
  const Icon = type.icon
  const href = notification.link || type.defaultTo
  const unread = !notification.read

  const openTarget = () => {
    if (unread) onMarkRead(notification.id, true, { silent: true })
    navigate(href)
  }

  return (
    <article
      className={`flex gap-3 rounded-2xl border px-4 py-3.5 transition-colors sm:gap-4 sm:px-5 ${
        unread
          ? 'border-brand/20 border-l-2 border-l-brand bg-brand-light/50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <button
        type="button"
        onClick={openTarget}
        className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left sm:gap-4"
      >
        <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${type.iconWrap}`}>
          <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`text-sm ${unread ? 'font-bold text-slate-950' : 'font-semibold text-slate-800'}`}>
              {notification.title}
            </span>
            {unread && (
              <span className="size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            )}
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200/80">
              {type.label}
            </span>
          </span>
          <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-slate-600">
            {notification.message}
          </span>
          <time
            dateTime={notification.dateTime}
            title={formatNotificationExactTime(notification.dateTime)}
            className="mt-2 block text-[11px] font-medium text-slate-400"
          >
            {formatNotificationTime(notification.dateTime)}
          </time>
        </span>
      </button>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-start">
        <Link
          to={href}
          onClick={() => unread && onMarkRead(notification.id, true, { silent: true })}
          className="inline-flex cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          {type.ctaLabel}
        </Link>
        <NotificationMenu
          notification={notification}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
        />
      </div>
    </article>
  )
}
