import apiClient from '../lib/apiClient'
import {
  CART_ANALYTICS_ENDPOINTS,
  CART_PAGE_SIZE,
  CART_TOP_PRODUCTS_LIMIT,
} from '../constants/cartAnalytics'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractCartPagination,
  normalizeAdminCarts,
  normalizeCartStats,
  normalizeCartTopProducts,
} from '../utils/normalizeCartAnalytics'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

export async function fetchCartAnalyticsStats() {
  const { data } = await apiClient.get(CART_ANALYTICS_ENDPOINTS.STATS)
  const envelope = assertAuthEnvelope(data, 'Could not load cart stats.')
  return normalizeCartStats(envelope)
}

export async function fetchAdminCarts({
  status = 'active',
  page = 1,
  perPage = CART_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(CART_ANALYTICS_ENDPOINTS.CARTS, {
    params: compactParams({
      status,
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load carts.')

  return {
    items: normalizeAdminCarts(envelope),
    pagination: extractCartPagination(envelope),
  }
}

export async function fetchCartTopProducts({ limit = CART_TOP_PRODUCTS_LIMIT } = {}) {
  const { data } = await apiClient.get(CART_ANALYTICS_ENDPOINTS.TOP_PRODUCTS, {
    params: compactParams({ limit }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load top cart products.')
  return normalizeCartTopProducts(envelope)
}
