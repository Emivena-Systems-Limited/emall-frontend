import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PAGE_SIZE,
  NOTIFICATION_STATUSES,
} from '../constants/notifications'
import { NOTIFICATION_TYPES } from '../constants/notificationsData'
import { unwrapApiEnvelope } from './parseApiError'

const CATEGORY_VALUES = new Set(Object.values(NOTIFICATION_CATEGORIES))
const STATUS_VALUES = new Set(Object.values(NOTIFICATION_STATUSES))

const CATEGORY_FALLBACK_TYPE = {
  [NOTIFICATION_CATEGORIES.orders]: 'new_order',
  [NOTIFICATION_CATEGORIES.products]: 'product_update',
  [NOTIFICATION_CATEGORIES.customers]: 'customer_message',
  [NOTIFICATION_CATEGORIES.payouts]: 'payout_processed',
  [NOTIFICATION_CATEGORIES.promotions]: 'promotion_status',
  [NOTIFICATION_CATEGORIES.platform]: 'platform_update',
}

function firstValue(...values) {
  return values.find((value) => {
    if (value === undefined || value === null || typeof value === 'object') return false
    return String(value).trim() !== ''
  }) ?? ''
}

function readFiniteNumber(source, keys) {
  if (!source || typeof source !== 'object') return null

  for (const key of keys) {
    if (source[key] == null || source[key] === '') continue
    const value = Number(source[key])
    if (Number.isFinite(value)) return value
  }

  return null
}

function resolveType(record) {
  const type = String(firstValue(record.type, record.notification_type)).trim()
  if (type && NOTIFICATION_TYPES[type]) return type

  const category = String(firstValue(record.category)).trim()
  return CATEGORY_FALLBACK_TYPE[category] ?? 'platform_update'
}

function resolveRead(record) {
  if (typeof record.read === 'boolean') return record.read
  if (typeof record.is_read === 'boolean') return record.is_read
  if (typeof record.isRead === 'boolean') return record.isRead

  const status = String(firstValue(record.status, record.read_status)).trim().toLowerCase()
  if (status === NOTIFICATION_STATUSES.read) return true
  if (status === NOTIFICATION_STATUSES.unread) return false
  if (firstValue(record.read_at, record.readAt)) return true

  return false
}

export function normalizeNotificationListFilters(filters = {}) {
  const category = CATEGORY_VALUES.has(filters.category)
    ? filters.category
    : NOTIFICATION_CATEGORIES.all
  const status = STATUS_VALUES.has(filters.status)
    ? filters.status
    : NOTIFICATION_STATUSES.all

  return {
    category,
    status,
    perPage: NOTIFICATION_PAGE_SIZE,
  }
}

export function buildNotificationsQueryParams({
  category = NOTIFICATION_CATEGORIES.all,
  status = NOTIFICATION_STATUSES.all,
  page = 1,
  perPage = NOTIFICATION_PAGE_SIZE,
} = {}) {
  const filters = normalizeNotificationListFilters({ category, status, perPage })

  return {
    page: Math.max(1, Number(page) || 1),
    per_page: filters.perPage,
    category: filters.category,
    status: filters.status,
  }
}

export function normalizeNotificationRecord(record) {
  if (!record || typeof record !== 'object') return null

  const id = firstValue(record.id, record.notification_id, record.notificationId)
  if (!id) return null

  const type = resolveType(record)
  const category = firstValue(record.category) || NOTIFICATION_TYPES[type]?.category || NOTIFICATION_CATEGORIES.platform

  return {
    id: String(id),
    type,
    category,
    title: String(firstValue(record.title, record.subject, record.name) || NOTIFICATION_TYPES[type]?.label || 'Notification'),
    message: String(firstValue(record.message, record.body, record.description, record.content, record.text)),
    dateTime: String(firstValue(
      record.date_time,
      record.dateTime,
      record.created_at,
      record.createdAt,
      record.notified_at,
      record.sent_at,
    )),
    read: resolveRead(record),
    link: String(firstValue(
      record.link,
      record.url,
      record.action_url,
      record.actionUrl,
      record.cta_url,
      record.redirect_url,
      record.path,
    )) || null,
  }
}

export function extractNotificationList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.notifications)) return payload.notifications
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.results)) return payload.results

  return []
}

function readCategoryCount(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (!value || typeof value !== 'object') return null

  const parsed = Number(value.total ?? value.count ?? value.all)
  return Number.isFinite(parsed) ? parsed : null
}

export function extractNotificationCategoryCounts(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body
  const sources = [
    payload?.category_counts,
    payload?.categoryCounts,
    payload?.counts,
    payload?.categories,
    payload?.meta?.category_counts,
    payload?.pagination?.category_counts,
    envelope?.category_counts,
    envelope?.meta?.category_counts,
  ]

  const source = sources.find((value) => value && typeof value === 'object' && !Array.isArray(value))
  if (!source) return null

  const counts = {}
  let found = false

  Object.values(NOTIFICATION_CATEGORIES).forEach((key) => {
    const value = readCategoryCount(source[key])
    if (value == null) return
    counts[key] = value
    found = true
  })

  return found ? counts : null
}

