/** Same rules as hasBackendProductId — kept local to avoid circular imports. */
function isBackendProductId(productId) {
  const id = String(productId ?? '').trim()
  if (!id) return false
  if (/^product-\d+$/i.test(id)) return false
  return /^\d+$/.test(id) || /^[0-9a-z]{20,}$/i.test(id)
}

/** Slugify a product name (or slug fragment) for use in details URLs. */
export function slugifyProductName(value) {
  return String(value ?? 'product')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'product'
}

/**
 * Strip a trailing backend id segment from a slug so we don't double-append.
 * e.g. "brown-shirt-42" + id 42 → "brown-shirt"
 */
export function stripTrailingProductId(slug, productId) {
  const base = String(slug ?? '').replace(/^\/+/, '').replace(/^products\//, '')
  const id = String(productId ?? '').trim()
  if (!base || !id) return base
  const suffix = `-${id}`
  if (base.toLowerCase().endsWith(suffix.toLowerCase())) {
    return base.slice(0, -suffix.length).replace(/-$/, '') || base
  }
  return base
}

/**
 * Build /{name-slug}-{id} when a backend id is available.
 * Falls back to /{slug} or a provided href for mock/local products.
 */
export function buildProductDetailsHref(product = {}) {
  const productId = product.backendId ?? product.id ?? product.product_id ?? null
  const idText = productId != null ? String(productId).trim() : ''

  if (isBackendProductId(idText)) {
    const rawSlug = product.slug
      || product.product_slug
      || product.name
      || product.product_name
      || product.title
      || 'product'
    const nameSlug = slugifyProductName(stripTrailingProductId(rawSlug, idText))
    return `/${nameSlug}-${idText}`
  }

  if (product.href) {
    return String(product.href).replace(/^\/products\//, '/')
  }

  const slug = product.slug || product.product_slug
  return slug ? `/${String(slug).replace(/^\/+/, '')}` : '/'
}

/**
 * Extract a backend product id from a /:slug route param.
 * Supports:
 * - bare id: "42" or "abc...20chars"
 * - name-slug-id: "brown-shirt-42"
 */
export function extractProductIdFromRouteSlug(routeSlug) {
  const value = String(routeSlug ?? '').trim().replace(/^\/+/, '')
  if (!value) return null

  if (isBackendProductId(value)) return value

  const numericMatch = value.match(/-(\d+)$/)
  if (numericMatch && isBackendProductId(numericMatch[1])) {
    return numericMatch[1]
  }

  const alphaMatch = value.match(/-([0-9a-z]{20,})$/i)
  if (alphaMatch && isBackendProductId(alphaMatch[1])) {
    return alphaMatch[1]
  }

  return null
}
