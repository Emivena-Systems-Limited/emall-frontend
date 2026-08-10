import { CUSTOMERS_PAGE_SIZE, CUSTOMER_ENDPOINTS } from '../constants/customers'
import {
  getCustomerById as getMockCustomerById,
  getCustomerSummaryFromCatalog,
  MOCK_VENDOR_CUSTOMERS,
} from '../mocks/customerMockData'
import {
  filterCustomerCatalog,
  paginateCustomers,
} from '../utils/customerCatalogFilters'

const MOCK_DELAY_MS = 450

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function buildPaginatedResponse(customers, { page = 1, pageSize = CUSTOMERS_PAGE_SIZE } = {}) {
  const pagination = paginateCustomers(customers, { page, pageSize })

  return {
    data: pagination.items,
    current_page: pagination.page,
    per_page: pagination.pageSize,
    total: pagination.totalItems,
    last_page: pagination.pageCount,
  }
}

// TODO: Replace mock implementation when Vendor Customers API is available.
export async function getCustomers({ page = 1, pageSize = CUSTOMERS_PAGE_SIZE } = {}) {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[customers] GET (mock)', CUSTOMER_ENDPOINTS.LIST)
  }

  return buildPaginatedResponse(MOCK_VENDOR_CUSTOMERS, { page, pageSize })
}

// TODO: Integrate customer statistics API.
export async function getCustomerStats() {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[customers] GET (mock)', CUSTOMER_ENDPOINTS.STATS)
  }

  return getCustomerSummaryFromCatalog(MOCK_VENDOR_CUSTOMERS)
}

// TODO: Integrate customer details API.
export async function getCustomer(customerId) {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[customers] GET (mock)', CUSTOMER_ENDPOINTS.byId(customerId))
  }

  const customer = getMockCustomerById(customerId)
  if (!customer) {
    throw new Error('Customer not found.')
  }

  return customer
}

// TODO: Integrate customer search API — currently filters mock data locally.
export async function searchCustomers({
  search = '',
  segment,
  orderDateRange,
  minSpend = '',
  maxSpend = '',
  page = 1,
  pageSize = CUSTOMERS_PAGE_SIZE,
} = {}) {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[customers] GET (mock)', CUSTOMER_ENDPOINTS.SEARCH, {
      search,
      segment,
      orderDateRange,
      minSpend,
      maxSpend,
      page,
    })
  }

  const filtered = filterCustomerCatalog(MOCK_VENDOR_CUSTOMERS, {
    search,
    segment,
    orderDateRange,
    minSpend,
    maxSpend,
  })

  return buildPaginatedResponse(filtered, { page, pageSize })
}
