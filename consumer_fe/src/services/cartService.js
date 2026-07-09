import { CART_ENDPOINTS, GUEST_CART_HEADER } from '../constants/cart'
import apiClient from '../lib/apiClient'
import { persistor, store } from '../store/store'
import { selectGuestCartId, setGuestCartId } from '../store/slices/cartSlice'
import { extractGuestCartId } from '../utils/normalizeCart'
import { generateGuestCartId, isValidGuestCartId, requireGuestCartId, resolveGuestCartId } from '../utils/guestCartId'
import { dedupeAsync } from '../utils/requestDedup'

let authenticatedCartReady = false

export function resetAuthenticatedCartSession() {
  authenticatedCartReady = false
}

const guestCartRequestConfig = {
  skipAuthLogout: true,
  guestSessionOnly: true,
}

function guestCartHeaderConfig(guestCartId) {
  const id = requireGuestCartId(guestCartId ?? selectGuestCartId(store.getState()))
  if (!id) {
    throw new Error('Guest cart id is required')
  }

  return {
    headers: { [GUEST_CART_HEADER]: id },
  }
}

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Cart request failed')
  error.response = { data }
  throw error
}

/** Merge API envelope fields with nested `data` so top-level ids are not dropped. */
function unwrapApiPayload(data) {
  if (!data || typeof data !== 'object') return {}

  const nested = data.data
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return { ...data, ...nested }
  }

  return data
}

export async function createGuestCart(guestCartId = generateGuestCartId()) {
  const clientGuestCartId = String(guestCartId).trim()

  if (!isValidGuestCartId(clientGuestCartId)) {
    throw new Error('A valid guest cart UUID is required to create a guest cart')
  }

  // POST /api/cart — register the client-generated UUID with the backend.
  const { data } = await apiClient.post(
    CART_ENDPOINTS.CART,
    { guest_cart_id: clientGuestCartId },
    {
      ...guestCartRequestConfig,
      headers: { [GUEST_CART_HEADER]: clientGuestCartId },
    },
  )
  assertApiSuccess(data)

  // POST /api/cart → { data: { guest_cart_id, id } } where id is the cart record id.
  const payload = unwrapApiPayload(data)
  const confirmedGuestCartId = resolveGuestCartId(
    extractGuestCartId(payload),
    clientGuestCartId,
  )

  return {
    ...payload,
    guest_cart_id: confirmedGuestCartId,
    guestCartId: confirmedGuestCartId,
  }
}

/**
 * If a guest cart id is already stored, returns it immediately.
 * Otherwise creates one via POST /api/cart and persists guest_cart_id for later requests.
 */
export async function ensureGuestCartExists() {
  const existingId = String(selectGuestCartId(store.getState()) ?? '').trim()
  if (isValidGuestCartId(existingId)) return existingId

  if (existingId) {
    store.dispatch(setGuestCartId(null))
  }

  const clientGuestCartId = generateGuestCartId()
  const payload = await createGuestCart(clientGuestCartId)
  const guestCartId = resolveGuestCartId(
    extractGuestCartId(payload),
    clientGuestCartId,
  )

  if (!guestCartId) {
    throw new Error('Guest cart id missing from POST /cart response')
  }

  store.dispatch(setGuestCartId(guestCartId))
  await persistor.persist()

  return guestCartId
}

export async function getGuestCart(guestCartId) {
  // GET /api/cart/guest → { data: { items, summary } }. Requires Guest-Cart-Id header.
  const id = requireGuestCartId(guestCartId ?? selectGuestCartId(store.getState()))
  return dedupeAsync(`guest-cart:${id}`, async () => {
    const { data } = await apiClient.get(CART_ENDPOINTS.GUEST_CART, {
      ...guestCartRequestConfig,
      ...guestCartHeaderConfig(id),
    })
    assertApiSuccess(data)
    return unwrapApiPayload(data)
  })
}

export async function addGuestItemToCart(payload, guestCartId) {
  const headerConfig = guestCartHeaderConfig(guestCartId)

  const body = {
    product_id: payload?.product_id ?? payload?.productId,
    quantity: Math.max(1, Number(payload?.quantity) || 1),
  }

  const variantId = payload?.product_variant_id ?? payload?.variant_id ?? payload?.variantId
  if (variantId != null && variantId !== '') {
    body.product_variant_id = variantId
  }

  if (body.product_id == null || body.product_id === '') {
    throw new Error('product_id is required to add an item to guest cart')
  }

  const { data } = await apiClient.post(CART_ENDPOINTS.GUEST_ADD_ITEM, body, {
    ...guestCartRequestConfig,
    ...headerConfig,
  })
  assertApiSuccess(data)
  // Response includes cart_id (record id) — never persist that as guestCartId.
  return unwrapApiPayload(data)
}

