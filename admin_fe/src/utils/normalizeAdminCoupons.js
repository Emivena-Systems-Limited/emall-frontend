import { COUPON_PAGE_SIZE, getCouponTypeMeta } from '../constants/coupons'
import { formatCount, formatOrderMoney } from './formatters'
import { unwrapApiEnvelope } from './parseApiError'
import { sortLatestFirst } from './sortLatestFirst'

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

function pickNumber(source, keys, fallback = 0) {
  for (const key of keys) {
    const raw = source?.[key]
    if (raw == null || raw === '' || Array.isArray(raw) || isRecord(raw)) continue
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return fallback
}

function pickOptionalNumber(source, keys) {
  for (const key of keys) {
    const raw = source?.[key]
    if (raw == null || raw === '' || Array.isArray(raw) || isRecord(raw)) continue
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return null
}

function isTruthyFlag(value) {
  if (value === true || value === 1 || value === '1') return true
  if (value === false || value === 0 || value === '0') return false
  const text = String(value ?? '').trim().toLowerCase()
  if (['true', 'yes', 'on', 'active', 'live', 'enabled'].includes(text)) return true
  if (['false', 'no', 'off', 'inactive', 'paused', 'disabled'].includes(text)) return false
  return Boolean(value)
}

export function normalizeCouponType(raw) {
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['fixed', 'flat', 'amount', 'fixed_amount', 'value'].includes(value)) return 'fixed'
  return 'percentage'
}

export function toApiCouponType(type) {
  return normalizeCouponType(type) === 'fixed' ? 'fixed' : 'percentage'
}

export function normalizeCouponStatus(raw, isActive) {
  if (isActive != null) return isTruthyFlag(isActive) ? 'live' : 'paused'
  const value = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (['paused', 'inactive', 'disabled', 'off', 'stopped'].includes(value)) return 'paused'
  if (['live', 'active', 'enabled', 'on'].includes(value)) return 'live'
  return 'paused'
}

function isPaginator(value) {
  return isRecord(value) && Array.isArray(value.data) && ('current_page' in value || 'last_page' in value)
}

export function extractCouponList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.coupons)) return payload.coupons
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export function extractCouponPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractCouponList(body)
  const source = isRecord(payload) && !Array.isArray(payload)
    ? (isRecord(payload.meta) ? { ...payload, ...payload.meta } : payload)
    : {}

  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? COUPON_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : COUPON_PAGE_SIZE
  const total = Number(source.total ?? list.length)
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : list.length
  const inferredLastPage = Math.max(1, Math.ceil((safeTotal || 1) / safePerPage))
  const lastPage = Number(source.last_page ?? source.lastPage ?? inferredLastPage)
  const inferredFrom = list.length ? (safePage - 1) * safePerPage + 1 : 0
  const inferredTo = list.length ? inferredFrom + list.length - 1 : 0

  return {
    page: safePage,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    perPage: safePerPage,
    total: Number.isFinite(safeTotal) ? safeTotal : 0,
    from: Number.isFinite(Number(source.from)) && Number(source.from) > 0 ? Number(source.from) : inferredFrom,
    to: Number.isFinite(Number(source.to)) && Number(source.to) > 0 ? Number(source.to) : inferredTo,
  }
}

function unwrapCouponRecord(record) {
  if (Array.isArray(record)) return unwrapCouponRecord(record[0])
  if (!isRecord(record)) return null
  if (isPaginator(record)) return null
  if (isRecord(record.coupon) && (record.coupon.id || record.coupon.code)) {
    return unwrapCouponRecord(record.coupon)
  }
  if (Array.isArray(record.data)) return unwrapCouponRecord(record.data)
  if (isRecord(record.data) && (record.data.id || record.data.code)) {
    return unwrapCouponRecord(record.data)
  }
  return record
}

export function extractCouponRecord(body, couponId) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const record = unwrapCouponRecord(payload)
    ?? unwrapCouponRecord(payload?.coupon)
    ?? extractCouponList(body).find((item) => String(item?.id) === String(couponId))
    ?? null

  if (!record) return null
  if (couponId && record.id && String(record.id) !== String(couponId)) {
    const match = extractCouponList(body).find((item) => String(item?.id) === String(couponId))
    return match ?? record
  }
  return record
}

function resolveVendor(source) {
  const nested = isRecord(source.vendor)
    ? source.vendor
    : (isRecord(source.store) ? source.store : {})
  return {
    vendorId: firstText(source.vendor_id, nested.id, nested.vendor_id),
    vendorName: firstText(
      nested.store_name,
      nested.trading_name,
      nested.business_name,
      nested.shop_name,
      nested.name,
      source.vendor_name,
      source.store_name,
      source.store,
    ) || 'Store',
  }
}

export function formatCouponOffer(coupon) {
  const value = Number(coupon?.value)
  if (!Number.isFinite(value)) return '—'
  if (coupon?.type === 'fixed') return `${formatOrderMoney(value)} off`
  return `${formatCount(value)}% off`
}

