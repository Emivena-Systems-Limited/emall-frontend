import { buildCartItem } from '../store/slices/cartSlice'
import { resolveVariantAttributeFields } from './productVariantFields'

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

  const primary = images.find((entry) => entry?.is_primary === true || entry?.is_primary === '1')
  const ordered = primary ? [primary, ...images.filter((entry) => entry !== primary)] : images

  for (const entry of ordered) {
    if (typeof entry === 'string' && entry) return entry
    const url = entry?.url ?? entry?.image_url ?? entry?.image
    if (url) return url
  }

  return null
}

function findProductVariant(product, variantId) {
  if (!product || variantId == null || variantId === '') return null
  const variants = product.variants ?? product.variations ?? product.product_variants ?? []
  if (!Array.isArray(variants)) return null

  return variants.find((entry) => String(entry?.id) === String(variantId)) ?? null
}

function resolveVariantImage(variant) {
  if (!variant || typeof variant !== 'object') return null

  return resolveImageSource(
    firstValue(
      variant.variant_images,
      variant.variantImages,
      variant.variant_image,
      variant.images,
      variant.image_url,
      variant.image,
      variant.thumbnail,
    ),
  )
}

function getLineVariantImages(record) {
  return firstValue(
    record?.variant_images,
    record?.variantImages,
    record?.variant_image,
    record?.variant_image_url,
    record?.product_variant_image,
    record?.product_variant_image_url,
  )
}

function getImage(record) {
  const product = record.product ?? record.item ?? {}
  const variant = record.variant ?? record.product_variant ?? record.product_variation ?? {}
  const variantId = firstValue(record.product_variant_id, record.variant_id, variant.id)

  // Cart lines expose the selected variation photo on `variant_images`, while
  // `images` is the shared product shot and must not win for variant rows.
  const lineVariantImage = resolveImageSource(getLineVariantImages(record))
  if (lineVariantImage) return lineVariantImage

  const nestedVariantImage = resolveVariantImage(variant)
  if (nestedVariantImage) return nestedVariantImage

  if (variantId) {
    const matchedVariant = findProductVariant(product, variantId)
    const matchedVariantImage = resolveVariantImage(matchedVariant)
    if (matchedVariantImage) return matchedVariantImage
  }

  if (variantId) {
    const lineImage = resolveImageSource(firstValue(record.image, record.image_url))
    if (lineImage) return lineImage
  }

  // Generic record.image when no variant is selected.
  if (!variantId) {
    const recordImage = resolveImageSource(
      firstValue(record.images, record.image, record.image_url),
    )
    if (recordImage) return recordImage
  }

  const productImages = product.images ?? product.product_images ?? []
  const productImage = resolveImageSource(productImages)
  if (productImage) return productImage

  return firstValue(
    product.image,
    product.image_url,
    product.thumbnail,
    record.image,
    record.image_url,
  )
}

function asScalarLabel(value) {
  if (value == null || typeof value === 'object') return ''
  return String(value).trim()
}

function isPlaceholderVariantLabel(value) {
  const normalized = asScalarLabel(value).toLowerCase()
  return !normalized || normalized === 'default' || normalized === 'standard'
}

function formatAttributeValueLabel(attribute, value) {
  const attr = asScalarLabel(attribute)
  const val = asScalarLabel(value)
  if (!val) return ''
  if (!attr || attr.toLowerCase() === 'option') return val
  return `${attr}: ${val}`
}

function formatAttributeEntries(attributes) {
  if (Array.isArray(attributes) && attributes.length) {
    return attributes
      .map((entry) => {
        if (typeof entry === 'string') return asScalarLabel(entry)
        const name = asScalarLabel(entry?.key ?? entry?.name ?? entry?.attribute ?? entry?.label)
        const value = asScalarLabel(entry?.value ?? entry?.option)
        return formatAttributeValueLabel(name, value) || name
      })
      .filter(Boolean)
      .join(' · ')
  }

  if (isKeyValueAttribute(attributes)) {
    return formatKeyValueAttribute(attributes)
  }

  if (attributes && typeof attributes === 'object') {
    return Object.entries(attributes)
      .filter(([key, value]) => key && !/^\d+$/.test(String(key).trim()) && value != null && value !== '')
      .map(([key, value]) => formatAttributeValueLabel(key, value))
      .filter(Boolean)
      .join(' · ')
  }

  return ''
}

/** Cart lines send `{ key, value }` (e.g. Color / Dark Silver), not a name→value map. */
function isKeyValueAttribute(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return ('key' in value || 'name' in value || 'label' in value)
    && ('value' in value || 'option' in value)
}

