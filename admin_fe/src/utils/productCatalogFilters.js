import { isLowStockProduct, SUMMARY_FILTERS } from '../constants/productCatalog'

export function sortCatalogProductsLatestFirst(products = []) {
  return [...products].sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : Number.NaN
    const bTime = b.createdAt ? Date.parse(b.createdAt) : Number.NaN

    if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
      return bTime - aTime
    }

    if (Number.isFinite(aTime) !== Number.isFinite(bTime)) {
      return Number.isFinite(bTime) - Number.isFinite(aTime)
    }

    return String(b.id ?? '').localeCompare(String(a.id ?? ''))
  })
}

export function filterProductCatalog(products, { search, category, brand, summaryFilter }) {
  const query = search.trim().toLowerCase()

  return products.filter((product) => {
    if (summaryFilter === SUMMARY_FILTERS.ACTIVE && product.status !== 'active') return false
    if (summaryFilter === SUMMARY_FILTERS.INACTIVE && product.status !== 'inactive') return false
    if (summaryFilter === SUMMARY_FILTERS.LOW_STOCK && !isLowStockProduct(product)) return false
    if (category && product.categorySlug !== category) return false
    if (brand && product.brandSlug !== brand) return false

    if (!query) return true

    return [
      product.name,
      product.sku,
      product.brand,
      product.category,
      product.subcategory,
    ].some((value) => String(value ?? '').toLowerCase().includes(query))
  })
}

function buildFilterOptions(products, slugKey, labelKey, allLabel) {
  const options = new Map()

  products.forEach((product) => {
    const slug = product[slugKey]
    const label = product[labelKey]

    if (!slug || !label || label === '—') return
    options.set(slug, label)
  })

  return [
    { value: '', label: allLabel },
    ...Array.from(options, ([value, label]) => ({ value, label }))
      .sort((left, right) => left.label.localeCompare(right.label)),
  ]
}

export function buildCatalogFilterOptions(products = []) {
  return {
    categoryOptions: buildFilterOptions(products, 'categorySlug', 'category', 'All categories'),
    brandOptions: buildFilterOptions(products, 'brandSlug', 'brand', 'All brands'),
  }
}
