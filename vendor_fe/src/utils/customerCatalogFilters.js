import {
  CUSTOMER_SEGMENTS,
} from '../constants/customers'

function normalizeSearch(value) {
  return value.trim().toLowerCase()
}

function normalizePhoneDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

function matchesSearch(customer, search) {
  const query = normalizeSearch(search)
  if (!query) return true

  const name = String(customer.name ?? '').toLowerCase()
  const email = String(customer.email ?? '').toLowerCase()
  const phoneDigits = normalizePhoneDigits(customer.phone)
  const queryDigits = normalizePhoneDigits(search)

  if (name.includes(query) || email.includes(query)) return true

  if (queryDigits.length > 0 && phoneDigits.includes(queryDigits)) return true

  const phoneDisplay = String(customer.phone ?? '').toLowerCase()
  return phoneDisplay.includes(query)
}

function matchesSegment(customer, segment) {
  if (segment !== CUSTOMER_SEGMENTS.NEW_THIS_MONTH) return true

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(customer.firstPurchaseDate) >= monthStart
}

function parseDateBoundary(value, endOfDay = false) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  if (endOfDay) {
    date.setHours(23, 59, 59, 999)
  } else {
    date.setHours(0, 0, 0, 0)
  }

  return date
}

function isDateInRange(value, start, end) {
  if (!value) return false

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  if (start && date < start) return false
  if (end && date > end) return false
  return true
}

function matchesOrderDateRange(customer, orderDateRange = {}) {
  const start = parseDateBoundary(orderDateRange.startDate)
  const end = parseDateBoundary(orderDateRange.endDate, true)

  if (!start && !end) return true

  const history = Array.isArray(customer.orderHistory) ? customer.orderHistory : []
  if (history.length > 0) {
    return history.some((order) => isDateInRange(order.orderDate, start, end))
  }

  return isDateInRange(customer.lastOrderDate, start, end)
    || isDateInRange(customer.firstPurchaseDate, start, end)
}

function matchesSpendRange(customer, minSpend = '', maxSpend = '') {
  const min = minSpend !== '' ? Number(minSpend) : null
  const max = maxSpend !== '' ? Number(maxSpend) : null

  if (min !== null && !Number.isNaN(min) && customer.totalSpend < min) return false
  if (max !== null && !Number.isNaN(max) && customer.totalSpend > max) return false

  return true
}

// Frontend catalog filtering — search runs client-side on loaded customers.
export function filterCustomerCatalog(
  customers,
  {
    search = '',
    segment = CUSTOMER_SEGMENTS.ALL,
    orderDateRange = {},
    minSpend = '',
    maxSpend = '',
  } = {},
) {
  return customers.filter(
    (customer) =>
      matchesSearch(customer, search)
      && matchesSegment(customer, segment)
      && matchesOrderDateRange(customer, orderDateRange)
      && matchesSpendRange(customer, minSpend, maxSpend),
  )
}

export function paginateCustomers(customers, { page = 1, pageSize = 10 } = {}) {
  const totalItems = customers.length
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(page, 1), pageCount)
  const start = (safePage - 1) * pageSize

  return {
    items: customers.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    totalItems,
    pageSize,
    startIndex: totalItems === 0 ? 0 : start + 1,
    endIndex: Math.min(start + pageSize, totalItems),
  }
}

export function hasActiveCustomerFilters({
  search = '',
  segment = CUSTOMER_SEGMENTS.ALL,
  orderDateRange = {},
  minSpend = '',
  maxSpend = '',
} = {}) {
  return Boolean(
    normalizeSearch(search)
    || segment !== CUSTOMER_SEGMENTS.ALL
    || orderDateRange.startDate
    || orderDateRange.endDate
    || minSpend !== ''
    || maxSpend !== '',
  )
}

export function normalizeCustomerListFilters({
  search = '',
  segment = CUSTOMER_SEGMENTS.ALL,
  startDate = '',
  endDate = '',
  minSpend = '',
  maxSpend = '',
} = {}) {
  return {
    search: String(search ?? '').trim(),
    segment: segment === CUSTOMER_SEGMENTS.NEW_THIS_MONTH
      ? CUSTOMER_SEGMENTS.NEW_THIS_MONTH
      : CUSTOMER_SEGMENTS.ALL,
    startDate: String(startDate ?? '').trim(),
    endDate: String(endDate ?? '').trim(),
    minSpend: String(minSpend ?? '').trim(),
    maxSpend: String(maxSpend ?? '').trim(),
  }
}

export function buildCustomersQueryParams(filters = {}) {
  const normalized = normalizeCustomerListFilters(filters)
  const params = {}

  if (normalized.search) params.search = normalized.search
  if (normalized.segment !== CUSTOMER_SEGMENTS.ALL) params.segment = normalized.segment
  if (normalized.startDate) params.start_date = normalized.startDate
  if (normalized.endDate) params.end_date = normalized.endDate

  if (normalized.minSpend !== '' && !Number.isNaN(Number(normalized.minSpend))) {
    params.min_spend = normalized.minSpend
  }
  if (normalized.maxSpend !== '' && !Number.isNaN(Number(normalized.maxSpend))) {
    params.max_spend = normalized.maxSpend
  }

  const page = Number(filters.page)
  if (Number.isFinite(page) && page > 0) params.page = page

  return params
}
