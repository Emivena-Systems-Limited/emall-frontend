export const PRODUCT_ENDPOINTS = {
  BASE: '/api/product',
  CREATE: '/api/product',
  LIST: '/api/product/get/vendor',
  byId: (productId) => `/api/product/${productId}`,
  updateInfoById: (productId) => `/api/product/${productId}`,
  updateVariantById: (productVariantId) => `/api/product/variant/${productVariantId}`,
  createVariantStore: '/api/product/variant/store',
  deleteVariantById: (productVariantId) => `/api/product/variant/trash/${productVariantId}`,
  deleteById: (productId) => `/api/product/trash/${productId}`,
  bulkDelete: '/api/product/multi-trash',
  duplicateById: (productId) => `/api/product/duplicate/${productId}`,
  toggleActiveById: (productId) => `/api/product/set/is_active/${productId}`,
}

export const DEFAULT_PRODUCT_FULFILLMENT_CHANNEL = 'vendor'
