import { USER_API_STATUS, USER_PAGE_SIZE, getUserKindLabel } from '../constants/adminUsers'
import { unwrapApiEnvelope } from './parseApiError'
import { composeFullName } from './profileUtils'
import { resolveBackendMediaUrl } from './resolveBackendMediaUrl'
import { sortLatestFirst } from './sortLatestFirst'

const AVATAR_TONES = [
  'bg-rose-50 text-rose-700 ring-rose-100',
  'bg-sky-50 text-sky-800 ring-sky-100',
  'bg-violet-50 text-violet-800 ring-violet-100',
  'bg-emerald-50 text-emerald-800 ring-emerald-100',
  'bg-amber-50 text-amber-800 ring-amber-100',
  'bg-teal-50 text-teal-800 ring-teal-100',
]

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function firstText(...values) {
  for (const value of values) {
    if (value == null || isRecord(value) || Array.isArray(value)) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

function titleCaseName(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function optionalTimestamp(source, keys) {
  const present = keys.some((key) => Object.prototype.hasOwnProperty.call(source, key))
  if (!present) return undefined
  for (const key of keys) {
    const value = source[key]
    if (value) return value
  }
  return null
}

function omitSecrets(record) {
  if (!isRecord(record)) return record
  const next = { ...record }
  delete next.application_token
  delete next.applicationToken
  delete next.token
  return next
}

function pickNumber(source, keys) {
  for (const key of keys) {
    const raw = source?.[key]
    if (raw == null || Array.isArray(raw) || isRecord(raw)) continue
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return 0
}

export function normalizeUserStatus(raw) {
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['verified', 'active', 'approved', 'live'].includes(value)) return 'verified'
  if (['pending', 'unverified', 'not_verified', 'pending_review', 'pending_approval', 'submitted'].includes(value)) {
    return 'pending'
  }
  if (['rejected', 'declined', 'denied'].includes(value)) return 'rejected'
  if (['suspended', 'banned', 'blocked', 'paused'].includes(value)) return 'suspended'
  return value || 'pending'
}

export function toApiUserStatus(status) {
  const value = String(status ?? '').trim()
  if (!value) return ''
  const normalized = normalizeUserStatus(value)
  return USER_API_STATUS[normalized] ?? ''
}

export function normalizeAccountKind(raw) {
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['vendor', 'seller', 'merchant', 'store'].includes(value)) return 'store'
  if (['admin', 'operator', 'staff'].includes(value)) return 'operator'
  return 'shopper'
}

export function extractUserList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.users)) return payload.users
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.results)) return payload.results

  if (isRecord(payload?.user) && Array.isArray(payload.user.data)) return payload.user.data

  return []
}

export function extractUserPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractUserList(body)
  const source = isRecord(payload) && !Array.isArray(payload)
    ? (isRecord(payload.meta) ? { ...payload, ...payload.meta } : payload)
    : {}

  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? USER_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : USER_PAGE_SIZE
  const total = Number(source.total ?? list.length)
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : list.length
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
    total: Number.isFinite(safeTotal) ? safeTotal : 0,
    from: Number.isFinite(from) && from > 0 ? from : inferredFrom,
    to: Number.isFinite(to) && to > 0 ? to : inferredTo,
  }
}

function isPaginator(value) {
  return isRecord(value) && Array.isArray(value.data) && ('current_page' in value || 'last_page' in value)
}

function unwrapUserRecord(record) {
  if (Array.isArray(record)) return unwrapUserRecord(record[0])
  if (!isRecord(record)) return null
  if (isPaginator(record)) return null
  if (isRecord(record.user) && (record.user.id || record.user.email)) return unwrapUserRecord(record.user)
  if (Array.isArray(record.data)) return unwrapUserRecord(record.data)
  if (isRecord(record.data) && (record.data.id || record.data.email || record.data.first_name)) {
    return unwrapUserRecord(record.data)
  }
  return record
}

export function extractUserRecord(body, userId) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const record = unwrapUserRecord(payload)
    ?? unwrapUserRecord(payload?.user)
    ?? extractUserList(body).find((item) => String(item?.id) === String(userId))
    ?? null

  if (!record) return null
  if (userId && record.id && String(record.id) !== String(userId)) {
    const match = extractUserList(body).find((item) => String(item?.id) === String(userId))
    return match ?? record
  }
  return record
}

