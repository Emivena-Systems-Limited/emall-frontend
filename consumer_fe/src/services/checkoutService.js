import apiClient from '../lib/apiClient'

export const CHECKOUT_ENDPOINTS = {
  PREVIEW: '/checkout/preview',
  CHECKOUT: '/checkout',
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
