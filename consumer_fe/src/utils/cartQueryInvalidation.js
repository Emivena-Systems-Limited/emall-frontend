import { queryClient } from '../lib/queryClient'
import {
  AUTHENTICATED_CART_QUERY_KEY,
  CART_RECOMMENDATIONS_QUERY_KEY,
  CART_SUMMARY_QUERY_KEY,
  GUEST_CART_QUERY_KEY,
} from '../constants/cart'

export function invalidateCartSummary() {
  return queryClient.invalidateQueries({ queryKey: CART_SUMMARY_QUERY_KEY })
}

export function invalidateCartRecommendations() {
  return queryClient.invalidateQueries({ queryKey: CART_RECOMMENDATIONS_QUERY_KEY })
}

export function invalidateAuthenticatedCart() {
  return queryClient.invalidateQueries({ queryKey: AUTHENTICATED_CART_QUERY_KEY })
}

export function invalidateGuestCart() {
  return queryClient.invalidateQueries({ queryKey: GUEST_CART_QUERY_KEY })
}

/** After add/remove/clear — cart composition changed. */
export function invalidateCartCompositionQueries() {
  return Promise.all([
    invalidateCartSummary(),
    invalidateCartRecommendations(),
    invalidateGuestCart(),
  ])
}

/** After quantity or selection changes — totals only. */
export function invalidateCartTotalsQueries() {
  return invalidateCartSummary()
}