export function extractUserCounts(body, record = {}) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const nested = isRecord(payload)
    ? (isRecord(payload.counts) ? payload.counts
      : (isRecord(payload.stats) ? payload.stats
        : (isRecord(payload.meta) ? payload.meta : {})))
    : {}
  const fromRecord = isRecord(record?.counts) ? record.counts : record
  const source = { ...nested, ...fromRecord }

  return {
    orders: pickNumber(source, ['orders_count', 'order_count', 'total_orders']),
    addresses: pickNumber(source, ['addresses_count', 'address_count', 'total_addresses']),
    spent: pickNumber(source, ['total_spent', 'spent', 'lifetime_value', 'gmv', 'total_amount']),
    reviews: pickNumber(source, ['reviews_count', 'review_count']),
    wishlist: pickNumber(source, ['wishlist_items_count', 'wishlist_count', 'saved_items_count']),
  }
}

function resolveAvatar(record) {
  return resolveBackendMediaUrl(firstText(
    record?.avatar_url,
    record?.photo_url,
    record?.profile_photo_url,
    record?.image_url,
    record?.avatar,
    record?.photo,
    record?.profile_photo,
    record?.image,
  ))
}

export function normalizeAdminUser(record, context = {}) {
  const source = unwrapUserRecord(record)
  if (!isRecord(source)) return null

  const id = firstText(source.id, source.uuid, context.userId)
  if (!id) return null

  const firstName = titleCaseName(firstText(source.first_name, source.firstName))
  const lastName = titleCaseName(firstText(source.last_name, source.lastName))
  const name = composeFullName(firstName, lastName)
    || titleCaseName(firstText(source.full_name, source.fullName, source.name))
    || firstText(source.email)
    || 'Shopper'
  const status = normalizeUserStatus(
    source.status
    ?? source.account_status
    ?? source.verification_status
    ?? (source.is_verified === true || source.verified === true ? 'verified' : ''),
  )
  const kind = normalizeAccountKind(source.user_type ?? source.role ?? source.type ?? source.account_type)
  const counts = context.counts ?? extractUserCounts({ data: source }, source)
  const city = titleCaseName(firstText(source.city_or_town, source.city, source.town))
  const district = titleCaseName(firstText(source.district))
  const region = firstText(source.region)
  const locationLabel = [city, region].filter(Boolean).join(', ')

  return {
    id,
    firstName,
    lastName,
    name,
    email: firstText(source.email),
    phone: firstText(source.phone_number, source.phone, source.mobile),
    avatar: resolveAvatar(source),
    status,
    apiStatus: toApiUserStatus(status) || firstText(source.status),
    kind,
    kindLabel: getUserKindLabel(kind),
    city,
    district,
    region,
    locationLabel,
    emailVerifiedAt: optionalTimestamp(source, ['email_verified_at', 'emailVerifiedAt']),
    phoneVerifiedAt: optionalTimestamp(source, ['phone_verified_at', 'phoneVerifiedAt']),
    joinedAt: optionalTimestamp(source, ['created_at', 'joined_at', 'createdAt', 'joinedAt']),
    lastLoginAt: optionalTimestamp(source, ['last_login_at', 'last_seen_at', 'lastLoginAt', 'lastSeenAt']),
    rejectionReason: firstText(
      source.rejection_reason,
      source.rejected_reason,
      source.status_reason,
      source.reason,
      source.note,
    ),
    counts,
    addresses: Array.isArray(source.addresses)
      ? sortLatestFirst(
        source.addresses.map(normalizeAdminUserAddress).filter(Boolean),
        ['createdAt', 'id'],
      )
      : undefined,
    raw: omitSecrets(source),
  }
}

export function normalizeAdminUsers(body) {
  return sortLatestFirst(
    extractUserList(body).map((record) => normalizeAdminUser(record)).filter(Boolean),
    ['joinedAt', 'id'],
  )
}

export function normalizeAdminUserDetail(body, userId) {
  const record = extractUserRecord(body, userId)
  const counts = extractUserCounts(body, record)
  return normalizeAdminUser(record, { userId, counts })
}

