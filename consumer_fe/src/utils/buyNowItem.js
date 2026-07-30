const STORAGE_KEY = 'consumer_buy_now_item'

/**
 * "Buy Now" bypasses the cart entirely — the selected item (and its
 * quantity/variant) lives here, not in Redux or the backend cart, until the
 * order is placed through the single-item checkout flow. Guests round-trip
 * through login/register + OTP before landing back on checkout, so this is
 * kept in sessionStorage to survive those full page navigations.
 */
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
}
