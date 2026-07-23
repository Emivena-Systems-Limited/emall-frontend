import { createSlice } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'
import { CART_PERSIST_KEY } from '../authPersist'
import { isValidGuestCartId } from '../../utils/guestCartId'
import { logout } from './authSlice'

const getProductId = (product) =>
  product?.productId ?? product?.product_id ?? product?.backendId ?? product?.id ?? product?.slug

const getVariantId = (product) =>
  product?.variantId ?? product?.variant_id ?? product?.product_variant_id ?? product?.activeVariant?.id ?? null

const getCartKey = ({ productId, variantId, sku }) =>
  [productId, variantId, sku].filter(Boolean).join(':')

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
  const lineId = lineItemIdOf(item)

  return items.findIndex((current) => {
    const currentLineId = lineItemIdOf(current)
    if (lineId && currentLineId && lineId === currentLineId) return true
    if (item.key && current.key === item.key) return true
    if (
      item.productId
      && current.productId === item.productId
      && (current.variantId ?? null) === (item.variantId ?? null)
    ) {
      return true
    }
    return false
  })
}

export function buildCartItem(product, options = {}) {
  const productId = options.productId ?? getProductId(product)
  const variantId = options.variantId ?? getVariantId(product)
  const sku = options.sku ?? product?.sku ?? product?.activeSku ?? product?.variant
  const quantity = Math.max(1, Number(options.quantity ?? product?.quantity ?? 1))
  const price = Number(options.price ?? product?.price ?? product?.discount_price ?? 0)
  const compareAt = options.compareAt ?? product?.compareAt ?? product?.original_price ?? null
  const displaySubtotal = options.displaySubtotal ?? product?.displaySubtotal ?? null
  const lineSavings = options.lineSavings ?? product?.lineSavings ?? null
  const key = getCartKey({ productId, variantId, sku }) || String(product?.id ?? Date.now())
  const image = options.image ?? product?.image ?? product?.gallery?.[0] ?? ''
  const variantImage = variantId
    ? (options.variantImage ?? options.image ?? product?.variantImage ?? null)
    : (product?.variantImage ?? null)

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
    const existingIndex = items.findIndex((current) => current.key === item.key || current.id === item.id)
    if (existingIndex >= 0) {
      items[existingIndex] = {
        ...items[existingIndex],
        ...item,
        quantity: item.quantity || items[existingIndex].quantity,
        selected: item.selected ?? items[existingIndex].selected,
        image: items[existingIndex].variantImage
          ?? items[existingIndex].image
          ?? item.image,
        variantImage: items[existingIndex].variantImage ?? item.variantImage ?? null,
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
        Object.assign(state.items[existingIndex], item, {
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
      state.items = coerceCartItemsList(action.payload)
    },
    mergeItems(state, action) {
      state.items = mergeItemsIntoList(state.items, action.payload)
    },
    setQuantity(state, action) {
      const { itemId, quantity } = action.payload
      const item = state.items.find((current) => current.id === itemId || current.key === itemId)
      if (!item) return

      const nextQuantity = Math.max(1, Number(quantity))
      item.quantity = nextQuantity
      if (Number.isFinite(item.price)) {
        item.displaySubtotal = item.price * nextQuantity
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload && item.key !== action.payload)
    },
    clearCart(state) {
      state.items = []
    },
    setSelected(state, action) {
      const { itemId, selected } = action.payload
      const item = state.items.find((current) => current.id === itemId || current.key === itemId)
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
      if (!state.items.some((current) => current.key === item.key)) {
        state.items.push({ ...item, selected: true })
      }
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
      // Server cart is the source of truth — do not merge with stale persisted lines.
      state.items = coerceCartItemsList(items)
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
