import { queryClient } from '../lib/queryClient'
import {
  CART_RECOMMENDATIONS_QUERY_KEY,
  GUEST_CART_QUERY_KEY,
} from '../constants/cart'

export function invalidateCartRecommendations() {
  return queryClient.invalidateQueries({ queryKey: CART_RECOMMENDATIONS_QUERY_KEY })
}

export function invalidateAuthenticatedCart() {
  // GET /api/cart/items is not used for routine refresh — cart state lives in Redux.
  return Promise.resolve()
}

export function invalidateGuestCart() {
  return queryClient.invalidateQueries({ queryKey: GUEST_CART_QUERY_KEY })
}

/** After add/remove/clear — refresh guest cart only when needed. */
export function invalidateCartCompositionQueries() {
  return Promise.all([
    invalidateCartRecommendations(),
    invalidateGuestCart(),
  ])
}

/** Cart totals are computed locally — no /cart/summary refetch. */
export function invalidateCartTotalsQueries() {
  return Promise.resolve()
}
