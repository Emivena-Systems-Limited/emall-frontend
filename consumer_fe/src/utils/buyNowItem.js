import { extractCheckoutSessionId } from '../services/checkoutService'

const STORAGE_KEY = 'consumer_buy_now_item'
const AUTH_PENDING_KEY = 'consumer_buy_now_pending_auth'

export const BUY_NOW_CHECKOUT_PATH = '/checkout/buy-now'

/**
 * "Buy Now" bypasses the cart entirely. The selected item is held here for
 * display after POST /checkout/buy-now starts the session. Guests round-trip
 * through login/register + OTP before the initiate API runs, so this is kept
 * in sessionStorage to survive those full page navigations.
 */

export function getBuyNowAuthLocationState() {
  return {
    from: BUY_NOW_CHECKOUT_PATH,
    intent: 'buy-now',
  }
}

export function isBuyNowCheckoutPath(path) {
  return String(path ?? '') === BUY_NOW_CHECKOUT_PATH
}

export function markBuyNowAuthPending() {
  try {
    sessionStorage.setItem(AUTH_PENDING_KEY, '1')
  } catch {
    // Ignore storage failures (private browsing, quota, etc.).
  }
}

export function clearBuyNowAuthPending() {
  try {
    sessionStorage.removeItem(AUTH_PENDING_KEY)
  } catch {
    // no-op
  }
}

export function isBuyNowAuthPending() {
  try {
    return sessionStorage.getItem(AUTH_PENDING_KEY) === '1' && Boolean(readBuyNowItem())
  } catch {
    return false
  }
}

export function shouldResumeBuyNowAfterAuth(locationState, redirectTo) {
  if (locationState?.intent === 'buy-now' || locationState?.buyNow) return Boolean(readBuyNowItem())
  if (isBuyNowCheckoutPath(redirectTo) || isBuyNowCheckoutPath(locationState?.from)) {
    return Boolean(readBuyNowItem())
  }
  return isBuyNowAuthPending()
}

export function withBuyNowSession(item, initiateKey, response) {
  if (!item) return item

  const session = response && typeof response === 'object' ? response : {}
  const quantity = Math.max(1, Number(session.quantity ?? item.quantity) || 1)
  const unitPrice = Number(session.discounted_price ?? session.unit_price)
  const compareAt = Number(session.unit_price)
  const displaySubtotal = Number(session.total ?? session.total_discounted_price)
  const lineSavings = Number(session.total_discount_amount ?? session.unit_price_discount)

  return {
    ...item,
    quantity,
    price: Number.isFinite(unitPrice) ? unitPrice : item.price,
    compareAt: Number.isFinite(compareAt) && compareAt > (Number.isFinite(unitPrice) ? unitPrice : item.price)
      ? compareAt
      : item.compareAt,
    displaySubtotal: Number.isFinite(displaySubtotal) ? displaySubtotal : item.displaySubtotal,
    lineSavings: Number.isFinite(lineSavings) ? lineSavings : item.lineSavings,
    buyNowInitiatedKey: initiateKey,
    buyNowSession: response ?? null,
    checkoutSessionId: extractCheckoutSessionId(response),
    expiresAt: session.expires_at ?? null,
  }
}

export function getBuyNowCheckoutSessionId(item) {
  const stored = String(item?.checkoutSessionId ?? '').trim()
  if (stored) return stored
  return extractCheckoutSessionId(item?.buyNowSession)
}

export function isBuyNowSessionCurrent(item, initiateKey) {
  return Boolean(item && initiateKey && item.buyNowInitiatedKey === initiateKey)
}

export function saveBuyNowItem(item) {
  if (!item?.productId) return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(item))
  } catch {
    // Ignore storage failures (private browsing, quota, etc.).
  }
}

export function readBuyNowItem() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const item = JSON.parse(raw)
    return item?.productId ? item : null
  } catch {
    return null
  }
}

export function clearBuyNowItem() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
  clearBuyNowAuthPending()
}