export function extractNotificationUnreadCount(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body
  const keys = ['unread_count', 'unreadCount']
  const sources = [payload, payload?.meta, payload?.pagination, envelope, envelope?.meta]

  for (const source of sources) {
    const value = readFiniteNumber(source, keys)
    if (value != null) return value
  }

  return null
}

export function extractNotificationsPagination(body, fallbackCount = 0, request = {}) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body
  const requestedPage = Number(request.page) || 1
  const requestedPerPage = Number(request.perPage) || NOTIFICATION_PAGE_SIZE

  const metaCandidate = [
    !Array.isArray(payload) ? payload?.pagination : null,
    !Array.isArray(payload) ? payload?.meta : null,
    envelope?.pagination,
    envelope?.meta,
    !Array.isArray(payload) ? payload : null,
  ].find((value) => (
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && ['total', 'current_page', 'last_page', 'per_page', 'total_pages', 'totalPages'].some((key) => key in value)
  ))

  if (metaCandidate) {
    const page = Number(metaCandidate.page ?? metaCandidate.current_page ?? requestedPage)
    const perPage = Number(metaCandidate.per_page ?? metaCandidate.perPage ?? requestedPerPage)
    const total = Number(metaCandidate.total ?? fallbackCount)
    const totalPages = Number(
      metaCandidate.total_pages ?? metaCandidate.totalPages ?? metaCandidate.last_page ?? 1,
    )

    return {
      page: Number.isFinite(page) ? page : requestedPage,
      perPage: Number.isFinite(perPage) ? perPage : requestedPerPage,
      total: Number.isFinite(total) ? total : 0,
      totalPages: Number.isFinite(totalPages) ? Math.max(1, totalPages) : 1,
    }
  }

  const count = fallbackCount
  const isLastPage = count < requestedPerPage
  const total = Math.max(0, (requestedPage - 1) * requestedPerPage + count)

  return {
    page: requestedPage,
    perPage: requestedPerPage,
    total,
    totalPages: Math.max(1, isLastPage ? requestedPage : requestedPage + 1),
  }
}

export function normalizeNotificationsPage(body, request = {}) {
  const items = extractNotificationList(body).map(normalizeNotificationRecord).filter(Boolean)
  const pagination = extractNotificationsPagination(body, items.length, request)

  return {
    items,
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
    unreadCount: extractNotificationUnreadCount(body),
    categoryCounts: extractNotificationCategoryCounts(body),
  }
}

export function notificationCategoryBody(category) {
  const value = String(category ?? '').trim()
  if (!CATEGORY_VALUES.has(value) || value === NOTIFICATION_CATEGORIES.all) return undefined
  return { category: value }
}

export function normalizeUnreadCount(body) {
  if (typeof body === 'number' && Number.isFinite(body)) return Math.max(0, body)

  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body
  if (typeof payload === 'number' && Number.isFinite(payload)) return Math.max(0, payload)

  const value = readFiniteNumber(payload, ['unread_count', 'unreadCount', 'count', 'total'])
    ?? readFiniteNumber(envelope, ['unread_count', 'unreadCount', 'count'])
    ?? readFiniteNumber(payload?.meta, ['unread_count', 'unreadCount', 'count'])

  return value == null ? 0 : Math.max(0, value)
}

function cloneDefaultPreferences() {
  return Object.fromEntries(
    Object.entries(DEFAULT_NOTIFICATION_PREFERENCES).map(([key, value]) => [key, { ...value }]),
  )
}

function readFlag(value, fallback) {
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1' || value === 'true') return true
  if (value === 0 || value === '0' || value === 'false') return false
  return fallback
}

export function normalizeNotificationPreferences(body, { fallbackToDefaults = false } = {}) {
  const source = preferenceSource(body)

  const categories = Object.keys(DEFAULT_NOTIFICATION_PREFERENCES)
  const hasCategory = source
    && typeof source === 'object'
    && !Array.isArray(source)
    && categories.some((key) => source[key] && typeof source[key] === 'object')

  if (!hasCategory) return fallbackToDefaults ? cloneDefaultPreferences() : null

  const next = cloneDefaultPreferences()
  categories.forEach((category) => {
    const row = source[category]
    if (!row || typeof row !== 'object') return
    next[category] = {
      inApp: readFlag(row.in_app ?? row.inApp, next[category].inApp),
      email: readFlag(row.email, next[category].email),
    }
  })

  return next
}

export function buildPreferencePatch(category, channel, value) {
  const apiChannel = channel === 'inApp' ? 'in_app' : 'email'
  return {
    [category]: {
      [apiChannel]: Boolean(value),
    },
  }
}

function preferenceSource(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body
  if (payload?.preferences && typeof payload.preferences === 'object' && !Array.isArray(payload.preferences)) {
    return payload.preferences
  }
  return payload
}

export function readPreferencePatch(body) {
  const source = preferenceSource(body)
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null

  const patch = {}
  let found = false

  Object.keys(DEFAULT_NOTIFICATION_PREFERENCES).forEach((category) => {
    const row = source[category]
    if (!row || typeof row !== 'object') return

    const channels = {}
    if ('in_app' in row || 'inApp' in row) {
      channels.inApp = readFlag(row.in_app ?? row.inApp, false)
    }
    if ('email' in row) channels.email = readFlag(row.email, false)
    if (Object.keys(channels).length === 0) return

    patch[category] = channels
    found = true
  })

  return found ? patch : null
}
