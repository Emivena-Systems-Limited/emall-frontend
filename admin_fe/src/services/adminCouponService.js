import apiClient from '../lib/apiClient'
import { COUPON_ADMIN_ENDPOINTS, COUPON_PAGE_SIZE } from '../constants/coupons'
import { assertAuthEnvelope } from '../utils/parseApiError'
import { toCouponActiveParam } from '../utils/couponFilters'
import {
  extractCouponPagination,
  normalizeAdminCoupon,
  normalizeAdminCouponDetail,
  normalizeAdminCoupons,
  normalizeCouponUsage,
  toApiCouponType,
} from '../utils/normalizeAdminCoupons'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

function optionalAmount(value) {
  if (value === '' || value == null) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function toCouponWritePayload(values, { includeVendor = false, includeEmptyNote = false } = {}) {
  const payload = {
    code: String(values.code ?? '').trim().toUpperCase(),
    type: toApiCouponType(values.type),
    value: Number(values.value),
  }

  const description = String(values.description ?? '').trim()
  if (description || includeEmptyNote) payload.description = description

  if (includeVendor) payload.vendor_id = String(values.vendorId ?? '').trim()

  const minimumPurchase = optionalAmount(values.minimumPurchase)
  if (minimumPurchase != null) payload.minimum_purchase = minimumPurchase

  const usageLimit = optionalAmount(values.usageLimit)
  if (usageLimit != null) payload.usage_limit = usageLimit

  const perUserLimit = optionalAmount(values.perUserLimit)
  if (perUserLimit != null) payload.per_user_limit = perUserLimit

  const maximumDiscount = optionalAmount(values.maximumDiscount)
  if (maximumDiscount != null) payload.maximum_discount = maximumDiscount

  payload.is_stackable = values.stackable ? 1 : 0

  return payload
}

export async function fetchAdminCoupons({
  status = '',
  search = '',
  type = '',
  vendorId = '',
  page = 1,
  perPage = COUPON_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(COUPON_ADMIN_ENDPOINTS.LIST, {
    params: compactParams({
      vendor_id: String(vendorId ?? '').trim(),
      is_active: toCouponActiveParam(status),
      type: type ? toApiCouponType(type) : '',
      search: String(search ?? '').trim(),
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load coupons.')

  return {
    coupons: normalizeAdminCoupons(envelope),
    pagination: extractCouponPagination(envelope),
  }
}

export async function fetchAdminCouponById(couponId) {
  const { data } = await apiClient.get(COUPON_ADMIN_ENDPOINTS.byId(couponId))
  const envelope = assertAuthEnvelope(data, 'Could not load coupon.')
  const coupon = normalizeAdminCouponDetail(envelope, couponId)

  if (!coupon?.id) {
    const error = new Error('Coupon not found.')
    error.response = { data: envelope, status: envelope?.status_code ?? 404 }
    throw error
  }

  return coupon
}

export async function createAdminCoupon(values) {
  const payload = toCouponWritePayload(values, { includeVendor: true })
  const { data } = await apiClient.post(COUPON_ADMIN_ENDPOINTS.LIST, payload)
  const envelope = assertAuthEnvelope(data, 'Could not create coupon.')
  const coupon = normalizeAdminCouponDetail(envelope)

  return {
    coupon: coupon?.id ? coupon : normalizeAdminCoupon({ ...payload, id: envelope?.data?.id }),
    message: envelope?.reason || envelope?.message || 'Coupon created.',
  }
}

export async function updateAdminCoupon({ id, ...values }) {
  const payload = toCouponWritePayload(values, {
    includeVendor: Boolean(values.vendorId),
    includeEmptyNote: true,
  })
  const { data } = await apiClient.put(COUPON_ADMIN_ENDPOINTS.byId(id), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update coupon.')
  const coupon = normalizeAdminCouponDetail(envelope, id)

  return {
    coupon: coupon?.id ? coupon : { id: String(id), ...normalizeAdminCoupon({ id, ...payload }) },
    message: envelope?.reason || envelope?.message || 'Coupon updated.',
  }
}

export async function updateAdminCouponStatus({ id, isActive }) {
  const payload = { is_active: Boolean(isActive) }
  const { data } = await apiClient.patch(COUPON_ADMIN_ENDPOINTS.status(id), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update coupon status.')
  const coupon = normalizeAdminCouponDetail(envelope, id)

  return {
    coupon: coupon?.id
      ? coupon
      : { id: String(id), isActive: payload.is_active, status: payload.is_active ? 'live' : 'paused' },
    message: envelope?.reason || envelope?.message || (payload.is_active ? 'Coupon is live.' : 'Coupon paused.'),
  }
}

export async function deleteAdminCoupon(id) {
  const { data } = await apiClient.delete(COUPON_ADMIN_ENDPOINTS.byId(id))
  if (!data || typeof data !== 'object') {
    return { id: String(id), message: 'Coupon removed.' }
  }

  const envelope = assertAuthEnvelope(data, 'Could not remove coupon.')
  return {
    id: String(id),
    message: envelope?.reason || envelope?.message || 'Coupon removed.',
  }
}

export async function fetchAdminCouponUsage() {
  const { data } = await apiClient.get(COUPON_ADMIN_ENDPOINTS.USAGE, {
    params: { ...LATEST_FIRST_QUERY },
  })
  const envelope = assertAuthEnvelope(data, 'Could not load coupon usage.')
  return normalizeCouponUsage(envelope)
}
