import { createSlice } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'
import { CART_PERSIST_KEY } from '../authPersist'
import { isValidGuestCartId } from '../../utils/guestCartId'
import { logout } from './authSlice'

const getProductId = (product) =>
  product?.productId ?? product?.product_id ?? product?.backendId ?? product?.id ?? product?.slug

const getVariantId = (product) =>
  product?.variantId ?? product?.variant_id ?? product?.product_variant_id ?? product?.activeVariant?.id ?? null

const getAttributeIdentity = (product, options = {}) => {
  const attribute = options.attribute ?? product?.attribute
  if (!attribute || typeof attribute !== 'object' || Array.isArray(attribute)) return null
  const key = String(attribute.key ?? attribute.name ?? '').trim()
  const value = String(attribute.value ?? attribute.option ?? '').trim()
  if (!key && !value) return null
  return `${key}:${value}`
}

const getCartKey = ({ productId, variantId, sku, attribute }) =>
  [productId, variantId, sku, attribute].filter(Boolean).join(':')

const normalizeCartIdentity = (value) => (
  value == null || value === '' ? null : String(value)
)

/**
 * Returns true when a product (or a specific product variant) is already in the cart.
 * Product cards intentionally omit variantId, so any cart line for that product is a match.
 */
export function isProductInCart(items, product, options = {}) {
  if (!Array.isArray(items)) return false

  const productId = normalizeCartIdentity(options.productId ?? getProductId(product))
  const variantId = normalizeCartIdentity(
    Object.prototype.hasOwnProperty.call(options, 'variantId')
      ? options.variantId
      : getVariantId(product),
  )
  if (!productId) return false

  return items.some((item) => {
    const itemProductId = normalizeCartIdentity(getProductId(item))
    if (itemProductId !== productId) return false

    // A listing card represents the whole product, while the details page can
    // represent one selected variant. Only require a variant match when supplied.
    if (!variantId) return true
    return normalizeCartIdentity(getVariantId(item)) === variantId
  })
}

function lineItemIdOf(item) {
  if (item?.cartItemId != null && item.cartItemId !== '') return String(item.cartItemId)
  const id = String(item?.id ?? '')
  if (id && !id.includes(':')) return id
  return null
}

function isStaleLocalLine(item) {
  const id = String(item?.id ?? '')
  const key = String(item?.key ?? '')
  return Boolean(key) && (id === key || !item?.cartItemId)
}

function findCartItemIndex(items, item) {
  return items.findIndex((current) => sameCartLine(current, item))
}

function sameCartLine(a, b) {
  if (!a || !b) return false

  const aLineId = lineItemIdOf(a)
  const bLineId = lineItemIdOf(b)
  if (aLineId && bLineId) return aLineId === bLineId
  if (a.key && b.key && a.key === b.key) return true

  const aProductId = a.productId != null && a.productId !== '' ? String(a.productId) : ''
  const bProductId = b.productId != null && b.productId !== '' ? String(b.productId) : ''
  if (!aProductId || aProductId !== bProductId) return false

  if (String(a.variantId ?? '') !== String(b.variantId ?? '')) return false
  if (a.variantId) return true

  const aAttr = getAttributeIdentity(a)
  const bAttr = getAttributeIdentity(b)
  if (aAttr || bAttr) return aAttr === bAttr
  return true
}

function isWeakVariantLabel(value) {
  if (value != null && typeof value === 'object') return true
  const normalized = String(value ?? '').trim().toLowerCase()
  return !normalized || normalized === 'default' || normalized === 'standard'
}

function isUsefulVariantRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false
  if (record.attribute || record.attribute_name || record.value || record.variant_name || record.option) {
    return true
  }
  const attributes = record.attributes
  if (Array.isArray(attributes)) return attributes.length > 0
  return Boolean(attributes && typeof attributes === 'object' && Object.keys(attributes).length > 0)
}

function firstDisplayValue(...values) {
  return values.find((value) => {
    if (value == null || value === '') return false
    if (typeof value === 'string') return value.trim() !== ''
    return true
  }) ?? null
}

function isWeakHref(value) {
  const href = String(value ?? '').trim()
  return !href || href === '/cart'
}

