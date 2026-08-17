import apiClient from '../lib/apiClient'
import { ORDER_ENDPOINTS } from '../constants/orders'
import { PRODUCT_ENDPOINTS } from '../constants/products'
import { getProductPaginationMeta } from '../utils/normalizeProducts'
import { extractVendorOrdersPagination } from '../utils/normalizeVendorOrders'
import { assertApiSuccess } from './authService'
import { getAllProducts } from './productService'
import { getVendorReviewsSummary } from './reviewService'

async function getVendorProductCount() {
  const { data } = await apiClient.get(PRODUCT_ENDPOINTS.LIST, { params: { page: 1 } })
  assertApiSuccess(data)

  const { total } = getProductPaginationMeta(data)
  if (Number.isFinite(total)) return total

  // Older responses omit paginator totals, so retain a correct fallback.
  const products = await getAllProducts()
  return products.length
}

async function getVendorOrderCount() {
  const { data } = await apiClient.get(ORDER_ENDPOINTS.VENDOR_LIST, { params: { page: 1 } })
  assertApiSuccess(data)

  return extractVendorOrdersPagination(data).total
}

async function getVendorAverageRating() {
  const summary = await getVendorReviewsSummary()
  return Number(summary.averageRating) || 0
}

export async function getVendorMetrics() {
  const results = await Promise.allSettled([
    getVendorProductCount(),
    getVendorOrderCount(),
    getVendorAverageRating(),
  ])

  const [products, orders, rating] = results
  const rejected = results.filter((result) => result.status === 'rejected')

  if (rejected.length === results.length) {
    throw rejected[0].reason
  }

  return {
    productsListed: products.status === 'fulfilled' ? products.value : null,
    totalOrders: orders.status === 'fulfilled' ? orders.value : null,
    averageRating: rating.status === 'fulfilled' ? rating.value : null,
    hasPartialError: rejected.length > 0,
  }
}
