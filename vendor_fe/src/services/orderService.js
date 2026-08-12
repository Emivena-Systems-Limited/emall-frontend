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

export async function updateVendorOrderDeliveryStatus(orderId, status) {
  const id = String(orderId ?? '').trim()
  const nextStatus = String(status ?? '').trim()

  if (!id) {
    throw new Error('Order id is required.')
  }

  if (!nextStatus) {
    throw new Error('Status is required.')
  }

  const endpoint = ORDER_ENDPOINTS.updateDeliveryStatus(id)
  const { data } = await apiClient.put(endpoint, { delivery_status: nextStatus })

  if (import.meta.env.DEV) {
    console.info('[orders] PUT', endpoint, { delivery_status: nextStatus }, data)
  }

  assertApiSuccess(data)
  return data
}

function buildUserOrderQueryParams(filters = {}) {
  const params = {}

  if (filters.start_date) params.start_date = filters.start_date
  if (filters.end_date) params.end_date = filters.end_date
  if (filters.min_total !== undefined && filters.min_total !== '') {
    params.min_total = filters.min_total
  }
  if (filters.max_total !== undefined && filters.max_total !== '') {
    params.max_total = filters.max_total
  }

  return params
}

export async function getUserOrders(userId, filters = {}) {
  const id = String(userId ?? '').trim()
  if (!id) {
    throw new Error('User id is required.')
  }

  const endpoint = ORDER_ENDPOINTS.userOrders(id)
  const params = buildUserOrderQueryParams(filters)
  const { data } = await apiClient.get(endpoint, { params })

  if (import.meta.env.DEV) {
    console.info('[orders] GET', endpoint, params, data)
  }

  assertApiSuccess(data)
  return extractVendorOrderList(data)
}
