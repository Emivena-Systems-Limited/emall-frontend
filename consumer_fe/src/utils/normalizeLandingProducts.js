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

function getDiscountPercent(product, price, compareAt) {
  const explicit = firstValue(product.discount_percent, product.discountPercentage, product.discount)
  if (explicit !== undefined) {
    const explicitDiscount = toNumber(explicit, null)
    return explicitDiscount > 0 ? explicitDiscount : null
  }
  if (compareAt > price && price > 0) {
    return Math.round(((compareAt - price) / compareAt) * 100)
  }
  return null
}

function getMetadataValue(metadata, key) {
  if (!Array.isArray(metadata)) return undefined
  const item = metadata.find((m) => m && (m.key === key || m.meta_key === key))
  return item ? item.value ?? item.meta_value : undefined
}

export function normalizeLandingProduct(product, index = 0, options = {}) {
  if (!product || typeof product !== 'object') return null

  const variation = toArray(product.variants || product.variations)[0]
  const metadata = toArray(product.metadata)
  const id = firstValue(product.id, product.product_id, product.uuid, product.slug, `${options.prefix ?? 'product'}-${index}`)
  const name = firstValue(product.name, product.product_name, product.title, variation?.name, 'Product')
  const slug = firstValue(product.slug, product.product_slug, slugify(`${name}-${id}`))
  const price = toNumber(
    firstValue(
      product.discount_price,
      product.sale_price,
      product.selling_price,
      product.price,
      product.min_price,
      getMetadataValue(metadata, 'discount_price'),
      getMetadataValue(metadata, 'sale_price'),
      getMetadataValue(metadata, 'price'),
      variation?.discount_price,
      variation?.sale_price,
      variation?.price,
    ),
  )
  const compareAt = toNumber(
    firstValue(
      product.original_price,
      product.regular_price,
      product.compare_at,
      product.compareAt,
      product.market_price,
      product.old_price,
      getMetadataValue(metadata, 'original_price'),
      getMetadataValue(metadata, 'regular_price'),
      getMetadataValue(metadata, 'compare_at'),
      variation?.original_price,
      variation?.regular_price,
      variation?.price,
    ),
    null,
  )
  const discountPercent = getDiscountPercent(product, price, compareAt)

  return {
    id,
    name,
    variant: getVariantText(product),
    price,
    compareAt: compareAt > price ? compareAt : null,
    rating: toNumber(firstValue(product.rating, product.average_rating, product.avg_rating), 4.5),
    reviewCount: toNumber(firstValue(product.reviews_count, product.review_count, product.total_reviews), 0),
    href: `/${slug}`,
    image: getProductImage(product),
    discountPercent,
    isHot: Boolean(firstValue(product.is_hot, product.hot, product.is_flash_sale, options.isHot)),
  }
}

export function normalizeLandingProducts(products, options = {}) {
  return toArray(products)
    .map((product, index) => normalizeLandingProduct(product, index, options))
    .filter(Boolean)
}
