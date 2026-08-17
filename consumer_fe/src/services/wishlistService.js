import apiClient from '../lib/apiClient'

export const WISHLIST_ENDPOINTS = {
  ADD_WISHLIST: (productId) => `/wishlist/user/${encodeURIComponent(productId)}/store`,
  GET_WISHLIST: '/wishlist/user',
  GET_SINGLE_WISHLIST: (id) => `/wishlist/user/${encodeURIComponent(id)}`,
  UPDATE_VARIANT: (id) => `/wishlist/user/${encodeURIComponent(id)}`,
  REMOVE_WISHLIST: (id) => `/wishlist/user/${encodeURIComponent(id)}/remove`,
  CLEAR_WISHLIST: '/wishlist/user/clear',
  MOVE_ITEM_TO_CART: (id) => `/wishlist/user/${encodeURIComponent(id)}/move-to-cart`,
  MOVE_ALL_TO_CART: '/wishlist/user/move-to-cart',
  BULK_DELETE: '/wishlist/user/bulk-delete',
}

function assertApiSuccess(data) {
  if (data?.in_error || data?.error) {
    const error = new Error(data.message || data.error || 'Wishlist request failed')
    error.response = { data }
    throw error
  }
  return data
}

export function normalizeWishlistItems(data) {
  const source = data?.data?.items ?? data?.data ?? data ?? []
  if (!Array.isArray(source)) return []

  return source.flat(Infinity).filter((item) => item && typeof item === 'object')
}

/**
 * Add a product or variant to the consumer's wishlist. The backend expects
 * the product ID in the route rather than in the JSON request body.
 */
export async function addToWishlist(payload) {
  const productId = String(payload?.product_id ?? '').trim()
  if (!productId) throw new Error('Product ID is required to add an item to the wishlist')

  const endpoint = WISHLIST_ENDPOINTS.ADD_WISHLIST(productId)

  if (import.meta.env.DEV) {
    console.info('[wishlist] POST', endpoint)
  }
  // Keep these fields in the body as well: the current backend controller
  // still reads both array keys even though product_id is also in the route.
  const { data } = await apiClient.post(endpoint, {
    product_id: productId,
    product_variant_id: payload?.product_variant_id || null,
  }, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

/**
 * Fetch consumer's saved wishlist items via GET /wishlist/user
 */
export async function getUserWishlist() {
  const { data } = await apiClient.get(WISHLIST_ENDPOINTS.GET_WISHLIST, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return normalizeWishlistItems(data)
}

/** Fetch one wishlist item via GET /wishlist/user/:id. */
export async function getWishlistItem(itemId) {
  const { data } = await apiClient.get(WISHLIST_ENDPOINTS.GET_SINGLE_WISHLIST(itemId), {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

/** Change the saved variant via PATCH /wishlist/user/:id. */
export async function updateWishlistVariant(itemId, productVariantId) {
  const { data } = await apiClient.patch(
    WISHLIST_ENDPOINTS.UPDATE_VARIANT(itemId),
    { product_variant_id: productVariantId },
    { skipAuthLogout: true },
  )
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

/**
 * Remove an item from consumer's wishlist via DELETE /wishlist/user/:id/remove
 */
export async function removeFromWishlist(itemId) {
  const { data } = await apiClient.delete(WISHLIST_ENDPOINTS.REMOVE_WISHLIST(itemId), {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

/**
 * Clear all items from consumer's wishlist via DELETE /wishlist/user/clear
 */
export async function clearWishlist() {
  const { data } = await apiClient.delete(WISHLIST_ENDPOINTS.CLEAR_WISHLIST, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

/** Move one saved item to the authenticated cart. */
export async function moveWishlistItemToCart(itemId) {
  const { data } = await apiClient.post(
    WISHLIST_ENDPOINTS.MOVE_ITEM_TO_CART(itemId),
    null,
    { skipAuthLogout: true },
  )
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

/** Move every saved item to the authenticated cart. */
export async function moveAllWishlistItemsToCart() {
  const { data } = await apiClient.post(
    WISHLIST_ENDPOINTS.MOVE_ALL_TO_CART,
    null,
    { skipAuthLogout: true },
  )
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}

/** Delete multiple wishlist items in one request. */
export async function bulkDeleteWishlistItems(itemIds) {
  const { data } = await apiClient.post(
    WISHLIST_ENDPOINTS.BULK_DELETE,
    { wishlist_item_ids: itemIds },
    { skipAuthLogout: true },
  )
  assertApiSuccess(data)
  return data?.data ?? data ?? {}
}