function formatKeyValueAttribute(attribute) {
  if (!isKeyValueAttribute(attribute)) return ''
  const name = asScalarLabel(attribute.key ?? attribute.name ?? attribute.attribute ?? attribute.label)
  const value = asScalarLabel(attribute.value ?? attribute.option)
  return formatAttributeValueLabel(name, value)
}

function formatLineAttributes(record) {
  if (!record || typeof record !== 'object') return ''

  const fromAttribute = formatKeyValueAttribute(record.attribute)
  if (fromAttribute) return fromAttribute

  return formatAttributeEntries(record.attributes)
}

function asVariantRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value
}

/** Cart GET lines may send `{ attribute: { key, value } }` instead of a nested variant. */
function lineAttributeToVariantRecord(record) {
  const attribute = record?.attribute
  if (!attribute || typeof attribute !== 'object' || Array.isArray(attribute)) return null

  const key = asScalarLabel(attribute.key ?? attribute.name ?? attribute.attribute ?? attribute.label)
  const value = asScalarLabel(attribute.value ?? attribute.option)
  if (!key && !value) return null

  return {
    attribute: key,
    value,
    ...(key ? { attributes: { [key]: value } } : {}),
  }
}

function isUsefulApiVariantRecord(record) {
  if (!asVariantRecord(record)) return false
  if (record.attribute || record.attribute_name || record.value || record.variant_name || record.option) {
    return true
  }
  const attributes = record.attributes
  if (Array.isArray(attributes)) return attributes.length > 0
  return Boolean(attributes && typeof attributes === 'object' && Object.keys(attributes).length > 0)
}

/** Vendor-style cart/order subtitle, e.g. "Inch: iPhone Air 6.5 inch". */
export function resolveCartItemVariantLabel(item) {
  if (!item || typeof item !== 'object') return ''

  const fromLineAttribute = formatLineAttributes(item)
  if (fromLineAttribute) return fromLineAttribute

  const variantRecord = asVariantRecord(item.variantRecord)
    ?? asVariantRecord(item.product_variant)
    ?? asVariantRecord(item.variant)
    ?? lineAttributeToVariantRecord(item)
  const productName = asScalarLabel(item.name ?? item.title)
  const sku = asScalarLabel(item.sku)

  const fromAttributes = formatAttributeEntries(
    variantRecord?.attributes ?? variantRecord?.attribute_values ?? item.attributes,
  )
  if (fromAttributes && fromAttributes !== productName) return fromAttributes

  if (variantRecord) {
    const { attributeKey, attributeValue } = resolveVariantAttributeFields(variantRecord)
    const attribute = asScalarLabel(
      variantRecord.attribute ?? variantRecord.attribute_name ?? attributeKey,
    )
    const value = asScalarLabel(
      variantRecord.value ?? variantRecord.option ?? attributeValue,
    )
    const fromFields = formatAttributeValueLabel(attribute, value)
    if (fromFields && fromFields !== productName) return fromFields

    const named = asScalarLabel(variantRecord.variant_name)
    if (named && !isPlaceholderVariantLabel(named) && named !== productName && named !== sku) {
      return named
    }
  }

  const stored = typeof item.variant === 'string' ? asScalarLabel(item.variant) : ''
  if (stored && !isPlaceholderVariantLabel(stored) && stored !== productName) return stored

  const storage = asScalarLabel(item.storage)
  if (storage && storage !== sku && !isPlaceholderVariantLabel(storage) && storage !== productName) {
    return storage
  }

  return ''
}

export function formatCartItemOptions(item) {
  return resolveCartItemVariantLabel(item)
}

export function resolveCartItemDisplayImage(item) {
  if (!item || typeof item !== 'object') return ''

  const fromVariantImages = resolveImageSource(
    firstValue(item.variant_images, item.variantImages),
  )
  if (fromVariantImages) return fromVariantImages

  if (item.variantImage) return item.variantImage

  const resolved = getImage({
    product_variant_id: item.variantId,
    product: item.product ?? {},
    variant: asVariantRecord(item.variantRecord)
      ?? asVariantRecord(item.product_variant)
      ?? asVariantRecord(item.variant)
      ?? {},
    variant_images: item.variant_images ?? item.variantImages,
    variant_image: item.variantImage,
    images: item.images,
    image: item.image,
    image_url: item.image,
    sku: item.sku,
    attribute: item.attribute,
  })

  if (resolved) return resolved
  return item.image ?? ''
}