export function formatCouponUsage(coupon) {
  const used = Number(coupon?.usedCount) || 0
  if (coupon?.usageLimit == null) {
    return used > 0 ? `${formatCount(used)} checkouts so far` : 'No overall cap'
  }
  return `${formatCount(used)} of ${formatCount(coupon.usageLimit)} checkouts`
}

export function formatCouponRedemptionSummary(usageLimit, perUserLimit) {
  const total = Number(usageLimit)
  const each = Number(perUserLimit)
  const hasTotal = usageLimit !== '' && usageLimit != null && Number.isFinite(total)
  const hasEach = perUserLimit !== '' && perUserLimit != null && Number.isFinite(each)
  const totalPart = hasTotal
    ? `${formatCount(total)} checkout${total === 1 ? '' : 's'} across all shoppers`
    : 'unlimited checkouts across all shoppers'
  const eachPart = hasEach
    ? `${formatCount(each)} time${each === 1 ? '' : 's'} for the same shopper`
    : 'no per-shopper cap'
  return `${totalPart}. ${eachPart}.`
}

export function normalizeAdminCoupon(record, context = {}) {
  const source = unwrapCouponRecord(record)
  if (!isRecord(source)) return null

  const id = firstText(source.id, source.uuid, context.couponId)
  const code = firstText(source.code, source.coupon_code).toUpperCase()
  if (!id && !code) return null

  const type = normalizeCouponType(source.type ?? source.discount_type ?? source.offer_type)
  const status = normalizeCouponStatus(
    source.status,
    source.is_active ?? source.active ?? source.enabled,
  )
  const vendor = resolveVendor(source)
  const usedCount = pickNumber(source, [
    'used_count',
    'usages_count',
    'usage_count',
    'times_used',
    'redemptions_count',
    'uses',
  ])
  const usageLimit = pickOptionalNumber(source, ['usage_limit', 'max_uses', 'limit', 'total_usage_limit'])
  const perUserLimit = pickOptionalNumber(source, ['per_user_limit', 'user_limit', 'per_customer_limit'])
  const maximumDiscount = pickOptionalNumber(source, ['maximum_discount', 'max_discount', 'discount_cap'])
  const stackablePresent = ['is_stackable', 'stackable', 'can_stack'].some((key) => (
    Object.prototype.hasOwnProperty.call(source, key)
  ))

  return {
    id: id || code,
    code: code || 'CODE',
    type,
    typeLabel: getCouponTypeMeta(type).label,
    value: pickNumber(source, ['value', 'discount_value', 'amount', 'percent']),
    minimumPurchase: pickOptionalNumber(source, ['minimum_purchase', 'min_purchase', 'min_order', 'minimum_order_amount']),
    maximumDiscount,
    usageLimit,
    perUserLimit,
    usedCount,
    remaining: usageLimit == null ? null : Math.max(0, usageLimit - usedCount),
    stackable: stackablePresent
      ? isTruthyFlag(source.is_stackable ?? source.stackable ?? source.can_stack)
      : false,
    description: firstText(source.description, source.note, source.title),
    status,
    isActive: status === 'live',
    vendorId: vendor.vendorId,
    vendorName: vendor.vendorName,
    startsAt: firstText(source.starts_at, source.start_date, source.valid_from) || null,
    expiresAt: firstText(source.expires_at, source.end_date, source.valid_to) || null,
    createdAt: firstText(source.created_at, source.createdAt) || null,
    updatedAt: firstText(source.updated_at, source.updatedAt) || null,
  }
}

export function normalizeAdminCoupons(body) {
  return sortLatestFirst(
    extractCouponList(body).map((record) => normalizeAdminCoupon(record)).filter(Boolean),
    ['createdAt', 'id'],
  )
}

export function normalizeAdminCouponDetail(body, couponId) {
  return normalizeAdminCoupon(extractCouponRecord(body, couponId), { couponId })
}

function extractNamedList(source, keys) {
  for (const key of keys) {
    if (Array.isArray(source?.[key])) return source[key]
  }
  return []
}

function normalizeUsageRow(record, index) {
  if (!isRecord(record)) return null
  const coupon = isRecord(record.coupon) ? record.coupon : {}
  const shopper = isRecord(record.user) || isRecord(record.customer) || isRecord(record.shopper)
    ? (record.user || record.customer || record.shopper)
    : {}
  const id = firstText(record.id, record.usage_id, `${coupon.code || 'use'}-${index}`)
  const code = firstText(record.code, coupon.code, record.coupon_code).toUpperCase()
  const shopperName = firstText(
    shopper.full_name,
    [shopper.first_name, shopper.last_name].filter(Boolean).join(' '),
    shopper.name,
    shopper.email,
    record.user_name,
    record.customer_name,
  ) || 'Shopper'

  return {
    id,
    code: code || 'CODE',
    shopperName,
    discount: pickNumber(record, ['discount', 'discount_amount', 'amount', 'saved', 'value']),
    usedAt: firstText(record.created_at, record.used_at, record.redeemed_at, record.applied_at) || null,
  }
}

