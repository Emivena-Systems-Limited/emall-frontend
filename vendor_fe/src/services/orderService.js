import apiClient from '../lib/apiClient'
import { ORDER_ENDPOINTS } from '../constants/orders'
import {
  extractVendorOrderList,
  extractVendorOrderRecord,
  extractVendorOrdersPagination,
} from '../utils/normalizeVendorOrders'
import { assertApiSuccess } from './authService'

async function fetchVendorOrdersPage(page = 1) {
  const { data } = await apiClient.get(ORDER_ENDPOINTS.VENDOR_LIST, { params: { page } })
  assertApiSuccess(data)
  return data
}

export async function getVendorOrders() {
  const firstResponse = await fetchVendorOrdersPage(1)

  if (import.meta.env.DEV) {
    console.info('[orders] GET', ORDER_ENDPOINTS.VENDOR_LIST, firstResponse)
  }

  const orders = extractVendorOrderList(firstResponse)
  const { lastPage } = extractVendorOrdersPagination(firstResponse)

  if (lastPage <= 1) return orders

  const remainingPages = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) => fetchVendorOrdersPage(index + 2)),
  )

  return [
    ...orders,
    ...remainingPages.flatMap(extractVendorOrderList),
  ]
}

export async function getVendorOrderById(orderId) {
  const id = String(orderId ?? '').trim()
  if (!id) {
    throw new Error('Order id is required.')
  }

  const { data } = await apiClient.get(ORDER_ENDPOINTS.byId(id))

  if (import.meta.env.DEV) {
    console.info('[orders] GET', ORDER_ENDPOINTS.byId(id), data)
  }

  assertApiSuccess(data)
  const record = extractVendorOrderRecord(data)

  if (!record) {
    throw new Error('Order not found.')
  }

  return record
}
