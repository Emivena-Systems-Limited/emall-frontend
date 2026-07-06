import { CART_ENDPOINTS, GUEST_CART_HEADER } from '../constants/cart'
import apiClient from '../lib/apiClient'
import { persistor, store } from '../store/store'
import { selectGuestCartId, setGuestCartId } from '../store/slices/cartSlice'
import { extractGuestCartId } from '../utils/normalizeCart'
import { generateGuestCartId, isValidGuestCartId, requireGuestCartId, resolveGuestCartId } from '../utils/guestCartId'

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
  const { data } = await apiClient.get(CART_ENDPOINTS.GUEST_CART, {
    ...guestCartRequestConfig,
    ...guestCartHeaderConfig(guestCartId),
  })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
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
  const { data } = await apiClient.get(CART_ENDPOINTS.GUEST_CART, {
    skipAuthLogout: true,
    ...guestCartHeaderConfig(),
  })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

export async function getAuthenticatedCart() {
  // GET /api/cart — returns the authenticated user's cart and line items.
  const { data } = await apiClient.get(CART_ENDPOINTS.CART, { skipAuthLogout: true })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
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
  // POST /api/cart — authenticated users; guests should use createGuestCart().
  if (!store.getState().auth.isAuthenticated) {
    return createGuestCart()
  }

  const { data } = await apiClient.post(CART_ENDPOINTS.CART, payload, { skipAuthLogout: true })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

export async function addItemToCart(payload) {
  // POST /api/cart/items — add a product (and optional variant) to the authenticated user's cart.
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

  const { data } = await apiClient.post(CART_ENDPOINTS.ITEMS, body, { skipAuthLogout: true })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

export async function updateCartItem(itemId, payload) {
  const body = {
    ...payload,
    ...(payload?.quantity != null ? { quantity: Math.max(1, Number(payload.quantity) || 1) } : {}),
  }
  const { data } = await apiClient.put(CART_ENDPOINTS.ITEM(itemId), body, {
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

export async function mergeCart(items = []) {
  // POST /api/cart/merge — merges a guest's local cart lines into the newly
  // authenticated user's cart, creating the cart first if one doesn't exist yet.
  const { data } = await apiClient.post(
    CART_ENDPOINTS.MERGE,
    { items },
    { skipAuthLogout: true },
  )
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}

/**
 * Merges guest cart items into the authenticated user's account cart.
 * Prefers the single-call `POST /cart/merge` endpoint; if the backend hasn't
 * shipped that route yet (404), falls back to the existing primitives so the
 * guest-to-account handoff still works: ensure a cart exists, replay each
 * guest line through POST /cart/items, then fetch the resulting cart.
 */
export async function mergeGuestCartIntoAccount(items = []) {
  try {
    return await mergeCart(items)
  } catch (error) {
    if (error?.response?.status !== 404) throw error

    await createCart().catch(() => {})
    await Promise.allSettled(items.map((item) => addItemToCart(item)))
    return getAuthenticatedCart()
  }
}

export async function removeCartItem(itemId) {
  const lineItemId = String(itemId ?? '').trim()
  if (!lineItemId) {
    throw new Error('Cart item id is required to remove an item')
  }

  const { data } = await apiClient.delete(CART_ENDPOINTS.ITEM(lineItemId), { skipAuthLogout: true })
  assertApiSuccess(data)
  return unwrapApiPayload(data)
}
