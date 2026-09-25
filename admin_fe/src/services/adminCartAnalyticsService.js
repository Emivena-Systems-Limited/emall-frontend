import apiClient from '../lib/apiClient'
import {
  CART_ANALYTICS_ENDPOINTS,
  CART_PAGE_SIZE,
  CART_TOP_PRODUCTS_LIMIT,
} from '../constants/cartAnalytics'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  deriveCartStatsFromCarts,
  extractCartPagination,
  mergeCartStats,
  normalizeAdminCarts,
  normalizeCartStats,
  normalizeCartTopProducts,
  paginateCartRecords,
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
  const stats = normalizeCartStats(envelope)
  const needsFallback = !stats.totalItems || !stats.totalValue || !stats.withItems || !stats.active || !stats.total

  if (!needsFallback) return stats

  try {
    const { data: cartsData } = await apiClient.get(CART_ANALYTICS_ENDPOINTS.CARTS, {
      params: compactParams({
        status: 'active',
        page: 1,
        per_page: 100,
        ...LATEST_FIRST_QUERY,
      }),
    })
    const cartsEnvelope = assertAuthEnvelope(cartsData, 'Could not load carts.')
    const derived = deriveCartStatsFromCarts(normalizeAdminCarts(cartsEnvelope))
    return mergeCartStats({
      ...stats,
      active: stats.active || derived.withItems,
    }, derived)
  } catch {
    return stats
  }
}

export async function fetchAdminCarts({
  status = 'active',
  owner = '',
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
  const normalized = normalizeAdminCarts(envelope)
  const items = normalized.filter((cart) => {
    if (cart.itemsCount <= 0) return false
    if (owner === 'guest') return cart.isGuest
    if (owner === 'shopper') return !cart.isGuest
    return true
  })
  const pagination = extractCartPagination(envelope)
  const hidden = normalized.length - items.length
  const total = Math.max(items.length, pagination.total - hidden)

  return paginateCartRecords(items, {
    page,
    perPage,
    total,
  })
}

export async function fetchCartTopProducts({ limit = CART_TOP_PRODUCTS_LIMIT } = {}) {
  const { data } = await apiClient.get(CART_ANALYTICS_ENDPOINTS.TOP_PRODUCTS, {
    params: compactParams({ limit }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load top cart products.')
  return normalizeCartTopProducts(envelope)
}
