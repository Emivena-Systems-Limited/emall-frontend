import { STATUS_FILTERS, SUMMARY_FILTERS } from '../constants/orders'

const IN_TRANSIT_DELIVERY_STATUSES = ['shipped', 'out_for_delivery']

function resolveDeliveryStatus(order) {
  return order?.deliveryStatus ?? 'pending'
}

function normalizeSearch(value) {
  return value.trim().toLowerCase()
}

function matchesStatusFilter(order, statusFilter) {
  if (statusFilter === STATUS_FILTERS.ALL || statusFilter === SUMMARY_FILTERS.ALL) {
    return true
  }

  const deliveryStatus = resolveDeliveryStatus(order)

  if (statusFilter === SUMMARY_FILTERS.PENDING || statusFilter === STATUS_FILTERS.PENDING) {
    return deliveryStatus === 'pending'
  }

  if (statusFilter === SUMMARY_FILTERS.SHIPPED) {
    return IN_TRANSIT_DELIVERY_STATUSES.includes(deliveryStatus)
  }

  return deliveryStatus === statusFilter
}

function matchesSearch(order, search) {
  const query = normalizeSearch(search)
  if (!query) return true

  const haystack = [
    order.orderNumber,
    order.customer?.name,
    order.customer?.email,
    ...order.items.map((item) => item.productName),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

export function filterOrderCatalog(orders, { search = '', statusFilter = STATUS_FILTERS.ALL } = {}) {
  return orders.filter(
    (order) => matchesStatusFilter(order, statusFilter) && matchesSearch(order, search),
  )
}

export function getOrderCatalogSummary(orders) {
  return {
    total: orders.length,
    pending: orders.filter((order) => resolveDeliveryStatus(order) === 'pending').length,
    processing: orders.filter((order) => resolveDeliveryStatus(order) === 'processing').length,
    shipped: orders.filter((order) => IN_TRANSIT_DELIVERY_STATUSES.includes(resolveDeliveryStatus(order))).length,
    delivered: orders.filter((order) => resolveDeliveryStatus(order) === 'delivered').length,
  }
}

export function paginateOrders(orders, { page = 1, pageSize = 10 } = {}) {
  const totalItems = orders.length
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(page, 1), pageCount)
  const start = (safePage - 1) * pageSize

  return {
    items: orders.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    totalItems,
    pageSize,
    startIndex: totalItems === 0 ? 0 : start + 1,
    endIndex: Math.min(start + pageSize, totalItems),
  }
}

export function getActiveSummaryFilter(statusFilter) {
  if (statusFilter === SUMMARY_FILTERS.PENDING || statusFilter === STATUS_FILTERS.PENDING) {
    return SUMMARY_FILTERS.PENDING
  }
  if (statusFilter === SUMMARY_FILTERS.PROCESSING || statusFilter === STATUS_FILTERS.PROCESSING) {
    return SUMMARY_FILTERS.PROCESSING
  }
  if (
    statusFilter === SUMMARY_FILTERS.SHIPPED
    || statusFilter === STATUS_FILTERS.SHIPPED
    || statusFilter === STATUS_FILTERS.OUT_FOR_DELIVERY
  ) {
    return SUMMARY_FILTERS.SHIPPED
  }
  if (statusFilter === SUMMARY_FILTERS.DELIVERED || statusFilter === STATUS_FILTERS.DELIVERED) {
    return SUMMARY_FILTERS.DELIVERED
  }
  if (statusFilter === STATUS_FILTERS.ALL || statusFilter === SUMMARY_FILTERS.ALL) {
    return SUMMARY_FILTERS.ALL
  }
  return null
}