export async function updateGuestCartItem(itemId, payload, guestCartId) {
  const lineItemId = String(itemId ?? '').trim()
  if (!lineItemId) {
    throw new Error('Guest cart item id is required to update quantity')
  }

  const { data } = await apiClient.put(
    CART_ENDPOINTS.GUEST_ITEM(lineItemId),
    {
      quantity: Math.max(1, Number(payload?.quantity) || 1),
    },
    {
      ...guestCartRequestConfig,
      ...guestCartHeaderConfig(guestCartId),
    },
  )
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

export async function removeGuestCartItem(itemId, guestCartId) {
  const lineItemId = String(itemId ?? '').trim()
  if (!lineItemId) {
    throw new Error('Guest cart item id is required to remove an item')
  }

  const { data } = await apiClient.delete(CART_ENDPOINTS.GUEST_REMOVE_ITEM(lineItemId), {
    ...guestCartRequestConfig,
    ...guestCartHeaderConfig(guestCartId),
  })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

/**
 * Guest add-to-cart: generate/register a guest cart UUID when needed, then add item.
 */
export async function addGuestProductToCart(payload) {
  let guestCartId = String(selectGuestCartId(store.getState()) ?? '').trim()

  if (!isValidGuestCartId(guestCartId)) {
    if (guestCartId) {
      store.dispatch(setGuestCartId(null))
    }

    const clientGuestCartId = generateGuestCartId()
    const created = await createGuestCart(clientGuestCartId)
    guestCartId = resolveGuestCartId(
      extractGuestCartId(created),
      clientGuestCartId,
    )

    if (!guestCartId) {
      const error = new Error('Guest cart id missing from POST /cart response')
      error.createCartResponse = created
      throw error
    }

    store.dispatch(setGuestCartId(guestCartId))
    await persistor.persist()
  }

  return addGuestItemToCart(payload, guestCartId)
}

/**
 * After login/signup, hand off the guest cart using GET /api/cart/guest with
 * Guest-Cart-Id + Application-Token (+ Authorization when available).
 */
export async function syncGuestCartForAuthenticatedUser() {
  const guestCartId = selectGuestCartId(store.getState())
  const id = requireGuestCartId(guestCartId)
  return dedupeAsync(`guest-cart:${id}`, async () => {
    const { data } = await apiClient.get(CART_ENDPOINTS.GUEST_CART, {
      skipAuthLogout: true,
      ...guestCartHeaderConfig(id),
    })
    assertApiSuccess(data)
    return unwrapApiPayload(data)
  })
}

export async function getAuthenticatedCart() {
  // GET /api/cart/items — returns the authenticated user's cart line items.
  return dedupeAsync('authenticated-cart-items', async () => {
    const { data } = await apiClient.get(CART_ENDPOINTS.ITEMS, { skipAuthLogout: true })
    assertApiSuccess(data)
    return unwrapApiPayload(data)
  })
}

export async function getCartSummary() {
  // GET /api/cart/summary — returns subtotal, fees, discounts, and total for the authenticated user's cart.
  const { data } = await apiClient.get(CART_ENDPOINTS.SUMMARY, { skipAuthLogout: true })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

export async function getCartRecommendations() {
  // GET /api/cart/recommendations — returns product suggestions based on the user's cart.
  const { data } = await apiClient.get(CART_ENDPOINTS.RECOMMENDATIONS, { skipAuthLogout: true })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

export async function createCart(payload = {}) {
  // Guests register via POST /api/cart; authenticated carts load via GET /api/cart/items.
  if (!store.getState().auth.isAuthenticated) {
    return createGuestCart()
  }

  return getAuthenticatedCart()
}

/** Load authenticated cart items once per session (GET /api/cart/items only). */
export async function ensureAuthenticatedCart(payload = {}) {
  if (!store.getState().auth.isAuthenticated) {
    return ensureGuestCartExists()
  }

  if (authenticatedCartReady) {
    return null
  }

  const result = await getAuthenticatedCart()
  authenticatedCartReady = true
  return result
}

export async function addItemToCart(payload) {
  // POST /api/cart/add-item — add a product (and optional variant) to the authenticated user's cart.
  const body = {
    product_id: payload?.product_id ?? payload?.productId,
    quantity: Math.max(1, Number(payload?.quantity) || 1),
  }

  const variantId = payload?.product_variant_id ?? payload?.variant_id ?? payload?.variantId
  if (variantId != null && variantId !== '') {
    body.product_variant_id = variantId
  }

  if (body.product_id == null || body.product_id === '') {
    throw new Error('product_id is required to add an item to cart')
  }

  const { data } = await apiClient.post(CART_ENDPOINTS.ADD_ITEM, body, { skipAuthLogout: true })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

export async function updateCartItemQuantity(itemId, quantity) {
  const lineItemId = String(itemId ?? '').trim()
  if (!lineItemId) {
    throw new Error('Cart item id is required to update quantity')
  }

  const { data } = await apiClient.put(
    CART_ENDPOINTS.ITEM(lineItemId),
    { quantity: Math.max(1, Number(quantity) || 1) },
    { skipAuthLogout: true },
  )
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

export async function updateCartItem(itemId, payload) {
  if (payload?.quantity != null && Object.keys(payload).length === 1) {
    return updateCartItemQuantity(itemId, payload.quantity)
  }

  const lineItemId = String(itemId ?? '').trim()
  if (!lineItemId) {
    throw new Error('Cart item id is required to update a cart item')
  }

  const body = {
    ...payload,
    ...(payload?.quantity != null ? { quantity: Math.max(1, Number(payload.quantity) || 1) } : {}),
  }
  const { data } = await apiClient.put(CART_ENDPOINTS.ITEM(lineItemId), body, {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

export async function updateCartItemSelection(itemId, isSelected) {
  const lineItemId = String(itemId ?? '').trim()
  if (!lineItemId) {
    throw new Error('Cart item id is required to update selection')
  }

  // PATCH /api/cart/items/{item}/selection — select or deselect a cart line item.
  const { data } = await apiClient.patch(
    CART_ENDPOINTS.ITEM_SELECTION(lineItemId),
    { is_selected: Boolean(isSelected) },
    { skipAuthLogout: true },
  )
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

export async function removeCartItem(itemId) {
  const lineItemId = String(itemId ?? '').trim()
  if (!lineItemId) {
    throw new Error('Cart item id is required to remove an item')
  }

  const { data } = await apiClient.delete(CART_ENDPOINTS.REMOVE_ITEM(lineItemId), {
    skipAuthLogout: true,
  })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}