function matchCartDisplayLine(cartItem, apiItem) {
  const cartLineId = cartItem?.cartItemId ?? cartItem?.id
  const apiLineId = apiItem?.id ?? apiItem?.cart_item_id
  if (cartLineId && apiLineId && String(cartLineId) === String(apiLineId)) return true

  const cartVariantId = cartItem?.variantId ?? cartItem?.product_variant_id
  const apiVariantId = apiItem?.product_variant_id ?? apiItem?.variant_id ?? apiItem?.variant?.id
  if (cartVariantId && apiVariantId && String(cartVariantId) === String(apiVariantId)) return true

  const cartProductId = cartItem?.productId ?? cartItem?.product_id
  const apiProductId = apiItem?.product_id ?? apiItem?.productId ?? apiItem?.product?.id
  return Boolean(
    cartProductId
    && apiProductId
    && cartVariantId
    && apiVariantId
    && String(cartProductId) === String(apiProductId)
    && String(cartVariantId) === String(apiVariantId),
  )
}

/** Merge checkout/cart API line details into Redux rows for accurate variant images. */
export function enrichCartItemsForDisplay(cartItems, apiItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return []
  if (!Array.isArray(apiItems) || apiItems.length === 0) return cartItems

  return cartItems.map((cartItem) => {
    const apiMatch = apiItems.find((apiItem) => matchCartDisplayLine(cartItem, apiItem))
    if (!apiMatch) return cartItem

    const product = apiMatch.product ?? apiMatch.item ?? cartItem.product ?? {}
    const variantRecord = apiMatch.variant ?? apiMatch.product_variant ?? cartItem.variantRecord ?? {}
    const variantId = firstValue(
      cartItem.variantId,
      apiMatch.product_variant_id,
      apiMatch.variant_id,
      variantRecord.id,
    )
    const resolvedImage = getImage({
      ...apiMatch,
      product_variant_id: variantId,
      product,
      variant: variantRecord,
      variant_images: apiMatch.variant_images ?? cartItem.variant_images,
      image: apiMatch.variant_images ?? cartItem.variantImage ?? cartItem.image,
      image_url: apiMatch.variant_images ?? cartItem.variantImage ?? cartItem.image,
    })
    const variantImages = firstValue(
      apiMatch.variant_images,
      apiMatch.variantImages,
      cartItem.variant_images,
    )

    return {
      ...cartItem,
      product,
      variantRecord,
      attribute: apiMatch.attribute ?? cartItem.attribute ?? null,
      variant_images: variantImages,
      variantImage: resolvedImage || cartItem.variantImage || cartItem.image || null,
      image: resolvedImage || cartItem.variantImage || cartItem.image || '',
    }
  })
}

export function extractCheckoutPreviewItems(preview) {
  return toArray(preview?.items ?? preview?.cart_items ?? preview?.lines)
}

function resolveCartLinePricing(record, quantity) {
  const unitPrice = toNumber(firstValue(record.unit_price, record.price, record.regular_price))
  const qty = Math.max(1, Number(quantity) || 1)
  const unitDiscount = toNumber(firstValue(
    record.unit_price_discount,
    record.discount,
    record.variant?.discount,
    record.product?.discount,
  ))
  const catalogSale = toNumber(firstValue(
    record.regular_discount_price,
    record.discounted_price,
    record.discount_price,
    record.variant?.regular_discount_price,
    record.variant?.discount_price,
    record.product?.regular_discount_price,
    record.product?.discount_price,
  ))
  const namedSaleOrOff = toNumber(record.discount_amount)

  let paidUnit = unitPrice ?? 0
  if (unitDiscount != null && unitDiscount > 0 && unitPrice != null && unitDiscount < unitPrice) {
    paidUnit = unitPrice - unitDiscount
  } else if (catalogSale != null && catalogSale > 0 && unitPrice != null && catalogSale < unitPrice) {
    paidUnit = catalogSale
  } else if (namedSaleOrOff != null && namedSaleOrOff > 0 && unitPrice != null && namedSaleOrOff < unitPrice) {
    paidUnit = namedSaleOrOff > unitPrice * 0.5
      ? namedSaleOrOff
      : unitPrice - namedSaleOrOff
  }

  const compareAt = unitPrice != null && unitPrice > paidUnit
    ? unitPrice
    : toNumber(firstValue(record.compare_at, record.original_price))
  const displaySubtotal = paidUnit * qty
  const listLineTotal = unitPrice != null ? unitPrice * qty : null
  const lineSavings = listLineTotal != null && listLineTotal > displaySubtotal
    ? listLineTotal - displaySubtotal
    : null

  return {
    price: paidUnit,
    compareAt,
    displaySubtotal,
    lineSavings,
  }
}

