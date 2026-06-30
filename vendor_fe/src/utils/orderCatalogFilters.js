import { STATUS_FILTERS, SUMMARY_FILTERS } from '../constants/orders'

function normalizeSearch(value) {
  return value.trim().toLowerCase()
}

function matchesStatusFilter(order, statusFilter) {
  if (statusFilter === STATUS_FILTERS.ALL || statusFilter === SUMMARY_FILTERS.ALL) {
    return true
  }

  return order.orderStatus === statusFilter
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
    pending: orders.filter((order) => order.orderStatus === 'pending').length,
    processing: orders.filter((order) => order.orderStatus === 'processing').length,
    shipped: orders.filter((order) => order.orderStatus === 'shipped').length,
    delivered: orders.filter((order) => order.orderStatus === 'delivered').length,
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
  if (statusFilter === SUMMARY_FILTERS.PENDING) return SUMMARY_FILTERS.PENDING
  if (statusFilter === SUMMARY_FILTERS.PROCESSING) return SUMMARY_FILTERS.PROCESSING
  if (statusFilter === SUMMARY_FILTERS.SHIPPED) return SUMMARY_FILTERS.SHIPPED
  if (statusFilter === SUMMARY_FILTERS.DELIVERED) return SUMMARY_FILTERS.DELIVERED
  if (statusFilter === STATUS_FILTERS.ALL) return SUMMARY_FILTERS.ALL
  return null
}
