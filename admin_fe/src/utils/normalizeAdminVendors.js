import { GHANA_REGIONS } from '../constants/adminDashboardData'
import { composeFullName } from './profileUtils'
import { unwrapApiEnvelope } from './parseApiError'

const ULID_CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

const UI_TO_API_STATUS = {
  approved: 'approved',
  pending: 'pending_approval',
  rejected: 'rejected',
  suspended: 'suspended',
}

const API_LIST_STATUSES = ['approved', 'pending', 'pending_approval', 'rejected', 'suspended']

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function firstText(...values) {
  for (const value of values) {
    const text = String(value ?? '').trim()
    if (text) return text
  }
  return ''
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toNullableNumber(value) {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function firstAddress(value) {
  if (Array.isArray(value)) return isRecord(value[0]) ? value[0] : {}
  return isRecord(value) ? value : {}
}

export function canonicalizeGhanaRegion(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return ''
  const match = GHANA_REGIONS.find((region) => region.toLowerCase() === value.toLowerCase())
  if (match) return match
  return titleCasePlace(value)
}

function titleCasePlace(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/\b([a-z])/g, (letter) => letter.toUpperCase())
}

function timestampFromUlid(id) {
  const stamp = String(id ?? '').slice(0, 10).toUpperCase()
  if (stamp.length < 10) return null

  let time = 0
  for (const char of stamp) {
    const value = ULID_CROCKFORD.indexOf(char)
    if (value < 0) return null
    time = time * 32 + value
  }

  const date = new Date(time)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function normalizeVendorStatus(raw) {
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['approved', 'active', 'live', 'verified'].includes(value)) return 'approved'
  if (['pending', 'pending_review', 'pending_approval', 'unverified', 'submitted'].includes(value)) return 'pending'
  if (['rejected', 'declined', 'denied'].includes(value)) return 'rejected'
  if (['suspended', 'banned', 'blocked', 'paused'].includes(value)) return 'suspended'
  return value || 'pending'
}

export function toApiVendorStatus(status) {
  const normalized = normalizeVendorStatus(status)
  return UI_TO_API_STATUS[normalized] ?? normalized
}

export function toListStatusParam(status) {
  const value = String(status ?? '').trim()
  if (!value) return ''
  const apiStatus = toApiVendorStatus(value)
  return API_LIST_STATUSES.includes(apiStatus) ? apiStatus : ''
}

export function isPendingVendorQueue(status) {
  const value = String(status ?? '').trim()
  if (!value) return false
  return toApiVendorStatus(value) === 'pending_approval'
}

export function extractVendorList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.vendors)) return payload.vendors
  if (Array.isArray(payload?.items)) return payload.items

  if (isRecord(payload)) {
    const values = Object.values(payload)
    if (values.length > 0 && values.every((item) => isRecord(item) && (item.id || item.email || item.store_name || item.business_name))) {
      return values
    }
  }

  return []
}

function unwrapVendorRecord(record) {
  if (Array.isArray(record)) return unwrapVendorRecord(record[0])
  if (!isRecord(record)) return null
  if (isRecord(record.vendor)) return unwrapVendorRecord(record.vendor)
  if (Array.isArray(record.data)) return unwrapVendorRecord(record.data)
  if (
    isRecord(record.data)
    && (record.data.id || record.data.store_name || record.data.business_name || record.data.email)
  ) {
    return unwrapVendorRecord(record.data)
  }
  return record
}

export function extractVendorRecord(body, vendorId) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const wanted = vendorId == null ? '' : String(vendorId)

  if (Array.isArray(payload)) {
    return payload.find((item) => String(item?.id) === wanted) ?? payload[0] ?? null
  }

  if (Array.isArray(payload?.data)) {
    return payload.data.find((item) => String(item?.id) === wanted) ?? payload.data[0] ?? null
  }

  if (Array.isArray(payload?.vendors)) {
    return payload.vendors.find((item) => String(item?.id) === wanted) ?? payload.vendors[0] ?? null
  }

  return payload
}

function normalizeDocuments(value, address = {}) {
  const list = Array.isArray(value)
    ? value
    : Array.isArray(value?.data)
      ? value.data
      : []

  const documents = list.map((item, index) => {
    if (!isRecord(item) && typeof item !== 'string') return null
    if (typeof item === 'string') {
      const url = item.trim()
      if (!url) return null
      return { id: `doc-${index}`, name: 'Document', url, type: '' }
    }

    const url = firstText(item.file_url, item.url, item.path, item.file, item.document_url)
    const name = firstText(item.name, item.title, item.document_type, item.type, item.file_name, 'Document')
    if (!url && !name) return null
    return {
      id: String(item.id ?? `doc-${index}`),
      name,
      url,
      type: firstText(item.document_type, item.type),
    }
  }).filter(Boolean)

  const certificate = firstText(address.registration_certificate)
  if (certificate && !documents.some((item) => item.url === certificate)) {
    documents.push({
      id: 'registration-certificate',
      name: 'Registration certificate',
      url: certificate,
      type: 'registration_certificate',
    })
  }

  return documents
}

