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
