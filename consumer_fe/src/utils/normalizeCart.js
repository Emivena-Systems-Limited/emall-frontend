import { buildCartItem } from '../store/slices/cartSlice'

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.cart_items)) return value.cart_items
  return []
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') return null
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : null
}

function isCartItemRecord(value) {
  return value != null
    && typeof value === 'object'
    && !Array.isArray(value)
    && (value.product_id != null || value.productId != null || value.id != null)
}

function isCartLinePayload(value) {
  if (!isCartItemRecord(value)) return false
  if (value?.summary != null) return false
  if (Array.isArray(value?.items) || Array.isArray(value?.cart_items) || Array.isArray(value?.lines)) {
    return false
  }
  return value.product_id != null || value.productId != null
}

/** API may return items as { "0": {...}, "1": {...} } instead of an array. */
function cartItemsFromValue(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []

  const values = Object.values(value)
  if (values.length > 0 && values.every(isCartItemRecord)) {
    return values
  }

  return []
}

function resolveCartItemsList(value) {
  const fromArray = toArray(value)
  if (fromArray.length > 0) return fromArray
  return cartItemsFromValue(value)
}

function resolveImageSource(images) {
  if (typeof images === 'string' && images) return images
  if (!Array.isArray(images) || images.length === 0) return null

  const first = images[0]
  if (typeof first === 'string') return first
  return first?.url ?? first?.image_url ?? first?.image ?? null
}

function getImage(record) {
  const product = record.product ?? record.item ?? {}
  const variant = record.variant ?? record.product_variant ?? product.variant ?? {}

  const recordImage = resolveImageSource(
    firstValue(record.images, record.variant_images, record.image, record.image_url),
  )
  if (recordImage) return recordImage

  const variantImage = resolveImageSource(variant.images ?? variant.variant_images)
  if (variantImage) return variantImage

  const productImages = product.images ?? product.product_images ?? []
  const productImage = resolveImageSource(productImages)
  if (productImage) return productImage

  return firstValue(
    product.image,
    product.image_url,
    product.thumbnail,
  )
}

function resolveCartLinePricing(record, quantity) {
  const unitPrice = toNumber(firstValue(record.unit_price, record.price))
  const discountAmount = toNumber(record.discount_amount)
  const qty = Math.max(1, Number(quantity) || 1)
  const hasSaleDiscount = discountAmount != null && discountAmount > 0

  // discount_amount is the per-unit sale price → line total = discount_amount × quantity
  if (hasSaleDiscount) {
    const displaySubtotal = discountAmount * qty
    const compareAt = unitPrice != null && unitPrice > discountAmount
      ? unitPrice
      : toNumber(firstValue(record.compare_at, record.original_price))
    const listLineTotal = unitPrice != null ? unitPrice * qty : null
    const lineSavings = listLineTotal != null && listLineTotal > displaySubtotal
      ? listLineTotal - displaySubtotal
      : null

    return {
      price: discountAmount,
      compareAt,
      displaySubtotal,
      lineSavings,
    }
  }

  // No discount — line total = unit_price × quantity
  const price = unitPrice ?? 0
  const displaySubtotal = price * qty
  const compareAt = toNumber(firstValue(record.compare_at, record.original_price))

  return {
    price,
    compareAt,
    displaySubtotal,
    lineSavings: null,
  }
}

