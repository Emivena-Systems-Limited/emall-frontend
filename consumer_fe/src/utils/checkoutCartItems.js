import { resolveCartLineItemId } from './normalizeCart'

export const CHECKOUT_CART_ITEM_IDS_KEY = 'ez-stores-checkout-cart-item-ids'

export function uniqueCartItemIds(ids = []) {
  const seen = new Set()
  const result = []

  for (const value of Array.isArray(ids) ? ids : []) {
    const id = String(value ?? '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    result.push(id)
  }

  return result
}

export function collectSelectedCartItemIds(items = []) {
  return uniqueCartItemIds(
    items
      .filter((item) => item?.selected !== false)
      .map((item) => resolveCartLineItemId(item)),
  )
}

export function persistCheckoutCartItemIds(ids = []) {
  const unique = uniqueCartItemIds(ids)

  try {
    if (unique.length === 0) {
      sessionStorage.removeItem(CHECKOUT_CART_ITEM_IDS_KEY)
    } else {
      sessionStorage.setItem(CHECKOUT_CART_ITEM_IDS_KEY, JSON.stringify(unique))
    }
  } catch (error) {
    console.error('Error persisting checkout cart item ids', error)
  }

  return unique
}

export function readCheckoutCartItemIds() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_CART_ITEM_IDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? uniqueCartItemIds(parsed) : []
  } catch {
    return []
  }
}

export function clearCheckoutCartItemIds() {
  try {
    sessionStorage.removeItem(CHECKOUT_CART_ITEM_IDS_KEY)
  } catch (error) {
    console.error('Error clearing checkout cart item ids', error)
  }
}

export function resolveCheckoutCartItemIds({ navIds, cartItems } = {}) {
  const fromNav = uniqueCartItemIds(Array.isArray(navIds) ? navIds : [])
  if (fromNav.length > 0) return fromNav

  const persisted = readCheckoutCartItemIds()
  if (persisted.length > 0) return persisted

  return collectSelectedCartItemIds(cartItems)
}

export function filterCartItemsByIds(items = [], ids = []) {
  const idSet = new Set(uniqueCartItemIds(ids))
  if (idSet.size === 0) return []

  return items.filter((item) => {
    const lineId = resolveCartLineItemId(item)
    return Boolean(lineId) && idSet.has(lineId)
  })
}
