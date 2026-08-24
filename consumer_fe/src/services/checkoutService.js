import apiClient from '../lib/apiClient'
import { uniqueCartItemIds } from '../utils/checkoutCartItems'

export const CHECKOUT_ENDPOINTS = {
  PREVIEW: '/checkout/preview',
  CHECKOUT: '/checkout',
  // POST starts a Buy Now session. Completing it is POST /checkout/buy-now/{checkout_session_id}.
  BUY_NOW: '/checkout/buy-now',
}

function unwrapApiPayload(data) {
  if (!data || typeof data !== 'object') return {}

  const nested = data.data
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return { ...data, ...nested }
  }

  return data
}

function firstNonEmptyId(...values) {
  for (const value of values) {
    const id = String(value ?? '').trim()
    if (id) return id
  }
  return null
}

/**
 * Buy Now initiate returns the checkout session as `data.id`
 * (e.g. "01m0g0yr9by9w0gzm9f2h6cjya"). That id is used in
 * POST /checkout/buy-now/{checkout_session_id}.
 */
export function extractCheckoutSessionId(payload) {
  if (!payload || typeof payload !== 'object') return null

  const nested = payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : null

  return firstNonEmptyId(
    nested?.id,
    payload.id,
    payload.checkout_session_id,
    payload.checkoutSessionId,
    payload.session_id,
    payload.sessionId,
  )
}

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Checkout request failed')
  error.response = { data }
  throw error
}

export function buildCheckoutPreviewPayload(cartItemIds = []) {
  return {
    cart_item_ids: uniqueCartItemIds(cartItemIds),
  }
}

export async function getCheckoutPreview(cartItemIds = []) {
  const { data } = await apiClient.post(
    CHECKOUT_ENDPOINTS.PREVIEW,
    buildCheckoutPreviewPayload(cartItemIds),
    { skipAuthLogout: true },
  )
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

export async function getCheckout() {
  const { data } = await apiClient.get(CHECKOUT_ENDPOINTS.CHECKOUT, { skipAuthLogout: true })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

export async function placeCheckoutOrder(payload) {
  const { data } = await apiClient.post(CHECKOUT_ENDPOINTS.CHECKOUT, payload, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  const order = data?.data ?? data ?? {}

  // `point_in_time` lives alongside `data`, not inside it — carry it over
  // so the success screen can show when the order was placed.
  return order.point_in_time ? order : { ...order, point_in_time: data?.point_in_time ?? null }
}

/**
 * POST /api/checkout/buy-now — start a Buy Now session.
 * `variant_id` is nullable when the product has no selectable variant.
 */
export function buildBuyNowInitiatePayload(item) {
  const productId = item?.productId ?? item?.product_id
  const variantId = item?.variantId ?? item?.product_variant_id ?? item?.variant_id ?? null
  const quantity = Math.max(1, Number(item?.quantity) || 1)

  if (productId == null || String(productId).trim() === '') {
    throw new Error('product_id is required to start Buy Now')
  }

  return {
    product_id: String(productId).trim(),
    variant_id: variantId == null || String(variantId).trim() === ''
      ? null
      : String(variantId).trim(),
    quantity,
  }
}

export function getBuyNowInitiateKey(payload) {
  return `${payload.product_id}::${payload.variant_id ?? ''}::${payload.quantity}`
}

export async function initiateBuyNow(payload) {
  const { data } = await apiClient.post(CHECKOUT_ENDPOINTS.BUY_NOW, payload, {
    skipAuthLogout: true,
    skipGuestCartHeader: true,
  })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

export function buyNowPlaceOrderPath(sessionId) {
  const id = String(sessionId ?? '').trim()
  if (!id) {
    throw new Error('checkout_session_id is required to place a Buy Now order')
  }

  return `${CHECKOUT_ENDPOINTS.BUY_NOW}/${encodeURIComponent(id)}`
}

/**
 * POST /api/checkout/buy-now/{checkout_session_id}
 * Completes Buy Now with saved shipping and billing address ids.
 */
export async function placeBuyNowOrder(sessionId, payload) {
  const { data } = await apiClient.post(buyNowPlaceOrderPath(sessionId), payload, {
    skipAuthLogout: true,
    skipGuestCartHeader: true,
  })
  assertApiSuccess(data)
  const order = unwrapApiPayload(data)

  return order.point_in_time ? order : { ...order, point_in_time: data?.point_in_time ?? null }
}