export function normalizeCartItem(record) {
  const product = record.product ?? record.item ?? {}
  const variant = record.variant ?? record.product_variant ?? product.variant ?? {}
  const productId = firstValue(record.product_id, product.id, product.product_id)
  const variantId = firstValue(record.product_variant_id, record.variant_id, variant.id)
  const cartItemId = firstValue(record.id, record.cart_item_id, record.item_id)
  const quantity = firstValue(record.quantity, record.qty, 1)
  const pricing = resolveCartLinePricing(record, quantity)

  return buildCartItem({
    cartItemId,
    productId,
    product_id: productId,
    syncable: Boolean(productId && cartItemId),
    variantId,
    sku: firstValue(record.sku, variant.sku, product.sku),
    name: firstValue(record.product_name, product.name, product.product_name, product.title, record.name),
    title: firstValue(record.product_name, product.title, product.name, record.name),
    variant: firstValue(record.variant_name, variant.variant_name, variant.name, record.color, product.color),
    storage: firstValue(record.storage, record.size, variant.size, variant.sku),
    price: pricing.price,
    compareAt: pricing.compareAt ?? firstValue(variant.price, product.original_price),
    displaySubtotal: pricing.displaySubtotal,
    lineSavings: pricing.lineSavings,
    quantity,
    image: getImage(record),
    href: product.slug ? `/${product.slug}` : (productId ? `/${productId}` : undefined),
    selected: record.is_selected ?? record.selected ?? true,
    seller: firstValue(product.store?.store_name, product.store?.name, product.vendor?.name, record.store_name),
  })
}

function pickProductList(root, ...keys) {
  for (const key of keys) {
    const list = toArray(root?.[key])
    if (list.length) return list
  }
  return []
}

export function extractCartRecommendations(payload) {
  const root = payload?.recommendations ?? payload?.data ?? payload ?? {}

  const bestSellers = pickProductList(
    root,
    'best_sellers',
    'bestSellers',
    'seller_deals',
    'deals',
  )
  const related = pickProductList(
    root,
    'related_products',
    'related',
    'related_items',
    'similar_products',
  )
  const recommended = pickProductList(
    root,
    'recommended_products',
    'recommended',
    'recommendations',
    'products',
    'items',
  )

  if (!bestSellers.length && !related.length && !recommended.length && Array.isArray(root)) {
    return { bestSellers: [], related: [], recommended: root }
  }

  return { bestSellers, related, recommended }
}

/** GET /api/cart/items → { data: { items: [...], summary: {...} } } (fields may also be unwrapped). */
export function resolveCartDataRoot(payload) {
  if (!payload || typeof payload !== 'object') return null

  const candidates = [
    payload,
    payload.data,
    payload.cart,
    payload.data?.cart,
  ].filter((candidate) => candidate && typeof candidate === 'object')

  for (const candidate of candidates) {
    if (
      Array.isArray(candidate.items)
      || Array.isArray(candidate.cart_items)
      || Array.isArray(candidate.lines)
    ) {
      return candidate
    }
  }

  return payload.data ?? payload
}

export function extractCartItems(payload) {
  if (!payload) return []

  const root = resolveCartDataRoot(payload)
  const list = resolveCartItemsList(root?.items ?? root?.cart_items ?? root?.lines)

  let items = []
  if (list.length > 0) {
    items = list.map(normalizeCartItem).filter(Boolean)
  } else if (root?.summary == null && !isCartLinePayload(root)) {
    items = resolveCartItemsList(root).map(normalizeCartItem).filter(Boolean)
  }

  const seen = new Set()
  return items.filter((item) => {
    const dedupeKey = item.cartItemId ?? item.id ?? item.key
    if (seen.has(dedupeKey)) return false
    seen.add(dedupeKey)
    return true
  })
}

/** POST /api/cart → data.guest_cart_id. Never use cart_id or line-item id here. */
export function extractGuestCartId(payload) {
  if (!payload) return null

  const root = payload?.cart ?? payload?.data?.cart ?? payload?.data ?? payload
  const guestCart = root?.guest_cart ?? payload?.guest_cart ?? payload?.data?.guest_cart

  return firstValue(
    payload?.guest_cart_id,
    payload?.guestCartId,
    root?.guest_cart_id,
    root?.guestCartId,
    guestCart?.guest_cart_id,
    guestCart?.guestCartId,
    guestCart?.uuid,
    payload?.uuid,
  ) ?? null
}

/** GET /api/cart/items → data.summary with selected_items_count, subtotal, discount, total. */
export function extractCartSummary(payload) {
  if (!payload) return null

  const root = resolveCartDataRoot(payload)
  return root?.summary ?? payload?.summary ?? null
}

