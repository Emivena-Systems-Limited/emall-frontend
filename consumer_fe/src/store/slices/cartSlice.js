import { createSlice } from '@reduxjs/toolkit'

const getProductId = (product) =>
  product?.productId ?? product?.product_id ?? product?.backendId ?? product?.id ?? product?.slug

const getVariantId = (product) =>
  product?.variantId ?? product?.variant_id ?? product?.product_variant_id ?? product?.activeVariant?.id ?? null

const getCartKey = ({ productId, variantId, sku }) =>
  [productId, variantId, sku].filter(Boolean).join(':')

export function buildCartItem(product, options = {}) {
  const productId = getProductId(product)
  const variantId = options.variantId ?? getVariantId(product)
  const sku = options.sku ?? product?.sku ?? product?.activeSku ?? product?.variant
  const quantity = Math.max(1, Number(options.quantity ?? product?.quantity ?? 1))
  const price = Number(options.price ?? product?.price ?? product?.discount_price ?? 0)
  const compareAt = options.compareAt ?? product?.compareAt ?? product?.original_price ?? null
  const key = getCartKey({ productId, variantId, sku }) || String(product?.id ?? Date.now())

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
    quantity,
    image: options.image ?? product?.image ?? product?.gallery?.[0] ?? '',
    href: product?.href ?? (product?.slug ? `/${product.slug}` : '/cart'),
    selected: product?.selected ?? true,
    seller: product?.seller ?? product?.storeName ?? product?.store_name ?? 'EZ-Stores',
    freeDelivery: product?.freeDelivery ?? true,
    syncable: Boolean(options.syncable ?? product?.syncable ?? product?.backendId ?? product?.product_id),
  }
}

const initialState = {
  items: [],
  savedItems: [],
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
      const existing = state.items.find((current) => current.key === item.key || current.id === item.id)
      if (existing) {
        Object.assign(existing, item, {
          quantity: item.quantity || existing.quantity,
          selected: item.selected ?? existing.selected,
        })
        return
      }
      state.items.push(item)
    },
    replaceItems(state, action) {
      state.items = Array.isArray(action.payload) ? action.payload.map((item) => buildCartItem(item)) : []
    },
    mergeItems(state, action) {
      const incomingItems = Array.isArray(action.payload) ? action.payload.map((item) => buildCartItem(item)) : []
      incomingItems.forEach((item) => {
        const existing = state.items.find((current) => current.key === item.key || current.id === item.id)
        if (existing) {
          Object.assign(existing, item, {
            quantity: item.quantity || existing.quantity,
            selected: item.selected ?? existing.selected,
          })
          return
        }
        state.items.push(item)
      })
    },
    setQuantity(state, action) {
      const { itemId, quantity } = action.payload
      const item = state.items.find((current) => current.id === itemId || current.key === itemId)
      if (item) item.quantity = Math.max(1, Number(quantity))
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
} = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectSavedCartItems = (state) => state.cart.savedItems
export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + Number(item.quantity || 0), 0)

export default cartSlice.reducer
