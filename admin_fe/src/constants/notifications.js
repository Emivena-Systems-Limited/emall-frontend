export const NOTIFICATION_ADMIN_ENDPOINTS = {
  LIST: '/api/notification/admin/activity-logs',
  byId: (id) => `/api/notification/admin/activity-logs/${encodeURIComponent(id)}`,
}

export const NOTIFICATION_USER_TYPE = 'Admin'

export const NOTIFICATION_PAGE_SIZE = 20

export const NOTIFICATION_EVENT_META = {
  created: {
    label: 'Created',
    icon: 'plus',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    well: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  updated: {
    label: 'Updated',
    icon: 'pencil',
    badgeClass: 'bg-sky-50 text-sky-800 ring-sky-200',
    well: 'bg-sky-50 text-sky-700 ring-sky-100',
  },
  deleted: {
    label: 'Removed',
    icon: 'trash',
    badgeClass: 'bg-rose-50 text-rose-800 ring-rose-200',
    well: 'bg-rose-50 text-rose-700 ring-rose-100',
  },
  approved: {
    label: 'Approved',
    icon: 'check',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    well: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  rejected: {
    label: 'Rejected',
    icon: 'x',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
    well: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
  login: {
    label: 'Signed in',
    icon: 'shield',
    badgeClass: 'bg-violet-50 text-violet-800 ring-violet-200',
    well: 'bg-violet-50 text-violet-700 ring-violet-100',
  },
  default: {
    label: 'Activity',
    icon: 'bell',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
    well: 'bg-brand-light text-brand ring-brand-muted',
  },
}

export function getNotificationEventMeta(event) {
  const key = String(event ?? '').trim().toLowerCase()
  if (NOTIFICATION_EVENT_META[key]) return NOTIFICATION_EVENT_META[key]
  if (key.includes('creat')) return NOTIFICATION_EVENT_META.created
  if (key.includes('updat') || key.includes('edit') || key.includes('chang')) return NOTIFICATION_EVENT_META.updated
  if (key.includes('delet') || key.includes('remov')) return NOTIFICATION_EVENT_META.deleted
  if (key.includes('approv')) return NOTIFICATION_EVENT_META.approved
  if (key.includes('reject') || key.includes('declin')) return NOTIFICATION_EVENT_META.rejected
  if (key.includes('login') || key.includes('auth') || key.includes('sign')) return NOTIFICATION_EVENT_META.login
  return { ...NOTIFICATION_EVENT_META.default, label: key ? titleCaseEvent(key) : 'Activity' }
}

function titleCaseEvent(value) {
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