export function normalizeCartItem(record) {
  const product = record.product ?? record.item ?? {}
  const nestedVariant = asVariantRecord(record.variant)
    ?? asVariantRecord(record.product_variant)
    ?? asVariantRecord(record.product_variation)
    ?? asVariantRecord(product.variant)
    ?? lineAttributeToVariantRecord(record)
    ?? {}
  const productId = firstValue(record.product_id, product.id, product.product_id)
  const variantId = firstValue(record.product_variant_id, record.variant_id, nestedVariant.id)
  const cartItemId = firstValue(record.id, record.cart_item_id, record.item_id)
  const quantity = firstValue(
    record.quantity,
    record.qty,
    record.item_quantity,
    record.line_quantity,
  ) ?? 1
  const pricing = resolveCartLinePricing(record, quantity)
  const matchedVariant = variantId ? findProductVariant(product, variantId) ?? nestedVariant : nestedVariant
  const variantImages = getLineVariantImages(record)
  const image = getImage(record)
  const variantImage = (variantImages || variantId) ? image : null
  const name = firstValue(record.product_name, product.name, product.product_name, product.title, record.name)
  const sku = firstValue(record.sku, matchedVariant.sku, nestedVariant.sku, product.sku)
  const variantLabel = resolveCartItemVariantLabel({
    name,
    sku,
    variant: typeof record.variant === 'string' ? record.variant : record.variant_name,
    variantRecord: matchedVariant,
    attribute: record.attribute,
    attributes: record.attributes ?? matchedVariant.attributes,
    storage: firstValue(record.storage, record.size, matchedVariant.size, nestedVariant.size),
  })

  return buildCartItem({
    cartItemId,
    productId,
    product_id: productId,
    syncable: Boolean(productId && cartItemId),
    variantId,
    sku,
    name,
    title: firstValue(record.product_name, product.title, product.name, record.name),
    variant: variantLabel || firstValue(
      record.variant_name,
      matchedVariant.variant_name,
      matchedVariant.value,
      nestedVariant.variant_name,
      nestedVariant.value,
      nestedVariant.name,
      record.color,
      product.color,
    ),
    storage: firstValue(
      record.storage,
      record.size,
      matchedVariant.size,
      nestedVariant.size,
      matchedVariant.sku,
      nestedVariant.sku,
    ),
    price: pricing.price,
    compareAt: pricing.compareAt ?? firstValue(nestedVariant.price, product.original_price),
    displaySubtotal: pricing.displaySubtotal,
    lineSavings: pricing.lineSavings,
    quantity,
    image,
    variantImage,
    variant_images: variantImages,
    attribute: record.attribute ?? matchedVariant.attribute ?? null,
    product,
    variantRecord: matchedVariant,
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
  const variantIdsMatch = localItem.variantId
    && String(localItem.variantId) === String(apiItem.variantId)
  const apiVariantImage = firstValue(apiItem.variant_images, apiItem.variantImage)
  const preservedVariantImage = apiVariantImage
    || (variantIdsMatch
      ? (localItem.variantImage ?? localItem.image)
      : (localItem.variantImage ?? apiItem.variantImage ?? null))
  const preservedImage = apiVariantImage
    || (variantIdsMatch && localItem.image
      ? localItem.image
      : (preservedVariantImage || localItem.image || apiItem.image))

  const apiRecord = isUsefulApiVariantRecord(apiItem.variantRecord) ? apiItem.variantRecord : null
  const localRecord = isUsefulApiVariantRecord(localItem.variantRecord) ? localItem.variantRecord : null
  const variantRecord = apiRecord || localRecord || apiItem.variantRecord || localItem.variantRecord

  return {
    ...localItem,
    ...apiItem,
    cartItemId: lineItemId,
    id: lineItemId ?? localItem.id,
    name: localItem.name || apiItem.name,
    price: Number.isFinite(apiPrice) && apiPrice > 0 ? apiPrice : localItem.price,
    compareAt: apiItem.compareAt ?? localItem.compareAt,
    variant_images: firstValue(apiItem.variant_images, localItem.variant_images),
    attribute: apiItem.attribute ?? localItem.attribute ?? null,
    image: preservedImage,
    variantImage: preservedVariantImage || preservedImage || null,
    product: apiItem.product ?? localItem.product,
    variantRecord,
    href: localItem.href || apiItem.href,
    variant: resolveCartItemVariantLabel({
      ...localItem,
      ...apiItem,
      name: localItem.name || apiItem.name,
      variant: localItem.variant,
      variantRecord,
      storage: localItem.storage || apiItem.storage,
    }) || localItem.variant || apiItem.variant,
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
