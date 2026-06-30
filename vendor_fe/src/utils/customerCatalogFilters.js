import {
  CUSTOMER_SEGMENTS,
  ORDER_DATE_FILTERS,
  SPEND_FILTERS,
} from '../constants/customers'

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

  const now = new Date('2026-06-30T12:00:00')
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(customer.firstPurchaseDate) >= monthStart
}

function getOrderDateCutoff(filter) {
  const now = new Date('2026-06-30T12:00:00')

  switch (filter) {
    case ORDER_DATE_FILTERS.LAST_7_DAYS:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case ORDER_DATE_FILTERS.LAST_30_DAYS:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case ORDER_DATE_FILTERS.LAST_90_DAYS:
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case ORDER_DATE_FILTERS.THIS_YEAR:
      return new Date(now.getFullYear(), 0, 1)
    default:
      return null
  }
}

function matchesOrderDateFilter(customer, orderDateFilter) {
  const cutoff = getOrderDateCutoff(orderDateFilter)
  if (!cutoff) return true

  return customer.orderHistory.some(
    (order) => new Date(order.orderDate) >= cutoff,
  )
}

function matchesSpendFilter(customer, spendFilter) {
  switch (spendFilter) {
    case SPEND_FILTERS.UNDER_200:
      return customer.totalSpend < 200
    case SPEND_FILTERS.BETWEEN_200_500:
      return customer.totalSpend >= 200 && customer.totalSpend <= 500
    case SPEND_FILTERS.OVER_500:
      return customer.totalSpend > 500
    default:
      return true
  }
}

export function filterCustomerCatalog(
  customers,
  {
    search = '',
    segment = CUSTOMER_SEGMENTS.ALL,
    orderDateFilter = ORDER_DATE_FILTERS.ALL,
    spendFilter = SPEND_FILTERS.ALL,
  } = {},
) {
  return customers.filter(
    (customer) =>
      matchesSearch(customer, search)
      && matchesSegment(customer, segment)
      && matchesOrderDateFilter(customer, orderDateFilter)
      && matchesSpendFilter(customer, spendFilter),
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