function deriveKyc(nested, address) {
  const explicit = firstText(nested.kyc_status, nested.kyc, nested.verification_status).toLowerCase()
  if (explicit) return explicit
  const hasBusinessDocs = Boolean(
    firstText(address.business_registration_number, address.tin_number, address.registration_certificate),
  )
  return hasBusinessDocs ? 'verified' : 'pending'
}

export function normalizeAdminVendor(record) {
  const nested = unwrapVendorRecord(record)
  if (!isRecord(nested)) return null

  const address = firstAddress(nested.addresses ?? nested.address)
  const firstName = firstText(nested.first_name, nested.firstName)
  const lastName = firstText(nested.last_name, nested.lastName)
  const owner = firstText(
    nested.admin_full_name,
    nested.owner_name,
    nested.owner,
    composeFullName(firstName, lastName),
    nested.full_name,
    nested.name,
  )
  const status = normalizeVendorStatus(nested.status)
  const region = canonicalizeGhanaRegion(
    firstText(address.region, nested.region, nested.region_name, nested.state),
  )
  const city = titleCasePlace(firstText(address.city_or_town, nested.city, nested.city_or_town))
  const joinedAt = nested.joined_at
    ?? nested.created_at
    ?? nested.registered_at
    ?? nested.joinedAt
    ?? timestampFromUlid(nested.id)
    ?? nested.email_verified_at
    ?? null
  const countryRaw = firstText(address.country, nested.country)
  const country = /^ghn?ana$/i.test(countryRaw) ? 'Ghana' : countryRaw
  const rating = toNullableNumber(nested.average_rating ?? nested.rating)
  const sales30d = nested.sales30d ?? nested.sales_30d ?? nested.thirty_day_sales ?? nested.revenue
  const orders30d = nested.orders30d ?? nested.orders_30d ?? nested.thirty_day_orders

  return {
    id: String(nested.id ?? nested.vendor_id ?? ''),
    store: firstText(nested.store_name, nested.trading_name, nested.business_name, nested.shop_name, 'Untitled store'),
    businessName: firstText(nested.business_name),
    tradingName: firstText(nested.trading_name),
    owner: owner || '—',
    email: firstText(nested.email, nested.owner_email),
    phone: firstText(nested.phone_number, nested.phone, nested.mobile),
    region: region || '—',
    city: city || '—',
    country: country || '—',
    street: firstText(address.street_name, address.address),
    landmark: firstText(address.landmark),
    gpsAddress: firstText(address.gps_address),
    fullAddress: firstText(address.address),
    businessRegistrationNumber: firstText(address.business_registration_number),
    tinNumber: firstText(address.tin_number),
    status,
    apiStatus: firstText(nested.status) || toApiVendorStatus(status),
    kyc: deriveKyc(nested, address),
    listings: toNumber(nested.products_count ?? nested.listings ?? nested.product_count),
    reviewsCount: toNumber(nested.reviews_count),
    starCounts: {
      five: toNumber(nested.five_star_count),
      four: toNumber(nested.four_star_count),
      three: toNumber(nested.three_star_count),
      two: toNumber(nested.two_star_count),
      one: toNumber(nested.one_star_count),
    },
    sales30d: sales30d == null || sales30d === '' ? null : toNumber(sales30d),
    orders30d: orders30d == null || orders30d === '' ? null : toNumber(orders30d),
    rating,
    joinedAt,
    lastLoginAt: nested.last_login_at ?? null,
    emailVerifiedAt: nested.email_verified_at ?? null,
    phoneVerifiedAt: nested.phone_verified_at ?? null,
    category: firstText(nested.category, nested.business_category, nested.industry),
    payoutHold: Boolean(nested.payout_hold ?? nested.payoutHold),
    note: firstText(nested.note, nested.admin_note, nested.rejection_reason, nested.reason),
    rejectionReason: firstText(nested.rejection_reason, nested.reason, nested.admin_note),
    documents: normalizeDocuments(nested.documents ?? nested.vendor_documents, address),
  }
}

export function normalizeAdminVendors(body) {
  return extractVendorList(body)
    .map(normalizeAdminVendor)
    .filter((vendor) => vendor?.id)
}
