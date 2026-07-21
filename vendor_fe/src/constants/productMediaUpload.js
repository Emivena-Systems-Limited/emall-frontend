/** Presigned S3 media upload — API routes and client-side upload settings. */

export const PRODUCT_MEDIA_ENDPOINTS = {
  /** Batch presign — JSON body: { product_images, description_images, variations } with { name, mime_type, size } per image. */
  GET_SIGNED_URLS: '/api/product/images/get-signed-urls',
}

export const PRODUCT_MEDIA_UPLOAD_STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  FAILED: 'failed',
}

/** Parallel S3 PUT limit — avoids saturating the browser/network. */
export const PRODUCT_MEDIA_UPLOAD_CONCURRENCY = 4

/** Enable presigned upload flow. Set VITE_USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD=false to disable. */
export const USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD =
  import.meta.env.VITE_USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD !== 'false'

/**
 * Stages shown in the publish progress modal. Mirrors the flow:
 * request signed URLs → upload each image to storage → create the product.
 */
export const PRODUCT_PUBLISH_STAGE = {
  IDLE: 'idle',
  REQUESTING_URLS: 'requesting-urls',
  UPLOADING_IMAGES: 'uploading-images',
  CREATING_PRODUCT: 'creating-product',
  SUCCESS: 'success',
  ERROR: 'error',
}

export const PRODUCT_PUBLISH_STAGE_ORDER = [
  PRODUCT_PUBLISH_STAGE.REQUESTING_URLS,
  PRODUCT_PUBLISH_STAGE.UPLOADING_IMAGES,
  PRODUCT_PUBLISH_STAGE.CREATING_PRODUCT,
  PRODUCT_PUBLISH_STAGE.SUCCESS,
]
