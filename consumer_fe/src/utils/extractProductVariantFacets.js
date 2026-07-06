function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function toArray(value) {
  if (Array.isArray(value)) return value
  return []
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback
  const number = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(number) ? number : fallback
}

function normalizeFacetKey(key) {
  return String(key ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
}

function formatFacetLabel(key) {
  const normalized = normalizeFacetKey(key)
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function addFacetValue(facets, key, value) {
  if (!value) return
  const normalizedKey = normalizeFacetKey(key)
  if (!normalizedKey) return

  if (!facets[normalizedKey]) facets[normalizedKey] = new Set()
  facets[normalizedKey].add(String(value).trim())
}

function getMetadataValue(metadata, key) {
  if (!Array.isArray(metadata)) return undefined
  const item = metadata.find((entry) => entry && (entry.key === key || entry.meta_key === key))
  return item ? item.value ?? item.meta_value : undefined
}

export function extractSlimVariants(product) {
  return toArray(product.variants || product.variations).map((variant) => {
    const attributes = variant.attributes && typeof variant.attributes === 'object'
      ? variant.attributes
      : {}

    const colorKey = Object.keys(attributes).find((key) => key.toLowerCase() === 'color')
    const color = colorKey
      ? attributes[colorKey]
      : firstValue(variant.color, variant.colour, variant.variant_name)

    const size = firstValue(
      variant.size,
      attributes.size,
      attributes.Size,
      attributes.storage,
      attributes.Storage,
    )

    return {
      id: variant.id,
      price: toNumber(
        firstValue(
          variant.regular_discount_price,
          variant.discount_price,
          variant.sale_price,
          variant.price,
        ),
      ),
      color: color ? String(color) : null,
      size: size ? String(size) : null,
      variantName: variant.variant_name ? String(variant.variant_name) : null,
      attributes: Object.fromEntries(
        Object.entries(attributes).map(([key, value]) => [normalizeFacetKey(key), String(value)]),
      ),
    }
  })
}

export function extractVariantFacets(product) {
  const facets = {}
  const variants = extractSlimVariants(product)

  for (const variant of variants) {
    if (variant.color) addFacetValue(facets, 'color', variant.color)
    if (variant.size) addFacetValue(facets, 'size', variant.size)
    if (variant.variantName) addFacetValue(facets, 'style', variant.variantName)

    Object.entries(variant.attributes ?? {}).forEach(([key, value]) => {
      if (key === 'color') return
      addFacetValue(facets, key, value)
    })
  }

  if (!variants.length) {
    addFacetValue(facets, 'color', firstValue(product.color, product.colour))
    addFacetValue(facets, 'size', firstValue(product.size, product.storage))
  }

  return Object.fromEntries(
    Object.entries(facets).map(([key, values]) => [key, [...values].sort((a, b) => a.localeCompare(b))]),
  )
}

function isUsableCatalogPrice(value) {
  if (value === '' || value == null) return false
  const num = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(num) && num > 0
}

function pickRootPrice(...candidates) {
  for (const candidate of candidates) {
    if (isUsableCatalogPrice(candidate)) return toNumber(candidate)
  }
  return null
}

export function extractProductPriceRange(product) {
  const variants = extractSlimVariants(product)
  const variantPrices = variants.map((variant) => variant.price).filter((price) => price > 0)

  const salePrice = pickRootPrice(product.regular_discount_price, product.discount_price)
  const listPrice = pickRootPrice(product.regular_price)
  const basePrice = salePrice ?? listPrice ?? 0

  if (variantPrices.length) {
    return {
      min: Math.min(...variantPrices),
      max: Math.max(...variantPrices),
    }
  }

  return {
    min: basePrice,
    max: basePrice,
  }
}

export function enrichLandingProductForFilters(product, index = 0, options = {}) {
  const metadata = toArray(product.metadata)
  const variants = extractSlimVariants(product)
  const priceRange = extractProductPriceRange(product)

  return {
    variants,
    variantFacets: extractVariantFacets(product),
    brand: firstValue(
      product.brand?.brand_name,
      product.brand?.name,
      product.brand_name,
      typeof product.brand_id === 'object'
        ? product.brand_id?.brand_name ?? product.brand_id?.name
        : null,
      typeof product.brand === 'string' ? product.brand : null,
    ),
    condition: firstValue(getMetadataValue(metadata, 'condition'), product.condition),
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
  }
}

export { formatFacetLabel, normalizeFacetKey, getMetadataValue, toNumber }
