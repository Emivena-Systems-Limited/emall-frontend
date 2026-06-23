export const PRODUCT_ENDPOINTS = {
  BASE: '/api/product',
  CREATE: '/api/product',
  LIST: '/api/product/get/vendor',
  byId: (productId) => `/api/product/${productId}`,
  deleteById: (productId) => `/api/product/trash/${productId}`,
  replicateById: (productId) => `/api/product/replicate/${productId}`,
}

export const DEFAULT_PRODUCT_FULFILLMENT_CHANNEL = 'vendor'