export function buildAddToCartPayload(item) {
  const productId = item?.productId ?? item?.product_id
  const variantId = item?.variantId ?? item?.product_variant_id ?? item?.variant_id
  const quantity = Math.max(1, Number(item?.quantity) || 1)

  if (productId == null || productId === '') {
    throw new Error('product_id is required to add an item to cart')
  }

  const payload = {
    product_id: productId,
    quantity,
  }

  if (variantId != null && variantId !== '') {
    payload.product_variant_id = variantId
  }

  return payload
}

export function parseAddToCartResponse(response) {
  if (!response || typeof response !== 'object') return null

  // POST /api/cart/guest/add-item → data: { id, cart_id, product_id, unit_price, ... }
  const record = firstValue(
    response.item,
    response.cart_item,
    response.data?.item,
    response.data?.cart_item,
    response.data,
    response,
  )

  if (!record || typeof record !== 'object') return null
  if (record.product_id == null && record.productId == null) return null

  return normalizeCartItem(record)
}

/** Apply a single line-item mutation response onto the matching Redux row. */
export function applyCartLineMutationResponse(localItem, response) {
  const apiItem = parseAddToCartResponse(response)
  if (!apiItem?.productId) return localItem ?? null
  return mergeGuestAddItemWithLocal(apiItem, localItem)
}

/** Apply a single line-item API response onto an existing cart row. */
export function mergeCartItemUpdate(localItem, response) {
  return applyCartLineMutationResponse(localItem, response)
}

/** Merge API line item with local product details the add-item response omits. */
export function mergeGuestAddItemWithLocal(apiItem, localItem) {
  if (!apiItem?.productId) return localItem ?? null
  if (!localItem) return apiItem

  const lineItemId = apiItem.cartItemId ?? apiItem.id
  const apiPrice = Number(apiItem.price)
  const quantity = apiItem.quantity ?? localItem.quantity
  const displaySubtotal = apiItem.displaySubtotal ?? (
    Number.isFinite(apiPrice) && apiPrice > 0 ? apiPrice * quantity : localItem.displaySubtotal
  )

  return {
    ...localItem,
    ...apiItem,
    cartItemId: lineItemId,
    id: lineItemId ?? localItem.id,
    name: localItem.name || apiItem.name,
    price: Number.isFinite(apiPrice) && apiPrice > 0 ? apiPrice : localItem.price,
    compareAt: apiItem.compareAt ?? localItem.compareAt,
    image: localItem.image || apiItem.image,
    href: localItem.href || apiItem.href,
    variant: localItem.variant || apiItem.variant,
    storage: localItem.storage || apiItem.storage,
    seller: localItem.seller || apiItem.seller,
    quantity,
    displaySubtotal,
    lineSavings: apiItem.lineSavings ?? localItem.lineSavings,
    selected: apiItem.selected ?? localItem.selected ?? true,
    syncable: true,
  }
}

export function canSyncCartItem(item) {
  if (!item?.productId) return false

  const productId = String(item.productId)
  if (/^\d+$/.test(productId)) return true
  if (/^[0-9a-z]{20,}$/i.test(productId)) return true

  if (item.syncable === false) return false
  return Boolean(item.syncable)
}

export function hasBackendProductId(productId) {
  const id = String(productId ?? '').trim()
  if (!id) return false
  if (/^product-\d+$/i.test(id)) return false
  return /^\d+$/.test(id) || /^[0-9a-z]{20,}$/i.test(id)
}

/** True when the item has a product_id worth sending to cart APIs (not local mock ids). */
export function canSyncToApi(item) {
  if (!item?.productId) return false

  const productId = String(item.productId).trim()
  if (!productId) return false
  if (/^product-\d+$/i.test(productId)) return false

  return true
}

export function buildUpdateCartQuantityPayload(quantity) {
  return {
    quantity: Math.max(1, Number(quantity) || 1),
  }
}

export function buildUpdateCartSelectionPayload(isSelected) {
  return {
    is_selected: Boolean(isSelected),
  }
}

export function resolveCartLineItemId(item) {
  if (!item) return null
  if (item.cartItemId != null && item.cartItemId !== '') return String(item.cartItemId)

  const id = String(item.id ?? '')
  if (!id || id.includes(':')) return null

  return id
}
