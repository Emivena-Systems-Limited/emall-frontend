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

/** Product card thumbnail — square slot in search & category grids (ProductCard). */
export const PRIMARY_PRODUCT_IMAGE_WIDTH = 1000
export const PRIMARY_PRODUCT_IMAGE_HEIGHT = 1000
export const PRIMARY_PRODUCT_IMAGE_RECOMMENDED_LABEL = `${PRIMARY_PRODUCT_IMAGE_WIDTH} × ${PRIMARY_PRODUCT_IMAGE_HEIGHT} px`
export const PRIMARY_PRODUCT_IMAGE_ASPECT_TOLERANCE = 0.08
export const PRIMARY_PRODUCT_IMAGE_MIN_SCALE = 0.8
export const PRIMARY_PRODUCT_IMAGE_MAX_SCALE = 1.3

/** Product details hero gallery — square on mobile, 1.45:1 on desktop (ProductImageGallery). */
export const FEATURED_PRODUCT_IMAGE_WIDTH = 1450
export const FEATURED_PRODUCT_IMAGE_HEIGHT = 1000
export const FEATURED_PRODUCT_IMAGE_RECOMMENDED_LABEL = `${FEATURED_PRODUCT_IMAGE_WIDTH} × ${FEATURED_PRODUCT_IMAGE_HEIGHT} px`
export const FEATURED_PRODUCT_IMAGE_ASPECT_TOLERANCE = 0.12
export const FEATURED_PRODUCT_IMAGE_MIN_SCALE = 0.8
export const FEATURED_PRODUCT_IMAGE_MAX_SCALE = 1.3

/** Product detail grid banners — target upload & display ratio. */
export const DESCRIPTIVE_IMAGE_WIDTH = 970
export const DESCRIPTIVE_IMAGE_HEIGHT = 600
export const DESCRIPTIVE_IMAGE_RECOMMENDED_LABEL = `${DESCRIPTIVE_IMAGE_WIDTH} × ${DESCRIPTIVE_IMAGE_HEIGHT} px`
export const DESCRIPTIVE_IMAGE_ASPECT_TOLERANCE = 0.12
export const DESCRIPTIVE_IMAGE_MIN_SCALE = 0.8
export const DESCRIPTIVE_IMAGE_MAX_SCALE = 1.3
export const DESCRIPTIVE_IMAGE_DISPLAY_GRID_SIZE = 4

export const MAX_DESCRIPTIVE_IMAGE_COUNT = 4
export const MAX_DESCRIPTIVE_IMAGE_FILE_BYTES = 2 * 1024 * 1024
export const MAX_DESCRIPTIVE_IMAGES_TOTAL_BYTES = 8 * 1024 * 1024
