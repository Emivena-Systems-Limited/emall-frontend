export const CUSTOMERS_PAGE_SIZE = 10

export const CUSTOMER_ENDPOINTS = {
  LIST: '/api/vendor/get-customers',
  STATS: '/api/vendor/customers/stats',
  SEARCH: '/api/vendor/customers/search',
  byId: (customerId) => `/api/vendor/get-customer/${customerId}`,
}

export const CUSTOMER_SEGMENTS = {
  ALL: 'all',
  NEW_THIS_MONTH: 'new-this-month',
}

export const SUMMARY_CARD_ROUTES = {
  total: '/customers',
  newThisMonth: '/customers?segment=new-this-month',
  // TODO: Connect to Reviews module/API when vendor reviews endpoint is finalized.
  reviews: '/reviews',
}

export const DEFAULT_ORDER_DATE_RANGE = {
  startDate: '',
  endDate: '',
}

export function getCustomerOrdersRoute(
  customerId,
  { orderDateRange = DEFAULT_ORDER_DATE_RANGE, minSpend = '', maxSpend = '' } = {},
) {
  const params = new URLSearchParams()
  params.set('customerId', customerId)

  if (orderDateRange.startDate) params.set('start_date', orderDateRange.startDate)
  if (orderDateRange.endDate) params.set('end_date', orderDateRange.endDate)
  if (minSpend !== '') params.set('min_total', String(minSpend))
  if (maxSpend !== '') params.set('max_total', String(maxSpend))

  return `/orders?${params.toString()}`
}

export function resolveCustomerSegment(searchParams) {
  const segment = searchParams.get('segment')
  const filter = searchParams.get('filter')

  if (
    segment === CUSTOMER_SEGMENTS.NEW_THIS_MONTH
    || filter === CUSTOMER_SEGMENTS.NEW_THIS_MONTH
    || filter === 'new-this-month'
  ) {
    return CUSTOMER_SEGMENTS.NEW_THIS_MONTH
  }

  return CUSTOMER_SEGMENTS.ALL
}