function extractAddressList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.addresses)) return payload.addresses
  if (Array.isArray(payload?.shipping)) {
    return [
      ...payload.shipping,
      ...(Array.isArray(payload.billing) ? payload.billing : []),
    ]
  }
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

export function extractAddressPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractAddressList(body)
  const source = isRecord(payload) && !Array.isArray(payload)
    ? (isRecord(payload.meta) ? { ...payload, ...payload.meta } : payload)
    : {}

  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? USER_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : USER_PAGE_SIZE
  const total = Number(source.total ?? list.length)
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : list.length
  const lastPage = Number(source.last_page ?? source.lastPage ?? Math.max(1, Math.ceil((safeTotal || 1) / safePerPage)))
  const from = list.length ? (safePage - 1) * safePerPage + 1 : 0
  const to = list.length ? from + list.length - 1 : 0

  return {
    page: safePage,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    perPage: safePerPage,
    total: Number.isFinite(safeTotal) ? safeTotal : 0,
    from,
    to,
  }
}

function addressKindLabel(type) {
  const value = String(type ?? '').trim().toLowerCase()
  if (value === 'shipping' || value === 'delivery') return 'Delivery'
  if (value === 'billing') return 'Billing'
  if (!value) return 'Address'
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function normalizeAdminUserAddress(record) {
  if (!isRecord(record)) return null

  const id = firstText(record.id, record.address_id)
  const firstName = titleCaseName(firstText(record.first_name, record.firstName))
  const lastName = titleCaseName(firstText(record.last_name, record.lastName))
  const recipient = composeFullName(firstName, lastName)
    || titleCaseName(firstText(record.name, record.full_name, record.company_name))
  const company = titleCaseName(firstText(record.company_name, record.company))
  const line1 = titleCaseName(firstText(record.address_line_1, record.address, record.street_address, record.street))
  const line2 = titleCaseName(firstText(record.address_line_2))
  const landmark = firstText(record.landmark)
  const city = titleCaseName(firstText(record.city_or_town, record.city, record.town))
  const region = firstText(record.region, record.state)
  const country = firstText(record.country) || 'Ghana'
  const gps = firstText(record.gps_address, record.gps)
  const postcode = firstText(record.postal_code, record.postcode, record.zip)
  const place = [line1, line2, landmark, city, region, country].filter(Boolean)

  return {
    id: id || `${recipient}-${line1}`,
    kindLabel: addressKindLabel(record.type ?? record.address_type),
    recipient,
    company: company && company !== recipient ? company : '',
    phone: firstText(record.phone_number, record.phone),
    line1,
    line2,
    landmark,
    city,
    region,
    country,
    gps,
    postcode,
    note: firstText(record.delivery_note, record.note),
    isDefault: Boolean(record.is_default ?? record.isDefault),
    createdAt: firstText(record.created_at, record.createdAt) || null,
    summary: place.join(', ') || 'Address on file',
  }
}

export function normalizeAdminUserAddresses(body) {
  return sortLatestFirst(
    extractAddressList(body).map(normalizeAdminUserAddress).filter(Boolean),
    ['createdAt', 'id'],
  )
}

export function getUserInitials(user) {
  const first = String(user?.firstName || user?.name || '').trim()
  const last = String(user?.lastName || '').trim()
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase()
  const words = String(user?.name || user?.email || 'U').split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  return (words[0]?.[0] || 'U').toUpperCase()
}

export function getUserAvatarTone(id) {
  const seed = String(id ?? '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return AVATAR_TONES[seed % AVATAR_TONES.length]
}

export function parseUserDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const text = String(value).trim()
  if (!text) return null
  const isoish = /T\d/.test(text) ? text : text.replace(' ', 'T')
  const parsed = new Date(isoish)
  if (!Number.isNaN(parsed.getTime())) return parsed
  const fallback = new Date(text)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

export function formatUserDate(value) {
  const date = parseUserDate(value)
  if (!date) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatUserDateTime(value) {
  const date = parseUserDate(value)
  if (!date) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function emptyUserPagination() {
  return {
    page: 1,
    lastPage: 1,
    total: 0,
    perPage: USER_PAGE_SIZE,
    from: 0,
    to: 0,
  }
}
