import { isLowStockProduct, SUMMARY_FILTERS } from '../constants/productCatalog'

export function filterProductCatalog(products, { search, category, brand, summaryFilter }) {
  const query = search.trim().toLowerCase()

  return products.filter((product) => {
    if (summaryFilter === SUMMARY_FILTERS.ACTIVE && product.status !== 'active') return false
    if (summaryFilter === SUMMARY_FILTERS.LOW_STOCK && !isLowStockProduct(product)) return false
    if (category && product.categorySlug !== category) return false
    if (brand && product.brandSlug !== brand) return false

    if (!query) return true

    return [
      product.name,
      product.sku,
      product.brand,
      product.category,
    ].some((value) => value.toLowerCase().includes(query))
  })
}
