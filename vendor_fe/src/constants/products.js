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

export const PRODUCT_CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'refurbished', label: 'Refurbished' },
]

export const MAX_DESCRIPTIVE_IMAGE_COUNT = 4
export const MAX_DESCRIPTIVE_IMAGE_FILE_BYTES = 1 * 1024 * 1024
export const MAX_DESCRIPTIVE_IMAGES_TOTAL_BYTES = 4 * 1024 * 1024