function normalizeTopCoupon(record, index) {
  if (!isRecord(record) && typeof record !== 'string') return null
  if (!isRecord(record)) {
    return { id: String(index), code: String(record).toUpperCase(), uses: 0, discount: 0 }
  }
  const code = firstText(record.code, record.coupon_code, record.name).toUpperCase()
  return {
    id: firstText(record.id, code, String(index)),
    code: code || 'CODE',
    uses: pickNumber(record, ['uses', 'used_count', 'redemptions', 'count', 'usage_count']),
    discount: pickNumber(record, ['discount', 'discount_amount', 'total_discount', 'saved', 'amount']),
  }
}

function normalizeTypeSlice(record) {
  if (!isRecord(record)) return null
  const type = normalizeCouponType(record.type ?? record.key ?? record.name)
  return {
    type,
    label: getCouponTypeMeta(type).label,
    count: pickNumber(record, ['count', 'coupons', 'total']),
    uses: pickNumber(record, ['uses', 'redemptions', 'usage_count']),
    discount: pickNumber(record, ['discount', 'discount_amount', 'saved']),
  }
}

export function normalizeCouponUsage(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const source = isRecord(payload) ? payload : {}
  const nested = isRecord(source.totals)
    ? source.totals
    : (isRecord(source.stats) ? source.stats : (isRecord(source.summary) ? source.summary : source))

  const recentSource = Array.isArray(payload)
    ? payload
    : (Array.isArray(source.data)
      ? source.data
      : extractNamedList(source, ['recent', 'usages', 'redemptions', 'history', 'items']))

  const top = extractNamedList(source, ['top', 'top_coupons', 'best_performing', 'leaders'])
    .map(normalizeTopCoupon)
    .filter(Boolean)
  const byType = extractNamedList(source, ['by_type', 'types', 'type_breakdown', 'mix'])
    .map(normalizeTypeSlice)
    .filter(Boolean)
  const recent = sortLatestFirst(
    (Array.isArray(recentSource) ? recentSource : [])
      .map(normalizeUsageRow)
      .filter(Boolean),
    ['usedAt', 'id'],
  )

  const pagination = isPaginator(source) || (isRecord(source.meta) && ('current_page' in source || 'current_page' in (source.meta ?? {})))
    ? extractCouponPagination(body)
    : {
      page: 1,
      lastPage: 1,
      perPage: Math.max(recent.length, 1),
      total: recent.length,
      from: recent.length ? 1 : 0,
      to: recent.length,
    }

  return {
    totals: {
      coupons: pickNumber(nested, ['total_coupons', 'coupons', 'coupon_count', 'codes']),
      live: pickNumber(nested, ['active_coupons', 'live_coupons', 'active', 'live']),
      redemptions: pickNumber(nested, ['total_redemptions', 'redemptions', 'total_usage', 'uses', 'usage_count']),
      discount: pickNumber(nested, ['total_discount', 'discount', 'discount_amount', 'saved', 'savings']),
      shoppers: pickNumber(nested, ['unique_users', 'unique_shoppers', 'shoppers', 'customers']),
    },
    byType,
    top: top.length > 0 ? top : recent.reduce((list, row) => {
      const existing = list.find((item) => item.code === row.code)
      if (existing) {
        existing.uses += 1
        existing.discount += row.discount
        return list
      }
      list.push({ id: row.code, code: row.code, uses: 1, discount: row.discount })
      return list
    }, []).sort((left, right) => right.uses - left.uses).slice(0, 8),
    recent,
    pagination,
  }
}

export function parseCouponDate(value) {
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

export function formatCouponDate(value) {
  const date = parseCouponDate(value)
  if (!date) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCouponDateTime(value) {
  const date = parseCouponDate(value)
  if (!date) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function emptyCouponPagination() {
  return {
    page: 1,
    lastPage: 1,
    total: 0,
    perPage: COUPON_PAGE_SIZE,
    from: 0,
    to: 0,
  }
}

export function couponToFormValues(coupon) {
  return {
    vendorId: coupon?.vendorId ?? '',
    vendorName: coupon?.vendorName ?? '',
    code: coupon?.code ?? '',
    type: coupon?.type === 'fixed' ? 'fixed' : 'percentage',
    value: coupon?.value ?? '',
    minimumPurchase: coupon?.minimumPurchase ?? '',
    maximumDiscount: coupon?.maximumDiscount ?? '',
    usageLimit: coupon?.usageLimit ?? '',
    perUserLimit: coupon?.perUserLimit ?? '',
    stackable: Boolean(coupon?.stackable),
    description: coupon?.description ?? '',
  }
}
