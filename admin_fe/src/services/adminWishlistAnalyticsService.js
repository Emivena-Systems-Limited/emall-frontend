import apiClient from '../lib/apiClient'
import {
  WISHLIST_ANALYTICS_ENDPOINTS,
  WISHLIST_PAGE_SIZE,
  WISHLIST_TOP_PRODUCTS_LIMIT,
} from '../constants/wishlistAnalytics'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractWishlistPagination,
  normalizeWishlistItems,
  normalizeWishlistStats,
  normalizeWishlistTopProducts,
} from '../utils/normalizeWishlistAnalytics'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

export async function fetchWishlistAnalyticsStats() {
  const { data } = await apiClient.get(WISHLIST_ANALYTICS_ENDPOINTS.STATS)
  const envelope = assertAuthEnvelope(data, 'Could not load wishlist stats.')
  return normalizeWishlistStats(envelope)
}

export async function fetchAdminWishlistItems({
  page = 1,
  perPage = WISHLIST_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(WISHLIST_ANALYTICS_ENDPOINTS.ITEMS, {
    params: compactParams({
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load saved items.')

  return {
    items: normalizeWishlistItems(envelope),
    pagination: extractWishlistPagination(envelope),
  }
}

export async function fetchWishlistTopProducts({ limit = WISHLIST_TOP_PRODUCTS_LIMIT } = {}) {
  const { data } = await apiClient.get(WISHLIST_ANALYTICS_ENDPOINTS.TOP_PRODUCTS, {
    params: compactParams({ limit }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load top saved listings.')
  return normalizeWishlistTopProducts(envelope)
}
