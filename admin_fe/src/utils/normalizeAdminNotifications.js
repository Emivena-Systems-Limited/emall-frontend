import { unwrapApiEnvelope } from './parseApiError'
import { sortLatestFirst } from './sortLatestFirst'
import { NOTIFICATION_PAGE_SIZE, getNotificationEventMeta } from '../constants/notifications'

const HIDDEN_DETAIL_KEYS = new Set([
  'id',
  'uuid',
  'slug',
  'log_name',
  'event',
  'action',
  'type',
  'user_type',
  'user_id',
  'causer_id',
  'causer_type',
  'subject_id',
  'subject_type',
  'batch_uuid',
  'application_token',
  'remember_token',
  'password',
  'token',
  'title',
  'heading',
  'message',
  'body',
  'description',
  'created_at',
  'createdAt',
  'updated_at',
  'updatedAt',
  'logged_at',
  'dateTime',
  'is_read',
  'read',
  'read_at',
  'readAt',
])

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function firstText(...values) {
  for (const value of values) {
    if (value == null || isRecord(value) || Array.isArray(value)) continue
    const text = String(value).trim()
    if (text && text !== '[object Object]') return text
  }
  return ''
}

function isHiddenDetailKey(key) {
  const normalized = String(key ?? '').trim()
  if (!normalized) return true
  if (HIDDEN_DETAIL_KEYS.has(normalized)) return true
  return /(_id|_ids|_type|_uuid|_token)$/i.test(normalized)
}

function humanizeMorphType(type) {
  const last = String(type ?? '').split(/[\\/]/).pop() ?? ''
  return last.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim()
}

export function extractNotificationPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractNotificationList(body)
  const source = isRecord(payload) && !Array.isArray(payload)
    ? (isRecord(payload.meta) ? { ...payload, ...payload.meta } : payload)
    : {}

  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? NOTIFICATION_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : NOTIFICATION_PAGE_SIZE

  const total = Number(source.total ?? list.length)
  const safeTotal = Number.isFinite(total) && total > 0 ? total : list.length
  const inferredLastPage = Math.max(1, Math.ceil((safeTotal || 1) / safePerPage))
  const lastPage = Number(source.last_page ?? source.lastPage ?? inferredLastPage)

  const inferredFrom = list.length ? (safePage - 1) * safePerPage + 1 : 0
  const inferredTo = list.length ? inferredFrom + list.length - 1 : 0
  const from = Number(source.from ?? inferredFrom)
  const to = Number(source.to ?? inferredTo)

  return {
    page: safePage,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    perPage: safePerPage,
    total: safeTotal,
    from: Number.isFinite(from) && from > 0 ? from : inferredFrom,
    to: Number.isFinite(to) && to > 0 ? to : inferredTo,
  }
}

export function extractNotificationList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.logs)) return payload.logs
  if (Array.isArray(payload?.activity_logs)) return payload.activity_logs
  if (Array.isArray(payload?.activityLogs)) return payload.activityLogs
  if (Array.isArray(payload?.notifications)) return payload.notifications
  if (Array.isArray(payload?.items)) return payload.items

  return []
}

function unwrapNotificationRecord(record) {
  if (Array.isArray(record)) return unwrapNotificationRecord(record[0])
  if (!isRecord(record)) return null
  if (isRecord(record.log)) return unwrapNotificationRecord(record.log)
  if (isRecord(record.activity_log)) return unwrapNotificationRecord(record.activity_log)
  if (isRecord(record.notification)) return unwrapNotificationRecord(record.notification)
  if (Array.isArray(record.data)) return unwrapNotificationRecord(record.data)
  if (isRecord(record.data) && (record.data.id || record.data.description || record.data.title)) {
    return unwrapNotificationRecord(record.data)
  }
  return record
}

export function extractNotificationRecord(body, notificationId) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const wanted = notificationId == null ? '' : String(notificationId)

  if (Array.isArray(payload)) {
    return payload.find((item) => String(item?.id) === wanted) ?? payload[0] ?? null
  }

  if (Array.isArray(payload?.data)) {
    return payload.data.find((item) => String(item?.id) === wanted) ?? payload.data[0] ?? null
  }

  return payload
}

function actorFrom(source) {
  const nested = source.causer ?? source.user ?? source.actor ?? source.admin ?? {}
  return firstText(
    source.causer_name,
    source.actor_name,
    source.user_name,
    source.admin_name,
    nested.name,
    nested.full_name,
    [nested.first_name, nested.last_name].filter(Boolean).join(' '),
    nested.email,
  )
}

function subjectFrom(source) {
  const nested = source.subject ?? source.resource ?? {}
  const attributes = isRecord(source.properties?.attributes) ? source.properties.attributes : {}
  return firstText(
    source.subject_name,
    source.resource_name,
    nested.brand_name,
    nested.category_name,
    nested.store_name,
    nested.name,
    nested.title,
    attributes.brand_name,
    attributes.category_name,
    attributes.store_name,
    attributes.name,
    attributes.title,
    humanizeMorphType(source.subject_type ?? nested.type),
  )
}

