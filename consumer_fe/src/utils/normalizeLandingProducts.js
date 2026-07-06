import { enrichLandingProductForFilters } from './extractProductVariantFacets'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80'

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.products)) return value.products
  return []
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback
  const number = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(number) ? number : fallback
}

export function isProductActive(product) {
  if (!product || typeof product !== 'object') return false
  const status = firstValue(product.is_active, product.isActive, product.active)
  if (status === undefined) return true
  if (typeof status === 'boolean') return status
  if (typeof status === 'number') return status === 1
  const normalized = String(status).trim().toLowerCase()
  return ['true', '1', 'yes', 'active'].includes(normalized)
}

function slugify(value) {
  return String(value ?? 'product')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getNestedImage(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  return firstValue(
    value.url,
    value.image_url,
    value.image,
    value.path,
    value.secure_url,
    value.thumbnail,
  )
}

function getProductImage(product) {
  const images = toArray(product.images)
  const gallery = toArray(product.gallery)
  const productImages = toArray(product.product_images)
  const variationImages = toArray(product.variants?.[0]?.images || product.variations?.[0]?.images)

  return firstValue(
    getNestedImage(product.primary_image),
    getNestedImage(product.featured_image),
    getNestedImage(product.thumbnail),
    getNestedImage(product.image),
    getNestedImage(product.image_url),
    getNestedImage(images[0]),
    getNestedImage(gallery[0]),
    getNestedImage(productImages[0]),
    getNestedImage(variationImages[0]),
    FALLBACK_IMAGE,
  )
}

function getVariantText(product) {
  const variation = toArray(product.variants || product.variations)[0]
  const color = firstValue(product.color, product.colour, variation?.color, variation?.colour)
  const size = firstValue(product.size, variation?.size)
  const category = firstValue(
    product.category?.name,
    product.category?.category_name,
    product.category_name,
  )
  const store = firstValue(product.store?.name, product.store?.store_name, product.vendor?.name)
  const parts = [color && `Color:${color}`, size && `Size:${size}`].filter(Boolean)

  return parts.join('  ') || firstValue(product.variant, category, store, 'E-Mall product')
}

function isUsablePrice(value) {
  if (value === '' || value == null) return false
  const num = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(num) && num > 0
}

function pickFirstUsablePrice(...candidates) {
  for (const candidate of candidates) {
    if (isUsablePrice(candidate)) return toNumber(candidate)
  }
  return null
}

function resolveProductCardPrices(product, variation) {
  const listPrice = pickFirstUsablePrice(
    product.regular_price,
    variation?.regular_price,
  )

  const salePrice = pickFirstUsablePrice(
    product.regular_discount_price,
    product.discount_price,
    variation?.regular_discount_price,
    variation?.discount_price,
  )

  const price = salePrice ?? listPrice ?? 0
  const compareAt = listPrice != null && salePrice != null && listPrice > salePrice ? listPrice : null

  return { price, compareAt }
}

function getDiscountPercent(product, price, compareAt) {
  const explicit = firstValue(product.discount_percent, product.discountPercentage, product.discount)
  if (explicit !== undefined) {
    const explicitDiscount = toNumber(explicit, null)
    return explicitDiscount > 0 ? explicitDiscount : null
  }
  if (compareAt != null && compareAt > price && price > 0) {
    return Math.round(((compareAt - price) / compareAt) * 100)
  }
  return null
}

export function normalizeLandingProduct(product, index = 0, options = {}) {
  if (!product || typeof product !== 'object') return null
  if (!isProductActive(product)) return null

  const variation = toArray(product.variants || product.variations)[0]
  const backendId = firstValue(product.id, product.product_id, product.uuid)
  const id = backendId ?? `${options.prefix ?? 'product'}-${index}`
  const name = firstValue(product.name, product.product_name, product.title, variation?.name, 'Product')
  const slug = firstValue(product.slug, product.product_slug, slugify(`${name}-${id}`))
  const { price, compareAt } = resolveProductCardPrices(product, variation)
  const discountPercent = getDiscountPercent(product, price, compareAt)
  const categoryRecord = product.category && typeof product.category === 'object' ? product.category : null
  const subcategoryRecord =
    product.subcategory && typeof product.subcategory === 'object' ? product.subcategory : null
  const filterFields = enrichLandingProductForFilters(product, index, options)
  const priceRange = { min: filterFields.minPrice, max: filterFields.maxPrice }

  return {
    id,
    backendId: backendId ?? null,
    syncable: Boolean(backendId),
    name,
    variant: getVariantText(product),
    price,
    compareAt,
    rating: toNumber(firstValue(product.rating, product.average_rating, product.avg_rating), 4.5),
    reviewCount: toNumber(firstValue(product.reviews_count, product.review_count, product.total_reviews), 0),
    href: `/${slug}`,
    image: getProductImage(product),
    discountPercent,
    isHot: Boolean(firstValue(product.is_hot, product.hot, product.is_flash_sale, options.isHot)),
    category: firstValue(
      categoryRecord?.category_name,
      categoryRecord?.name,
      product.category_name,
      typeof product.category === 'string' ? product.category : null,
    ),
    categorySlug: firstValue(categoryRecord?.slug, product.category_slug),
    subcategory: firstValue(
      subcategoryRecord?.category_name,
      subcategoryRecord?.name,
      product.subcategory_name,
      typeof product.subcategory === 'string' ? product.subcategory : null,
    ),
    subcategorySlug: firstValue(subcategoryRecord?.slug, product.subcategory_slug),
    variants: filterFields.variants,
    variantFacets: filterFields.variantFacets,
    brand: filterFields.brand,
    condition: filterFields.condition,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
  }
}

export function normalizeLandingProducts(products, options = {}) {
  return toArray(products)
    .map((product, index) => normalizeLandingProduct(product, index, options))
    .filter(Boolean)
}