/**
 * Backend cart payloads often omit variant names/images. Keep the local
 * display fields so a refetch does not blank out what the shopper just saw.
 */
export function preserveCartDisplayFields(incomingItems, localItems = []) {
  if (!Array.isArray(incomingItems) || incomingItems.length === 0) return []
  if (!Array.isArray(localItems) || localItems.length === 0) return incomingItems

  return incomingItems.map((incoming) => {
    const local = localItems.find((item) => sameCartLine(item, incoming))
    if (!local) return incoming

    const incomingVariantWeak = isWeakVariantLabel(incoming.variant)
    const localVariantStrong = !isWeakVariantLabel(local.variant)
    const incomingRecordWeak = !isUsefulVariantRecord(incoming.variantRecord)
    const localRecordStrong = isUsefulVariantRecord(local.variantRecord)

    return {
      ...incoming,
      name: firstDisplayValue(incoming.name, local.name) ?? incoming.name,
      href: isWeakHref(incoming.href) ? (local.href || incoming.href) : incoming.href,
      seller: firstDisplayValue(incoming.seller, local.seller) ?? incoming.seller,
      variant: incoming.attribute
        ? (incoming.variant || local.variant)
        : incomingVariantWeak && localVariantStrong
          ? local.variant
          : (incoming.variant || local.variant),
      storage: firstDisplayValue(incoming.storage, local.storage) ?? incoming.storage,
      variantRecord: incomingRecordWeak && localRecordStrong
        ? local.variantRecord
        : (incoming.variantRecord || local.variantRecord),
      attribute: incoming.attribute ?? local.attribute ?? null,
      variant_images: firstDisplayValue(incoming.variant_images, local.variant_images),
      variantImage: firstDisplayValue(
        incoming.variant_images,
        incoming.variantImage,
        local.variant_images,
        local.variantImage,
      ),
      image: firstDisplayValue(
        incoming.variant_images,
        incoming.variantImage,
        incoming.image,
        local.variant_images,
        local.variantImage,
        local.image,
      ) ?? incoming.image,
      product: incoming.product || local.product,
    }
  })
}

export function buildCartItem(product, options = {}) {
  const productId = options.productId ?? getProductId(product)
  const variantId = options.variantId ?? getVariantId(product)
  const sku = options.sku ?? product?.sku ?? product?.activeSku ?? product?.variant
  const quantity = Math.max(
    1,
    Number(
      options.quantity
      ?? (product?.cartItemId || product?.key || product?.cart_item_id ? product?.quantity : undefined)
      ?? 1,
    ) || 1,
  )
  const price = Number(options.price ?? product?.price ?? product?.discount_price ?? 0)
  const compareAt = options.compareAt ?? product?.compareAt ?? product?.original_price ?? null
  const displaySubtotal = options.displaySubtotal ?? product?.displaySubtotal ?? null
  const lineSavings = options.lineSavings ?? product?.lineSavings ?? null
  const key = getCartKey({
    productId,
    variantId,
    sku,
    attribute: variantId ? null : getAttributeIdentity(product, options),
  }) || String(product?.id ?? Date.now())
  const variantImages = options.variant_images ?? product?.variant_images ?? null
  const image = options.image ?? product?.image ?? product?.gallery?.[0] ?? ''
  const variantImage = options.variantImage
    ?? product?.variantImage
    ?? (typeof variantImages === 'string' && variantImages ? variantImages : null)
    ?? (variantId ? (options.image ?? null) : null)
  const attribute = options.attribute ?? product?.attribute ?? null

  return {
    id: product?.cartItemId ?? product?.cart_item_id ?? product?.cartId ?? key,
    cartItemId: product?.cartItemId ?? product?.cart_item_id ?? null,
    key,
    productId,
    variantId,
    sku,
    name: product?.title ?? product?.name ?? 'Product',
    variant: options.variant ?? product?.variant ?? options.color ?? product?.color ?? 'Default',
    storage: options.storage ?? options.size ?? product?.storage ?? product?.size ?? sku ?? '',
    price,
    compareAt,
    displaySubtotal: displaySubtotal == null ? null : Number(displaySubtotal),
    lineSavings: lineSavings == null ? null : Number(lineSavings),
    quantity,
    image,
    variantImage,
    variant_images: variantImages,
    attribute,
    product: options.productRecord ?? product?.productRecord ?? null,
    variantRecord: options.variantRecord ?? product?.variantRecord ?? null,
    href: product?.href ?? (product?.slug ? `/${product.slug}` : '/cart'),
    selected: product?.selected ?? true,
    seller: product?.seller ?? product?.storeName ?? product?.store_name ?? 'EZ-Stores',
    freeDelivery: product?.freeDelivery ?? true,
    syncable: Boolean(
      options.syncable ??
      product?.syncable ??
      product?.backendId ??
      product?.product_id ??
      product?.id,
    ),
  }
}

