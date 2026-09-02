import { normalizeLandingProduct } from './normalizeLandingProducts'

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function uniqueOptions(options = []) {
  const map = new Map()
  options.forEach((option) => {
    if (!option?.id) return
    if (!map.has(String(option.id))) {
      map.set(String(option.id), {
        id: String(option.id),
        label: String(option.label || option.id),
      })
    }
  })
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
}

function facetOptionFromValue(value, label) {
  if (value == null || value === '') return null
  return { id: String(value), label: String(label || value) }
}

/** Catalog contract: `{ data: { products, pagination } }`. */
export function extractCatalogPayload(payload) {
  const envelope = asObject(payload)
  if (!envelope) return { products: [], pagination: null }

  if (Array.isArray(envelope.products)) {
    return {
      products: envelope.products,
      pagination: asObject(envelope.pagination),
    }
  }

  const nested = asObject(envelope.data)
  if (nested && Array.isArray(nested.products)) {
    return {
      products: nested.products,
      pagination: asObject(nested.pagination),
    }
  }

  return { products: [], pagination: asObject(envelope.pagination) }
}

export function extractCatalogPagination(payload, fallbackCount = 0, request = {}) {
  const { pagination } = extractCatalogPayload(payload)
  const source = pagination ?? {}

  const currentPage = Number(firstValue(
    source.current_page,
    source.currentPage,
    source.page,
    request.page,
    1,
  )) || 1
  const perPage = Number(firstValue(
    source.per_page,
    source.perPage,
    request.per_page,
    20,
  )) || 20
  const total = Number(firstValue(source.total, source.total_count, fallbackCount))
  const lastPage = Number(firstValue(
    source.last_page,
    source.lastPage,
    source.total_pages,
    Math.max(1, Math.ceil((Number.isFinite(total) ? total : fallbackCount) / perPage)),
  )) || 1

  return {
    currentPage,
    lastPage: Math.max(1, lastPage),
    perPage,
    total: Number.isFinite(total) ? total : fallbackCount,
  }
}

function collectFacetValues(product, keys = []) {
  const values = []
  keys.forEach((key) => {
    ;(product.variantFacets?.[key] ?? []).forEach((value) => values.push(value))
  })
  ;(product.variants ?? []).forEach((variant) => {
    keys.forEach((key) => {
      const fromVariant = variant?.[key]
      if (fromVariant) values.push(fromVariant)
    })
  })
  return values
}

export function collectProductFacets(products = []) {
  const brands = []
  const colors = []
  const sizes = []
  const stores = []

  products.forEach((product) => {
    if (product.brand) brands.push(facetOptionFromValue(product.brand, product.brand))
    collectFacetValues(product, ['color', 'colour']).forEach((value) => {
      colors.push(facetOptionFromValue(value, value))
    })
    collectFacetValues(product, ['size', 'storage']).forEach((value) => {
      sizes.push(facetOptionFromValue(value, value))
    })
    if (product.storeId) {
      stores.push(facetOptionFromValue(product.storeId, product.storeName || product.storeId))
    }
  })

  return {
    brands: uniqueOptions(brands),
    colors: uniqueOptions(colors),
    sizes: uniqueOptions(sizes),
    stores: uniqueOptions(stores),
  }
}

export function mergeCatalogFacets(...facetSets) {
  return {
    brands: uniqueOptions(facetSets.flatMap((set) => set?.brands ?? [])),
    colors: uniqueOptions(facetSets.flatMap((set) => set?.colors ?? [])),
    sizes: uniqueOptions(facetSets.flatMap((set) => set?.sizes ?? [])),
    stores: uniqueOptions(facetSets.flatMap((set) => set?.stores ?? [])),
  }
}

export function normalizeProductCatalog(payload, request = {}) {
  const { products: rawProducts } = extractCatalogPayload(payload)
  const isHot = request.filter === 'flash_sales'

  const products = rawProducts
    .map((product, index) => normalizeLandingProduct(product, index, {
      prefix: 'catalog',
      isHot,
    }))
    .filter(Boolean)

  return {
    products,
    pagination: extractCatalogPagination(payload, products.length, request),
    facets: collectProductFacets(products),
  }
}
