import apiClient from '../lib/apiClient'
import { ORDER_ADMIN_ENDPOINTS, ORDER_PAGE_SIZE, VENDOR_ORDER_PAGE_SIZE } from '../constants/adminOrders'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractAdminOrderPagination,
  extractAdminOrderRecord,
  getOrderApiId,
  normalizeAdminOrders,
  normalizeOrderStats,
  paginateAdminVendorOrders,
  parseAdminVendorOrdersEnvelope,
  toAdminOrder,
} from '../utils/normalizeAdminOrders'
import { extractVendorOrderRecord } from '../utils/normalizeVendorOrders'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

export async function fetchAdminOrders({
  status = '',
  paymentStatus = '',
  deliveryStatus = '',
  vendorId = '',
  userId = '',
  search = '',
  page = 1,
  perPage = ORDER_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(ORDER_ADMIN_ENDPOINTS.LIST, {
    params: compactParams({
      status,
      payment_status: paymentStatus,
      delivery_status: deliveryStatus,
      vendor_id: vendorId,
      user_id: userId,
      search: String(search ?? '').trim(),
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load orders.')

  return {
    orders: normalizeAdminOrders(envelope),
    pagination: extractAdminOrderPagination(envelope),
  }
}

export async function fetchAdminVendorOrders({
  vendorId,
  status = '',
  paymentStatus = '',
  deliveryStatus = '',
  search = '',
  page = 1,
  perPage = VENDOR_ORDER_PAGE_SIZE,
} = {}) {
  if (!vendorId) {
    return {
      orders: [],
      pagination: extractAdminOrderPagination({ data: [] }),
    }
  }

  const { data } = await apiClient.get(ORDER_ADMIN_ENDPOINTS.byVendor(vendorId), {
    params: compactParams({
      status,
      payment_status: paymentStatus,
      delivery_status: deliveryStatus,
      search: String(search ?? '').trim(),
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load vendor orders.')
  const parsed = parseAdminVendorOrdersEnvelope(envelope)

  if (!parsed.hasOrders) {
    const fallback = await fetchAdminOrders({
      vendorId,
      status,
      paymentStatus,
      deliveryStatus,
      search,
      page,
      perPage,
    })

    return {
      ...fallback,
      salesSummary: parsed.salesSummary,
      usedOrdersListFallback: parsed.isVendorProfileOnly,
    }
  }

  const normalizedOrders = normalizeAdminOrders(parsed.ordersBody)

  if (parsed.isUnpaginatedBundle) {
    const paged = paginateAdminVendorOrders(normalizedOrders, {
      total: parsed.totalOrders ?? parsed.salesSummary?.totalOrders ?? normalizedOrders.length,
      page,
      perPage,
    })

    return {
      orders: paged.orders,
      pagination: paged.pagination,
      salesSummary: parsed.salesSummary,
      usedOrdersListFallback: false,
    }
  }

  return {
    orders: normalizedOrders,
    pagination: extractAdminOrderPagination(parsed.ordersBody),
    salesSummary: parsed.salesSummary,
    usedOrdersListFallback: false,
  }
}

export async function fetchAdminVendorOrderSnapshot(vendorId) {
  if (!vendorId) {
    return { orders: [], total: 0, salesSummary: null }
  }

  const { data } = await apiClient.get(ORDER_ADMIN_ENDPOINTS.byVendor(vendorId), {
    params: compactParams({
      page: 1,
      per_page: VENDOR_ORDER_PAGE_SIZE,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load vendor orders.')
  const parsed = parseAdminVendorOrdersEnvelope(envelope)

  if (!parsed.hasOrders) {
    const fallback = await fetchAdminVendorOrders({
      vendorId,
      page: 1,
      perPage: VENDOR_ORDER_PAGE_SIZE,
    })

    return {
      orders: fallback.orders,
      total: fallback.pagination.total,
      salesSummary: parsed.salesSummary,
    }
  }

  const normalizedOrders = normalizeAdminOrders(parsed.ordersBody)

  return {
    orders: normalizedOrders,
    total: parsed.totalOrders ?? parsed.salesSummary?.totalOrders ?? normalizedOrders.length,
    salesSummary: parsed.salesSummary,
  }
}

export async function fetchAdminOrderStats() {
  const { data } = await apiClient.get(ORDER_ADMIN_ENDPOINTS.STATS)
  const envelope = assertAuthEnvelope(data, 'Could not load order stats.')
  return normalizeOrderStats(envelope)
}

export async function fetchAdminOrderById(orderId) {
  const id = String(orderId ?? '').trim()
  if (!id) {
    const error = new Error('Order not found.')
    error.response = { status: 404 }
    throw error
  }

  const { data } = await apiClient.get(ORDER_ADMIN_ENDPOINTS.byId(id))
  const envelope = assertAuthEnvelope(data, 'Could not load order.')
  const record = extractAdminOrderRecord(envelope, id) ?? extractVendorOrderRecord(envelope)

  if (!record) {
    const error = new Error('Order not found.')
    error.response = { data: envelope, status: envelope?.status_code ?? 404 }
    throw error
  }

  return record
}

async function readUpdatedOrder(envelope, orderId) {
  const record = extractAdminOrderRecord(envelope, orderId) ?? extractVendorOrderRecord(envelope)
  if (record) return record
  return fetchAdminOrderById(orderId)
}

export async function updateAdminOrderPaymentStatus({ id, paymentStatus }) {
  const { data } = await apiClient.patch(
    ORDER_ADMIN_ENDPOINTS.paymentStatus(id),
    { payment_status: paymentStatus },
  )
  const envelope = assertAuthEnvelope(data, 'Could not update payment status.')
  const record = await readUpdatedOrder(envelope, id)

  return {
    record,
    order: toAdminOrder(record),
    message: envelope?.reason || envelope?.message || 'Payment status updated.',
  }
}

export async function updateAdminOrderDeliveryStatus({ id, deliveryStatus }) {
  const { data } = await apiClient.patch(
    ORDER_ADMIN_ENDPOINTS.deliveryStatus(id),
    { delivery_status: deliveryStatus },
  )
  const envelope = assertAuthEnvelope(data, 'Could not update delivery status.')
  const record = await readUpdatedOrder(envelope, id)

  return {
    record,
    order: toAdminOrder(record),
    message: envelope?.reason || envelope?.message || 'Delivery status updated.',
  }
}

export async function cancelAdminOrder(id) {
  const { data } = await apiClient.patch(ORDER_ADMIN_ENDPOINTS.cancel(id), {})
  const envelope = assertAuthEnvelope(data, 'Could not cancel this order.')
  const record = await readUpdatedOrder(envelope, id).catch(() => null)

  return {
    record,
    order: record ? toAdminOrder(record) : { apiId: id, id, orderStatus: 'cancelled', deliveryStatus: 'cancelled' },
    message: envelope?.reason || envelope?.message || 'Order cancelled.',
  }
}

export { getOrderApiId }
