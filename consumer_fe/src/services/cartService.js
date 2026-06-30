import { CART_ENDPOINTS } from '../constants/cart'
import apiClient from '../lib/apiClient'

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Cart request failed')
  error.response = { data }
  throw error
}

export async function getAuthenticatedCart() {
  const { data } = await apiClient.get(CART_ENDPOINTS.CART, { skipAuthLogout: true })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

export async function createCart(payload = {}) {
  const { data } = await apiClient.post(CART_ENDPOINTS.CART, payload, { skipAuthLogout: true })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

export async function addItemToCart(payload) {
  const { data } = await apiClient.post(CART_ENDPOINTS.ITEMS, payload, { skipAuthLogout: true })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

export async function updateCartItem(itemId, payload) {
  const { data } = await apiClient.put(CART_ENDPOINTS.ITEM(itemId), payload, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

export async function removeCartItem(itemId) {
  const { data } = await apiClient.delete(CART_ENDPOINTS.ITEM(itemId), { skipAuthLogout: true })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}
