import apiClient from '../lib/apiClient'
import { CUSTOMER_ENDPOINTS } from '../constants/customers'
import {
  getCustomerById as getMockCustomerById,
  getCustomerSummaryFromCatalog,
  MOCK_VENDOR_CUSTOMERS,
} from '../mocks/customerMockData'
import { filterCustomerCatalog, paginateCustomers } from '../utils/customerCatalogFilters'
import {
  extractVendorCustomerList,
  extractVendorCustomersPagination,
  extractVendorCustomerRecord,
  normalizeVendorCustomerRecord,
  normalizeVendorCustomersList,
} from '../utils/normalizeVendorCustomers'
import { assertApiSuccess } from './authService'

const MOCK_DELAY_MS = 450

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function buildPaginatedResponse(customers, { page = 1, pageSize = 10 } = {}) {
  const pagination = paginateCustomers(customers, { page, pageSize })

  return {
    data: pagination.items,
    current_page: pagination.page,
    per_page: pagination.pageSize,
    total: pagination.totalItems,
    last_page: pagination.pageCount,
  }
}

async function fetchCustomersPage(page = 1) {
  const { data } = await apiClient.get(CUSTOMER_ENDPOINTS.LIST, { params: { page } })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[customers] GET', CUSTOMER_ENDPOINTS.LIST, { page }, data)
  }

  return data
}

export async function getCustomers({ page = 1 } = {}) {
  const firstResponse = await fetchCustomersPage(page)
  const customers = normalizeVendorCustomersList(extractVendorCustomerList(firstResponse))
  const { lastPage } = extractVendorCustomersPagination(firstResponse)

  if (lastPage <= 1) {
    return customers
  }

  const remainingPages = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) => fetchCustomersPage(index + 2)),
  )

  return [
    ...customers,
    ...remainingPages.flatMap((response) =>
      normalizeVendorCustomersList(extractVendorCustomerList(response)),
    ),
  ]
}

// TODO: Integrate customer details API when stats endpoint is available.
export async function getCustomerStats() {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[customers] GET (mock)', CUSTOMER_ENDPOINTS.STATS)
  }

  return getCustomerSummaryFromCatalog(MOCK_VENDOR_CUSTOMERS)
}

// Customer profile for the detail page.
export async function getCustomer(customerId) {
  const id = String(customerId ?? '').trim()
  if (!id) {
    throw new Error('Customer id is required.')
  }

  const endpoint = CUSTOMER_ENDPOINTS.byId(id)
  const { data } = await apiClient.get(endpoint)

  if (import.meta.env.DEV) {
    console.info('[customers] GET', endpoint, data)
  }

  assertApiSuccess(data)
  const record = extractVendorCustomerRecord(data)
  if (!record) {
    throw new Error('Customer not found.')
  }

  return normalizeVendorCustomerRecord(record)
}

// TODO: Integrate customer search API — currently filters mock data locally.
export async function searchCustomers({
  search = '',
  segment,
  orderDateRange,
  minSpend = '',
  maxSpend = '',
  page = 1,
  pageSize = 10,
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
