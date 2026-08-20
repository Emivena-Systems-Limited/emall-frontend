import {
  buildBuyNowInitiatePayload,
  getBuyNowInitiateKey,
  initiateBuyNow,
} from '../services/checkoutService'
import {
  BUY_NOW_CHECKOUT_PATH,
  clearBuyNowAuthPending,
  isBuyNowSessionCurrent,
  readBuyNowItem,
  saveBuyNowItem,
  withBuyNowSession,
} from './buyNowItem'

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * After login/register OTP succeeds, start the Buy Now session with the
 * authenticated token, then send the shopper to checkout.
 */
export async function continueBuyNowAfterAuth() {
  const item = readBuyNowItem()
  if (!item) return { continued: false }

  const payload = buildBuyNowInitiatePayload(item)
  const initiateKey = getBuyNowInitiateKey(payload)

  if (isBuyNowSessionCurrent(item, initiateKey)) {
    clearBuyNowAuthPending()
    return { continued: true, already: true }
  }

  const response = await initiateBuyNow(payload)
  saveBuyNowItem(withBuyNowSession(item, initiateKey, response))
  clearBuyNowAuthPending()
  return { continued: true }
}

export async function continueBuyNowAfterAuthWithHold(minHoldMs = 700) {
  const [result] = await Promise.all([
    continueBuyNowAfterAuth(),
    wait(minHoldMs),
  ])
  return result
}

export function getBuyNowResumePath() {
  return BUY_NOW_CHECKOUT_PATH
}
