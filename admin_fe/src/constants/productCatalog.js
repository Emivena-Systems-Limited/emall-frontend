import { LOW_STOCK_THRESHOLD } from './lowStockData'

export { LOW_STOCK_THRESHOLD }

export const SUMMARY_FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LOW_STOCK: 'low_stock',
}

export function isLowStockProduct(product) {
  if (product.stock == null || product.stock === '') return false
  const threshold = product.lowStockThreshold ?? LOW_STOCK_THRESHOLD
  return product.stock <= threshold
}

export function getCatalogSummary(products) {
  return {
    listed: products.length,
    active: products.filter((product) => product.status === 'active').length,
    inactive: products.filter((product) => product.status === 'inactive').length,
    lowStock: products.filter(isLowStockProduct).length,
  }
}