/** Normalize incoming cart lines for Redux storage without double-processing. */
function coerceCartItemsList(items) {
  if (!Array.isArray(items)) return []

  return items.map((item) => (
    item?.key && (item?.productId != null || item?.product_id != null)
      ? item
      : buildCartItem(item)
  ))
}

/** Upserts incoming items into the existing list, keyed by cart key or line item id. */
function mergeItemsIntoList(existingItems, incomingRaw) {
  const incomingItems = Array.isArray(incomingRaw) ? incomingRaw.map((item) => buildCartItem(item)) : []
  const items = [...existingItems]

  incomingItems.forEach((item) => {
    const existingIndex = findCartItemIndex(items, item)
    if (existingIndex >= 0) {
      const preserved = preserveCartDisplayFields([item], [items[existingIndex]])[0]
      items[existingIndex] = {
        ...preserved,
        quantity: item.quantity || items[existingIndex].quantity,
        selected: item.selected ?? items[existingIndex].selected,
      }
      return
    }
    items.push(item)
  })

  return items
}

const initialCartMeta = {
  // idle -> syncing -> synced | error. Drives the one-time guest-to-account cart merge on login.
  syncStatus: 'idle',
  syncedUserId: null,
  error: null,
}

const initialState = {
  items: [],
  savedItems: [],
  guestCartId: null,
  meta: initialCartMeta,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const item = buildCartItem(action.payload.product ?? action.payload, action.payload.options)
      const existing = state.items.find((current) => current.key === item.key)
      if (existing) {
        existing.quantity += item.quantity
        existing.selected = true
        return
      }
      state.items.push(item)
    },
    upsertItem(state, action) {
      const item = buildCartItem(action.payload.product ?? action.payload, action.payload.options)
      const existingIndex = findCartItemIndex(state.items, item)

      if (existingIndex >= 0) {
        const preserved = preserveCartDisplayFields([item], [state.items[existingIndex]])[0]
        Object.assign(state.items[existingIndex], preserved, {
          quantity: item.quantity || state.items[existingIndex].quantity,
          selected: item.selected ?? state.items[existingIndex].selected,
        })

        const productId = item.productId
        const variantId = item.variantId ?? null
        const keepLineId = lineItemIdOf(item)

        state.items = state.items.filter((current, index) => {
          if (index === existingIndex) return true
          if (current.productId !== productId) return true
          if ((current.variantId ?? null) !== variantId) return true
          if (keepLineId && lineItemIdOf(current) === keepLineId) return false
          return isStaleLocalLine(current)
        })
        return
      }

      state.items.push(item)
    },
    replaceItems(state, action) {
      const incoming = coerceCartItemsList(action.payload)
      if (incoming.length === 0) {
        state.items = []
        return
      }
      state.items = preserveCartDisplayFields(incoming, state.items)
    },
    mergeItems(state, action) {
      state.items = mergeItemsIntoList(state.items, action.payload)
    },
    setQuantity(state, action) {
      const { itemId, quantity } = action.payload
      const target = String(itemId ?? '')
      const item = state.items.find((current) => (
        String(current.id) === target
        || String(current.key) === target
        || String(current.cartItemId ?? '') === target
      ))
      if (!item) return

      const nextQuantity = Math.max(1, Number(quantity))
      item.quantity = nextQuantity
      if (Number.isFinite(item.price)) {
        item.displaySubtotal = item.price * nextQuantity
      }
    },
    removeItem(state, action) {
      const target = String(action.payload ?? '')
      state.items = state.items.filter((item) => (
        String(item.id) !== target
        && String(item.key) !== target
        && String(item.cartItemId ?? '') !== target
      ))
    },
    clearCart(state) {
      state.items = []
    },
    setSelected(state, action) {
      const { itemId, selected } = action.payload
      const target = String(itemId ?? '')
      const item = state.items.find((current) => (
        String(current.id) === target
        || String(current.key) === target
        || String(current.cartItemId ?? '') === target
      ))
      if (item) item.selected = Boolean(selected)
    },
    saveForLater(state, action) {
      const item = state.items.find((current) => current.id === action.payload || current.key === action.payload)
      if (!item) return
      state.items = state.items.filter((current) => current.id !== action.payload && current.key !== action.payload)
      if (!state.savedItems.some((saved) => saved.key === item.key)) {
        state.savedItems.push(item)
      }
    },
    moveSavedToCart(state, action) {
      const item = state.savedItems.find((current) => current.id === action.payload || current.key === action.payload)
      if (!item) return
      state.savedItems = state.savedItems.filter((current) => current.id !== action.payload && current.key !== action.payload)

      const existing = state.items.find((current) => current.key === item.key)
      if (existing) {
        existing.quantity += item.quantity
        existing.selected = true
        if (Number.isFinite(existing.price)) {
          existing.displaySubtotal = existing.price * existing.quantity
        }
        return
      }

      state.items.push({ ...item, selected: true })
    },
    removeSavedItem(state, action) {
      state.savedItems = state.savedItems.filter((item) => item.id !== action.payload && item.key !== action.payload)
    },
    clearSavedItems(state) {
      state.savedItems = []
    },
    setGuestCartId(state, action) {
      const nextId = String(action.payload ?? '').trim()
      state.guestCartId = isValidGuestCartId(nextId) ? nextId : null
    },
    clearGuestCartId(state) {
      state.guestCartId = null
    },

    /** One-time guest→account cart merge lifecycle, driven by useCartAuthSync. */
    cartSyncStarted(state) {
      state.meta.syncStatus = 'syncing'
      state.meta.error = null
    },
    cartSyncSucceeded(state, action) {
      const { items, userId } = action.payload
      // Server cart is the source of truth for membership/qty, but keep local
      // variant labels the API cart payload often omits.
      state.items = preserveCartDisplayFields(coerceCartItemsList(items), state.items)
      state.guestCartId = null
      state.meta.syncStatus = 'synced'
      state.meta.syncedUserId = userId ?? null
      state.meta.error = null
    },
    cartSyncFailed(state, action) {
      state.meta.syncStatus = 'error'
      state.meta.error = action.payload ?? 'Cart sync failed'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, (state) => {
        // Logging out returns the device to a clean guest cart so the next
        // session (guest or a different account) never sees another user's items.
        state.items = []
        state.savedItems = []
        state.guestCartId = null
        state.meta = initialCartMeta
      })
      .addCase(REHYDRATE, (state, action) => {
        if (action.key !== CART_PERSIST_KEY) return
        if (state.guestCartId && !isValidGuestCartId(state.guestCartId)) {
          state.guestCartId = null
        }
        // A persisted "syncing" flag means the tab closed mid-request — there is
        // no request actually in flight anymore, so treat it as idle again.
        if (state.meta?.syncStatus === 'syncing') {
          state.meta.syncStatus = 'idle'
        }
      })
  },
})

export const {
  addItem,
  upsertItem,
  replaceItems,
  mergeItems,
  setQuantity,
  removeItem,
  clearCart,
  setSelected,
  saveForLater,
  moveSavedToCart,
  removeSavedItem,
  clearSavedItems,
  setGuestCartId,
  clearGuestCartId,
  cartSyncStarted,
  cartSyncSucceeded,
  cartSyncFailed,
} = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectSavedCartItems = (state) => state.cart.savedItems
export const selectGuestCartId = (state) => state.cart.guestCartId
export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + Number(item.quantity || 0), 0)
export const selectCartSyncStatus = (state) => state.cart.meta.syncStatus
export const selectCartSyncedUserId = (state) => state.cart.meta.syncedUserId
export const selectCartSyncError = (state) => state.cart.meta.error

export default cartSlice.reducer
