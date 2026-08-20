import apiClient from '../lib/apiClient'

export const ORDERS_ENDPOINTS = {
  LIST: '/orders/orders',
  cancel: (orderId) => `/orders/${orderId}/cancel`,
}

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Orders request failed')
  error.response = { data }
  throw error
}

export async function getOrders() {
  if (import.meta.env.DEV) {
    console.info('[orders] GET', ORDERS_ENDPOINTS.LIST)
  }

  const { data } = await apiClient.get(ORDERS_ENDPOINTS.LIST, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  const payload = data?.data ?? data ?? {}

  if (import.meta.env.DEV) {
    console.info('[orders] response', payload)
  }

  return payload
}

export async function cancelOrder(orderId) {
  const id = String(orderId ?? '').trim()
  if (!id) {
    throw new Error('Order id is required to cancel an order')
  }

  if (import.meta.env.DEV) {
    console.info('[orders] POST', ORDERS_ENDPOINTS.cancel(id))
  }

  const { data } = await apiClient.patch(ORDERS_ENDPOINTS.cancel(id), {}, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}
