export const AUTHENTICATED_CART_QUERY_KEY = ['authenticated-cart']
export const GUEST_CART_QUERY_KEY = ['guest-cart']
export const CART_SUMMARY_QUERY_KEY = ['cart-summary']
export const CART_RECOMMENDATIONS_QUERY_KEY = ['cart-recommendations']

export const GUEST_CART_HEADER = 'Guest-Cart-Id'

export const CART_ENDPOINTS = {
  CART: '/cart',
  GUEST_CART: '/cart/guest',
  GUEST_ADD_ITEM: '/cart/guest/add-item',
  MERGE: '/cart/merge',
  SUMMARY: '/cart/summary',
  RECOMMENDATIONS: '/cart/recommendations',
  ITEMS: '/cart/items',
  ITEM: (itemId) => `/cart/items/${itemId}`,
  ITEM_SELECTION: (itemId) => `/cart/items/${itemId}/selection`,
}
