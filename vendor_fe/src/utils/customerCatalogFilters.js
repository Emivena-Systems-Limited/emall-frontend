import {
  CUSTOMER_SEGMENTS,
} from '../constants/customers'
import { MOCK_CUSTOMERS_REFERENCE_DATE } from '../mocks/customerMockData'

function normalizeSearch(value) {
  return value.trim().toLowerCase()
}

function matchesSearch(customer, search) {
  const query = normalizeSearch(search)
  if (!query) return true

  const haystack = [customer.name, customer.email, customer.phone]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

function matchesSegment(customer, segment) {
  if (segment !== CUSTOMER_SEGMENTS.NEW_THIS_MONTH) return true

  const now = new Date(MOCK_CUSTOMERS_REFERENCE_DATE)
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

function matchesOrderDateRange(customer, orderDateRange = {}) {
  const start = parseDateBoundary(orderDateRange.startDate)
  const end = parseDateBoundary(orderDateRange.endDate, true)

  if (!start && !end) return true

  return customer.orderHistory.some((order) => {
    const orderDate = new Date(order.orderDate)
    if (start && orderDate < start) return false
    if (end && orderDate > end) return false
    return true
  })
}

function matchesSpendRange(customer, minSpend = '', maxSpend = '') {
  const min = minSpend !== '' ? Number(minSpend) : null
  const max = maxSpend !== '' ? Number(maxSpend) : null

  if (min !== null && !Number.isNaN(min) && customer.totalSpend < min) return false
  if (max !== null && !Number.isNaN(max) && customer.totalSpend > max) return false

  return true
}

// TODO: Replace frontend filtering with API-powered search/filter once backend endpoints are available.
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
