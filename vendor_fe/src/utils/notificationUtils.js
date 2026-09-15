import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_DATE_GROUPS,
  NOTIFICATION_STATUSES,
  NOTIFICATIONS_STORAGE_KEY,
} from '../constants/notifications'
import { NOTIFICATION_TYPES } from '../constants/notificationsData'

export function getNotificationType(type) {
  return NOTIFICATION_TYPES[type] ?? NOTIFICATION_TYPES.platform_update
}

export function cloneNotifications(source = []) {
  return source.map((item) => ({ ...item }))
}

export function clonePreferences(source = DEFAULT_NOTIFICATION_PREFERENCES) {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, { ...value }]),
  )
}

export function countUnread(notifications = []) {
  return notifications.reduce((total, item) => total + (item.read ? 0 : 1), 0)
}

export function countByCategory(notifications = []) {
  const counts = { [NOTIFICATION_CATEGORIES.all]: notifications.length }

  notifications.forEach((item) => {
    const category = getNotificationType(item.type).category
    counts[category] = (counts[category] ?? 0) + 1
  })

  return counts
}

export function filterNotifications(notifications, { category, status }) {
  return notifications.filter((item) => {
    const type = getNotificationType(item.type)
    const categoryMatch = category === NOTIFICATION_CATEGORIES.all || type.category === category
    const statusMatch = status === NOTIFICATION_STATUSES.all
      || (status === NOTIFICATION_STATUSES.unread && !item.read)
      || (status === NOTIFICATION_STATUSES.read && item.read)

    return categoryMatch && statusMatch
  })
}

export function sortNotifications(notifications = []) {
  return [...notifications].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
}

function startOfLocalDay(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function getDateGroupId(dateTime) {
  const stamp = startOfLocalDay(dateTime)
  if (Number.isNaN(stamp)) return 'earlier'

  const today = startOfLocalDay(new Date())
  const yesterday = today - 86_400_000
  const weekAgo = today - 7 * 86_400_000

  if (stamp >= today) return 'today'
  if (stamp >= yesterday) return 'yesterday'
  if (stamp >= weekAgo) return 'thisWeek'
  return 'earlier'
}

export function groupNotificationsByDate(notifications = []) {
  const buckets = {
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: [],
  }

  notifications.forEach((item) => {
    buckets[getDateGroupId(item.dateTime)].push(item)
  })

  return NOTIFICATION_DATE_GROUPS
    .map((group) => ({ ...group, items: buckets[group.id] }))
    .filter((group) => group.items.length > 0)
}

export function formatNotificationTime(dateTime) {
  const date = new Date(dateTime)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.round(diffMs / 60_000)

  if (diffMs >= 0 && minutes < 1) return 'Just now'
  if (diffMs >= 0 && minutes < 60) return `${minutes}m ago`
  if (diffMs >= 0 && minutes < 24 * 60) return `${Math.round(minutes / 60)}h ago`

  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatNotificationExactTime(dateTime) {
  const date = new Date(dateTime)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function markNotificationRead(notifications, id, read) {
  return notifications.map((item) => (item.id === id ? { ...item, read } : item))
}

export function markAllNotificationsRead(notifications) {
  return notifications.map((item) => (item.read ? item : { ...item, read: true }))
}

export function deleteNotification(notifications, id) {
  return notifications.filter((item) => item.id !== id)
}

export function clearReadNotifications(notifications) {
  return notifications.filter((item) => !item.read)
}

function mergePreferences(stored) {
  const base = clonePreferences()
  if (!stored || typeof stored !== 'object') return base

  Object.keys(base).forEach((key) => {
    if (stored[key] && typeof stored[key] === 'object') {
      base[key] = { ...base[key], ...stored[key] }
    }
  })

  return base
}

function isValidStoredItems(items) {
  return Array.isArray(items) && items.every((item) => item && typeof item.id === 'string')
}

export function loadNotificationState() {
  if (typeof window === 'undefined') {
    return {
      enabled: false,
      items: [],
      preferences: clonePreferences(),
    }
  }

  try {
    const raw = window.sessionStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (!raw) {
      return { enabled: false, items: [], preferences: clonePreferences() }
    }

    const parsed = JSON.parse(raw)
    return {
      enabled: Boolean(parsed.enabled),
      items: isValidStoredItems(parsed.items) ? parsed.items : [],
      preferences: mergePreferences(parsed.preferences),
    }
  } catch {
    return { enabled: false, items: [], preferences: clonePreferences() }
  }
}

export function persistNotificationState(state) {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify({
      enabled: state.enabled,
      items: state.items,
      preferences: state.preferences,
    }),
  )
}
