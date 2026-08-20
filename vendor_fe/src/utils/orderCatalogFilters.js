import { STATUS_FILTERS, SUMMARY_FILTERS } from '../constants/orders'

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

  if (statusFilter === SUMMARY_FILTERS.SHIPPED || statusFilter === STATUS_FILTERS.SHIPPED) {
    return deliveryStatus === 'shipped'
  }

  if (statusFilter === STATUS_FILTERS.CANCELLED) {
    return deliveryStatus === 'cancelled'
  }

  return deliveryStatus === statusFilter
}

function parseDateBoundary(value, endOfDay = false) {
  if (!value) return null

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null

  if (endOfDay) {
    date.setHours(23, 59, 59, 999)
  }

  return date
}

function matchesDateRange(order, dateRange = {}) {
  const start = parseDateBoundary(dateRange.startDate)
  const end = parseDateBoundary(dateRange.endDate, true)
  if (!start && !end) return true

  const raw = order?.orderDate
  if (!raw) return false

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return false
  if (start && date < start) return false
  if (end && date > end) return false
  return true
}

function matchesSearch(order, search) {
  const query = normalizeSearch(search)
  if (!query) return true

  const haystack = [
    order.orderNumber,
    order.orderId,
    order.productName,
    order.sku,
    order.customer?.name,
    order.customer?.email,
    order.customer?.phone,
    ...(order.items ?? []).map((item) => item.productName),
    ...(order.items ?? []).map((item) => item.sku),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

function matchesCustomerFilter(order, customerEmail) {
  if (!customerEmail) return true
  return order.customer?.email?.toLowerCase() === customerEmail.toLowerCase()
}

export function filterOrderCatalog(
  orders,
  {
    search = '',
    statusFilter = STATUS_FILTERS.ALL,
    customerEmail = null,
    dateRange = { startDate: '', endDate: '' },
  } = {},
) {
  return orders.filter(
    (order) =>
      matchesStatusFilter(order, statusFilter)
      && matchesSearch(order, search)
      && matchesCustomerFilter(order, customerEmail)
      && matchesDateRange(order, dateRange),
  )
}

export function getOrderCatalogSummary(orders) {
  return {
    total: orders.length,
    pending: orders.filter((order) => resolveDeliveryStatus(order) === 'pending').length,
    processing: orders.filter((order) => resolveDeliveryStatus(order) === 'processing').length,
    shipped: orders.filter((order) => resolveDeliveryStatus(order) === 'shipped').length,
    delivered: orders.filter((order) => resolveDeliveryStatus(order) === 'delivered').length,
  }
}

export function sortCatalogOrders(orders) {
  return [...orders].sort((a, b) => {
    const aPending = resolveDeliveryStatus(a) === 'pending' ? 0 : 1
    const bPending = resolveDeliveryStatus(b) === 'pending' ? 0 : 1
    if (aPending !== bPending) return aPending - bPending

    const aTime = Date.parse(a?.orderDate ?? '') || 0
    const bTime = Date.parse(b?.orderDate ?? '') || 0
    return bTime - aTime
  })
}

function resolveOrderGroupKey(order) {
  const orderId = String(order?.orderId ?? '').trim()
  if (orderId) return `id:${orderId.toLowerCase()}`

  const orderNumber = String(order?.orderNumber ?? '').trim()
  if (orderNumber && orderNumber !== '—') return `num:${orderNumber.toLowerCase()}`

  return `row:${String(order?.id ?? order?.itemId ?? '')}`
}

export function groupOrdersByOrderNumber(orders) {
  const groups = []
  const indexByKey = new Map()

  for (const order of orders) {
    const key = resolveOrderGroupKey(order)
    const existingIndex = indexByKey.get(key)

    if (existingIndex == null) {
      indexByKey.set(key, groups.length)
      groups.push({
        key,
        orders: [order],
      })
      continue
    }

    groups[existingIndex].orders.push(order)
  }

  return groups
}

export function mergeOrderGroup(orders) {
  const list = Array.isArray(orders) ? orders.filter(Boolean) : []
  if (!list.length) return null

  const first = list[0]
  if (list.length === 1) return first

  const items = list.flatMap((order) => {
    if (order.items?.length) return order.items

    return [{
      id: order.itemId || order.id,
      productId: order.productId,
      productName: order.productName,
      sku: order.sku,
      image: order.image,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      comparePrice: order.comparePrice ?? order.items?.[0]?.comparePrice ?? null,
      totalPrice: order.totalAmount,
      variantLabel: order.items?.[0]?.variantLabel ?? null,
      deliveryStatus: order.deliveryStatus,
    }]
  })

  const quantity = list.reduce((sum, order) => sum + Math.max(1, Number(order.quantity) || 1), 0)
  const totalAmount = list.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)

  return {
    ...first,
    items,
    quantity,
    productsCount: quantity,
    totalAmount,
    productName: `${list.length} products`,
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
  if (statusFilter === SUMMARY_FILTERS.SHIPPED || statusFilter === STATUS_FILTERS.SHIPPED) {
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
