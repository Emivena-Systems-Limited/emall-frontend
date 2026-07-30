import apiClient from '../lib/apiClient'

export const CHECKOUT_ENDPOINTS = {
  PREVIEW: '/checkout/preview',
  CHECKOUT: '/checkout',
  // TODO: confirm the final path/payload once the backend's single-item
  // "Buy Now" purchase endpoint ships — this is a placeholder guess so the
  // frontend flow can be wired up ahead of time.
  BUY_NOW: '/checkout/buy-now',
}

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Checkout request failed')
  error.response = { data }
  throw error
}

export async function getCheckoutPreview() {
  const { data } = await apiClient.get(CHECKOUT_ENDPOINTS.PREVIEW, { skipAuthLogout: true })
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
 * Places a "Buy Now" order for a single item, bypassing the cart entirely.
 * Payload shape is a best guess (product/variant/quantity + addresses) —
 * update this once the backend's single-item purchase endpoint is finalized.
 */
export async function placeBuyNowOrder(payload) {
  const { data } = await apiClient.post(CHECKOUT_ENDPOINTS.BUY_NOW, payload, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  const order = data?.data ?? data ?? {}

  return order.point_in_time ? order : { ...order, point_in_time: data?.point_in_time ?? null }
}