function eventFrom(source) {
  const raw = firstText(source.event, source.action, source.type)
  if (raw) return raw.toLowerCase().replace(/\s+/g, '_')

  const description = firstText(source.description)
  if (description && description.split(/\s+/).length <= 3) {
    return description.toLowerCase().replace(/\s+/g, '_')
  }
  return 'activity'
}

function titleFrom(source, event) {
  const explicit = firstText(source.title, source.heading, source.subject_label)
  if (explicit) return explicit

  const meta = getNotificationEventMeta(event)
  const subject = subjectFrom(source)
  if (subject) return `${meta.label} · ${subject}`

  const description = firstText(source.description)
  const eventLabel = String(event ?? '').replace(/[_-]+/g, ' ')
  if (description && description.toLowerCase() !== event && description.toLowerCase() !== eventLabel) {
    return description
  }
  return meta.label
}

function messageFrom(source, title, event) {
  const explicit = firstText(source.message, source.body)
  if (explicit && explicit !== title) return explicit

  const description = firstText(source.description)
  if (!description || description === title) return ''
  const eventLabel = String(event ?? '').replace(/[_-]+/g, ' ')
  if (description.toLowerCase() === event || description.toLowerCase() === eventLabel) return ''
  return description
}

export function normalizeAdminNotification(record) {
  const source = unwrapNotificationRecord(record)
  if (!isRecord(source)) return null

  const id = firstText(source.id, source.uuid)
  const event = eventFrom(source)
  const createdAt = firstText(source.created_at, source.createdAt, source.logged_at, source.dateTime)
  const title = titleFrom(source, event)
  const message = messageFrom(source, title, event)
  if (!id && !title && !message) return null

  const hasReadState = 'read_at' in source || 'readAt' in source || 'is_read' in source || 'read' in source
  const readAt = firstText(source.read_at, source.readAt)
  const read = !hasReadState || source.is_read === true || source.read === true || Boolean(readAt)

  return {
    id: id || `${event}-${createdAt || title}`,
    title: title || 'Activity',
    message: message && message !== title ? message : '',
    event,
    actor: actorFrom(source) || 'System',
    subject: subjectFrom(source),
    createdAt: createdAt || null,
    read,
    details: buildNotificationDetails(source),
  }
}

export function normalizeAdminNotifications(body) {
  return sortLatestFirst(
    extractNotificationList(body).map(normalizeAdminNotification).filter(Boolean),
    ['createdAt', 'id'],
  )
}

function humanizeKey(key) {
  const cleaned = String(key ?? '')
    .replace(/\[\]/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return ''
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDetailValue(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.map(formatDetailValue).filter(Boolean).join(', ')
  if (isRecord(value)) return ''
  return String(value)
}

function flattenDetails(record, prefix = '') {
  if (!isRecord(record)) return []

  return Object.entries(record).flatMap(([key, value]) => {
    if (isHiddenDetailKey(key)) return []
    const label = humanizeKey(key)
    if (!label) return []

    if (isRecord(value)) {
      if (key === 'attributes' || key === 'old' || key === 'changes') {
        return flattenDetails(value)
      }
      return flattenDetails(value, label)
    }

    const text = formatDetailValue(value)
    if (!text) return []
    return [{ label: prefix ? `${prefix} · ${label}` : label, value: text }]
  })
}

export function buildNotificationDetails(source) {
  const root = unwrapNotificationRecord(source)
  if (!isRecord(root)) return []

  const bag = isRecord(root.properties) ? root.properties : root
  const rows = flattenDetails(bag)
  const seen = new Set()

  return rows.filter((row) => {
    const stamp = `${row.label}:${row.value}`
    if (seen.has(stamp)) return false
    seen.add(stamp)
    return row.label !== 'Description' && row.label !== 'Title' && row.label !== 'Message'
  }).slice(0, 12)
}

export function notificationMatchesQuery(item, query) {
  const needle = String(query ?? '').trim().toLowerCase()
  if (!needle) return true
  return [item?.title, item?.message, item?.actor, item?.subject, item?.event]
    .some((value) => String(value ?? '').toLowerCase().includes(needle))
}

export function formatNotificationTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatNotificationRelative(value, now = new Date()) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000)
  if (seconds < 45) return 'Just now'
  if (seconds < 90) return 'A minute ago'
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`
  if (seconds < 5400) return 'An hour ago'
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours ago`
  if (seconds < 172800) return 'Yesterday'
  return formatNotificationTime(value)
}

export function getNotificationDayLabel(value, now = new Date()) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Earlier'
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((today.getTime() - day.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function groupNotificationsByDay(items) {
  const groups = []
  const indexByLabel = new Map()

  for (const item of items) {
    const label = getNotificationDayLabel(item.createdAt)
    if (!indexByLabel.has(label)) {
      indexByLabel.set(label, groups.length)
      groups.push({ label, items: [] })
    }
    groups[indexByLabel.get(label)].items.push(item)
  }

  return groups
}
