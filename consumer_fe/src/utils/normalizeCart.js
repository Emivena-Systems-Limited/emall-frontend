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

function getImage(record) {
  const product = record.product ?? record.item ?? {}
  const images = product.images ?? product.product_images ?? []
  const image = Array.isArray(images) ? images[0] : images

  if (typeof image === 'string') return image
  return firstValue(
    record.image,
    record.image_url,
    product.image,
    product.image_url,
    product.thumbnail,
    image?.url,
    image?.image_url,
    image?.image,
  )
}

export function normalizeCartItem(record) {
  const product = record.product ?? record.item ?? record
  const variant = record.variant ?? record.product_variant ?? product.variant ?? {}
  const productId = firstValue(record.product_id, product.id, product.product_id)
  const variantId = firstValue(record.product_variant_id, record.variant_id, variant.id)
  const cartItemId = firstValue(record.id, record.cart_item_id, record.item_id)

  return buildCartItem({
    cartItemId,
    productId,
    product_id: productId,
    syncable: Boolean(productId && cartItemId),
    variantId,
    sku: firstValue(record.sku, variant.sku, product.sku),
    name: firstValue(product.name, product.product_name, product.title, record.name),
    title: firstValue(product.title, product.name, record.name),
    variant: firstValue(record.variant_name, variant.variant_name, variant.name, record.color, product.color),
    storage: firstValue(record.storage, record.size, variant.size, variant.sku),
    price: firstValue(record.price, record.unit_price, variant.discount_price, variant.price, product.price),
    compareAt: firstValue(record.compare_at, record.original_price, variant.price, product.original_price),
    quantity: firstValue(record.quantity, record.qty, 1),
    image: getImage(record),
    href: product.slug ? `/${product.slug}` : undefined,
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

export function extractCartItems(payload) {
  if (!payload) return []

  const root = payload?.cart ?? payload?.data?.cart ?? payload?.data ?? payload
  const list = toArray(root?.items ?? root?.cart_items ?? root?.lines)

  if (list.length > 0) {
    return list.map(normalizeCartItem).filter(Boolean)
  }

  // GET /api/cart/guest returns { items: [], summary: {...} } — not a line list at root.
  if (root?.summary != null) return []

  return toArray(root).map(normalizeCartItem).filter(Boolean)
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

/** GET /api/cart/guest → data.summary with selected_items_count, subtotal, discount, total. */
export function extractCartSummary(payload) {
  if (!payload) return null

  const root = payload?.cart ?? payload?.data?.cart ?? payload?.data ?? payload
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

/** Merge API line item with local product details the add-item response omits. */
export function mergeGuestAddItemWithLocal(apiItem, localItem) {
  if (!apiItem?.productId) return localItem ?? null
  if (!localItem) return apiItem

  const lineItemId = apiItem.cartItemId ?? apiItem.id
  const apiPrice = Number(apiItem.price)

  return {
    ...localItem,
    ...apiItem,
    cartItemId: lineItemId,
    id: lineItemId ?? localItem.id,
    name: localItem.name || apiItem.name,
    price: Number.isFinite(apiPrice) && apiPrice > 0 ? apiPrice : localItem.price,
    compareAt: localItem.compareAt ?? apiItem.compareAt,
    image: localItem.image || apiItem.image,
    href: localItem.href || apiItem.href,
    variant: localItem.variant || apiItem.variant,
    storage: localItem.storage || apiItem.storage,
    seller: localItem.seller || apiItem.seller,
    quantity: apiItem.quantity ?? localItem.quantity,
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

/**
 * Reduces the local guest cart into the { product_id, product_variant_id, quantity }
 * shape expected by POST /cart/merge, deduping lines that share a product+variant.
 */
export function buildMergeCartItems(items) {
  const byKey = new Map()

  ;(items ?? []).filter(canSyncCartItem).forEach((item) => {
    const key = [item.productId, item.variantId].filter(Boolean).join(':')
    const quantity = Math.max(1, Number(item.quantity) || 1)
    const existing = byKey.get(key)

    if (existing) {
      existing.quantity += quantity
      return
    }

    byKey.set(key, {
      product_id: item.productId,
      ...(item.variantId != null && item.variantId !== '' ? { product_variant_id: item.variantId } : {}),
      quantity,
    })
  })

  return Array.from(byKey.values())
}

export function resolveCartLineItemId(item) {
  if (!item) return null
  if (item.cartItemId != null && item.cartItemId !== '') return String(item.cartItemId)

  const id = String(item.id ?? '')
  if (!id || id.includes(':')) return null

  return id
}
