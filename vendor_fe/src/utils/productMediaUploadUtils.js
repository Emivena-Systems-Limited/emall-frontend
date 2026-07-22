import {
  PRODUCT_MEDIA_UPLOAD_CONCURRENCY,
  PRODUCT_MEDIA_UPLOAD_STATUS,
} from '../constants/productMediaUpload';
import { isKeptRemoteProductImage, resolveRemoteProductImageId } from './productImageUtils'

function isFileValue(value) {
  return typeof File !== 'undefined' && value instanceof File
}

function resolveImageFile(image) {
  if (isFileValue(image)) return image
  if (isFileValue(image?.file)) return image.file
  return null
}

/**
 * Stable id sent to the presign API as `content_id`.
 */
export function resolveImageContentId(image) {
  if (!image || typeof image !== 'object') return null
  const contentId = image.content_id ?? image.id
  if (contentId == null || contentId === '') return null
  return String(contentId)
}

export function isImageUploadedToStorage(image) {
  if (!image || typeof image !== 'object') return false
  if (image.uploadStatus !== PRODUCT_MEDIA_UPLOAD_STATUS.UPLOADED) return false

  return Boolean(
    String(image.upload_id ?? '').trim()
    || String(image.s3Path ?? image.storagePath ?? '').trim(),
  )
}

/**
 * Local files that still need presign + S3 upload.
 * Skips remote/kept images and items already uploaded to temp storage.
 */
export function needsPresignedUpload(image) {
  if (!image || typeof image !== 'object') return false
  if (isKeptRemoteProductImage(image)) return false
  if (isImageUploadedToStorage(image)) return false
  return isFileValue(resolveImageFile(image))
}

function toPresignFileDescriptor(image) {
  const file = resolveImageFile(image)

  if (!file) {
    throw new Error('Each new image must have a file before requesting upload URLs.')
  }

  return {
    name: file.name,
    mime_type: file.type || 'application/octet-stream',
    size: file.size,
  }
}

/**
 * Backend presign request body.
 * @typedef {Object} ProductMediaPresignRequest
 * @property {Array<{ name: string, mime_type: string, size: number }>} product_images
 * @property {Array<{ name: string, mime_type: string, size: number }>} description_images
 * @property {Array<{ attribute: string, values: Array<{ value: string, images: Array<{ name: string, mime_type: string, size: number }> }> }>} variations
 */

/**
 * Build the presign payload from AddProduct / EditProduct form media state.
 * Only includes images that still have a local File pending upload.
 *
 * @param {Object} params
 * @param {Object|null} params.mainImage
 * @param {Object[]} [params.subImages]
 * @param {Object[]} [params.descriptiveImages]
 * @param {Object[]} [params.variations]
 * @returns {ProductMediaPresignRequest}
 */
export function buildProductMediaPresignRequest({
  mainImage = null,
  subImages = [],
  descriptiveImages = [],
  variations = [],
} = {}) {
  const product_images = []

  if (mainImage && needsPresignedUpload(mainImage)) {
    product_images.push(toPresignFileDescriptor(mainImage))
  }

  ;(Array.isArray(subImages) ? subImages : [])
    .filter(Boolean)
    .filter(needsPresignedUpload)
    .forEach((image) => {
      product_images.push(toPresignFileDescriptor(image))
    })

  const description_images = (Array.isArray(descriptiveImages) ? descriptiveImages : [])
    .filter(Boolean)
    .filter(needsPresignedUpload)
    .map((image) => toPresignFileDescriptor(image))

  const variationsPayload = []

  for (const variation of variations ?? []) {
    const attribute = variation.attribute?.trim()
    if (!attribute) continue

    const values = []

    for (const variantValue of variation.values ?? []) {
      const value = variantValue.value?.trim()
      if (!value) continue

      const images = (variantValue.images ?? [])
        .filter(Boolean)
        .filter(needsPresignedUpload)
        .map((image) => toPresignFileDescriptor(image))

      if (images.length === 0) continue

      values.push({ value, images })
    }

    if (values.length > 0) {
      variationsPayload.push({ attribute, values })
    }
  }

  return {
    product_images,
    description_images,
    variations: variationsPayload,
  }
}

export function hasPendingProductMediaUploads(presignRequest) {
  if (!presignRequest || typeof presignRequest !== 'object') return false

  if ((presignRequest.product_images ?? []).length > 0) return true
  if ((presignRequest.description_images ?? []).length > 0) return true

  return (presignRequest.variations ?? []).some(
    (group) => (group.values ?? []).some((entry) => (entry.images ?? []).length > 0),
  )
}

/**
 * Flat manifest linking each content_id to its File and form placement.
 * Used to match presign responses and S3 paths back to form state.
 *
 * @typedef {Object} ProductMediaUploadManifestEntry
 * @property {string} content_id
 * @property {File} file
 * @property {'product'|'description'|'variant'} scope
 * @property {number} [sort_order]
 * @property {boolean} [is_primary]
 * @property {number} [groupIndex]
 * @property {number} [valueIndex]
 * @property {string} [attribute]
 * @property {string} [variantValue]
 * @property {Object} image
 */

/**
 * @returns {ProductMediaUploadManifestEntry[]}
 */
export function buildProductMediaUploadManifest({
  mainImage = null,
  subImages = [],
  descriptiveImages = [],
  variations = [],
} = {}) {
  /** @type {ProductMediaUploadManifestEntry[]} */
  const entries = []

  const pushEntry = (image, scope, meta = {}) => {
    if (!needsPresignedUpload(image)) return

    const file = resolveImageFile(image)
    const content_id = resolveImageContentId(image)
    if (!file || !content_id) return

    entries.push({
      content_id,
      file,
      scope,
      image,
      ...meta,
    })
  }

  if (mainImage) {
    pushEntry(mainImage, 'product', { sort_order: 0, is_primary: true })
  }

  ;(Array.isArray(subImages) ? subImages : []).filter(Boolean).forEach((image, index) => {
    pushEntry(image, 'product', {
      sort_order: index + 1,
      is_primary: false,
    })
  })

  ;(Array.isArray(descriptiveImages) ? descriptiveImages : []).filter(Boolean).forEach((image, index) => {
    pushEntry(image, 'description', { sort_order: index })
  })

  for (const [groupIndex, variation] of (variations ?? []).entries()) {
    for (const [valueIndex, variantValue] of (variation.values ?? []).entries()) {
      ;(variantValue.images ?? []).filter(Boolean).forEach((image, imageIndex) => {
        pushEntry(image, 'variant', {
          groupIndex,
          valueIndex,
          attribute: variation.attribute?.trim() ?? '',
          variantValue: variantValue.value?.trim() ?? '',
          sort_order: imageIndex,
          is_primary: imageIndex === 0,
        })
      })
    }
  }

  return entries
}

/**
 * @typedef {Object} ProductMediaPresignTarget
 * @property {string} content_id
 * @property {string} upload_id
 * @property {string} upload_url
 * @property {string} [path]
 * @property {'product'|'description'|'variant'} [scope]
 */

/**
 * Normalize get-signed-urls API response into targets grouped in request order:
 * product_images → description_images → variation images (depth-first).
 *
 * Each item shape:
 * { upload_id, name, mime_type, size, upload_url }
 */
export function flattenPresignResponse(presignResponse) {
  const raw = presignResponse?.data ?? presignResponse ?? {}
  const response = raw.images ?? raw
  /** @type {ProductMediaPresignTarget[]} */
  const targets = []

  for (const item of response.product_images ?? []) {
    targets.push(normalizePresignTarget(item, 'product'))
  }

  for (const item of response.description_images ?? []) {
    targets.push(normalizePresignTarget(item, 'description'))
  }

  for (const group of response.variations ?? []) {
    for (const variantValue of group.values ?? []) {
      for (const item of variantValue.images ?? []) {
        targets.push(normalizePresignTarget(item, 'variant'))
      }
    }
  }

  return targets.filter((target) => target.upload_url && target.upload_id)
}

function resolvePresignedUploadUrl(uploadUrlValue) {
  if (!uploadUrlValue) return ''

  if (typeof uploadUrlValue === 'string') {
    return uploadUrlValue
  }

  if (typeof uploadUrlValue === 'object') {
    return (
      uploadUrlValue.url
      ?? uploadUrlValue.upload_url
      ?? uploadUrlValue.signed_url
      ?? ''
    )
  }

  return ''
}

/** Storage key / path used as image_url after a presigned upload. */
export function resolveImageUrlFromPresignedUpload(uploadUrl, explicitUrl = null) {
  if (explicitUrl) return String(explicitUrl)

  if (!uploadUrl) return null

  try {
    const url = new URL(uploadUrl)
    return decodeURIComponent(url.pathname.replace(/^\/+/, ''))
  } catch {
    return null
  }
}

function normalizePresignTarget(item, scope) {
  const uploadUrlRaw = item?.upload_url ?? item?.uploadUrl ?? item?.signed_url ?? item?.signedUrl ?? null
  const upload_url = resolvePresignedUploadUrl(uploadUrlRaw)
  const explicitImageUrl = item?.image_url ?? item?.imageUrl ?? item?.path ?? item?.key ?? null

  return {
    upload_id: String(item?.upload_id ?? item?.uploadId ?? ''),
    name: String(item?.name ?? ''),
    mime_type: String(item?.mime_type ?? item?.mimeType ?? ''),
    size: Number(item?.size ?? 0),
    upload_url,
    image_url: resolveImageUrlFromPresignedUpload(upload_url, explicitImageUrl),
    path: item?.path ?? item?.key ?? item?.storage_path ?? item?.storagePath ?? null,
    scope,
  }
}

function groupPresignTargetsByScope(presignTargets) {
  const groups = {
    product: [],
    description: [],
    variant: [],
  }

  for (const target of presignTargets) {
    if (groups[target.scope]) {
      groups[target.scope].push(target)
    }
  }

  return groups
}

function findPresignTargetForManifestEntry(entry, scopeTargets, scopeIndex, presignTargets) {
  const nextIndex = scopeIndex[entry.scope] ?? 0
  const orderedTarget = scopeTargets[entry.scope]?.[nextIndex]

  if (orderedTarget?.upload_url && orderedTarget?.upload_id) {
    scopeIndex[entry.scope] = nextIndex + 1
    return { target: orderedTarget }
  }

  const fileName = entry.file?.name ?? ''
  const fileSize = entry.file?.size ?? 0

  const fallbackTarget = presignTargets.find((candidate) => (
    candidate.scope === entry.scope
    && candidate.name === fileName
    && candidate.size === fileSize
    && candidate.upload_url
    && candidate.upload_id
  ))

  if (fallbackTarget) {
    return { target: fallbackTarget }
  }

  return null
}

/**
 * Join manifest entries with presign targets ready for S3 upload.
 * Matches in request order within each scope (product → description → variant).
 * Falls back to name + size when order-based matching fails.
 *
 * @param {ProductMediaUploadManifestEntry[]} manifest
 * @param {ProductMediaPresignTarget[]} presignTargets
 */
export function mergePresignTargetsWithManifest(manifest, presignTargets) {
  const scopeTargets = groupPresignTargetsByScope(presignTargets)
  const scopeIndex = {
    product: 0,
    description: 0,
    variant: 0,
  }

  return manifest.map((entry, index) => {
    const match = findPresignTargetForManifestEntry(
      entry,
      scopeTargets,
      scopeIndex,
      presignTargets,
    )

    if (!match?.target?.upload_url || !match?.target?.upload_id) {
      const label = entry.file?.name ?? `image ${index + 1}`
      throw new Error(`Missing presigned upload URL for "${label}".`)
    }

    return {
      ...entry,
      upload_url: match.target.upload_url,
      upload_id: match.target.upload_id,
      image_url: match.target.image_url ?? null,
      presigned_path: match.target.path ?? match.target.image_url ?? null,
    }
  })
}

/**
 * PUT a file to a presigned S3 URL (matches backend uploadFile contract).
 * Success is determined by response.ok — storage is tracked via upload_id from presign.
 */
export async function uploadFileToPresignedUrl({
  uploadUrl,
  file,
  mimeType,
  signal,
}) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': mimeType || file.type || 'application/octet-stream',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Upload failed for ${file.name} (${response.status}).`)
  }
}

async function runWithConcurrency(items, worker, concurrency = PRODUCT_MEDIA_UPLOAD_CONCURRENCY) {
  if (items.length === 0) return []

  const results = new Array(items.length)
  let nextIndex = 0

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      results[currentIndex] = await worker(items[currentIndex], currentIndex)
    }
  }

  const workerCount = Math.min(concurrency, items.length)
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()))

  return results
}

/**
 * @typedef {Object} ProductMediaUploadResult
 * @property {string} content_id
 * @property {string} upload_id
 * @property {string} [path]
 * @property {'product'|'description'|'variant'} scope
 */

/**
 * Upload all pending manifest entries to S3.
 *
 * @param {ReturnType<typeof mergePresignTargetsWithManifest>} uploadJobs
 * @param {Object} [options]
 * @param {number} [options.concurrency]
 * @param {AbortSignal} [options.signal]
 * @param {(entry: Object) => void} [options.onItemStart]
 * @param {(result: ProductMediaUploadResult) => void} [options.onItemComplete]
 * @param {(entry: Object, error: Error) => void} [options.onItemError]
 * @returns {Promise<ProductMediaUploadResult[]>}
 */
export async function runProductMediaUploads(uploadJobs, options = {}) {
  const {
    concurrency = PRODUCT_MEDIA_UPLOAD_CONCURRENCY,
    signal,
    onItemStart,
    onItemComplete,
    onItemError,
  } = options

  return runWithConcurrency(
    uploadJobs,
    async (job) => {
      onItemStart?.(job)

      try {
        await uploadFileToPresignedUrl({
          uploadUrl: job.upload_url,
          file: job.file,
          mimeType: job.file.type,
          signal,
        })

        const result = {
          content_id: job.content_id,
          upload_id: job.upload_id,
          image_url: job.upload_id,
          path: job.presigned_path ?? job.image_url ?? null,
          scope: job.scope,
          sort_order: job.sort_order,
          is_primary: job.is_primary,
          groupIndex: job.groupIndex,
          valueIndex: job.valueIndex,
          attribute: job.attribute,
          variantValue: job.variantValue,
        }

        onItemComplete?.(result)
        return result
      } catch (error) {
        onItemError?.(job, error)
        throw error
      }
    },
    concurrency,
  )
}

export function markImageUploadStatus(image, status, error = null) {
  if (!image || typeof image !== 'object') return image

  return {
    ...image,
    uploadStatus: status,
    uploadError: error?.message ?? error ?? null,
  }
}

export function attachUploadResultToImage(image, { upload_id, image_url = null, path = null }) {
  if (!image || typeof image !== 'object') return image

  const resolvedImageUrl = upload_id ?? image_url ?? path

  return {
    ...image,
    file: null,
    upload_id,
    image_url: resolvedImageUrl != null ? String(resolvedImageUrl) : null,
    s3Path: path ?? null,
    storagePath: path ?? null,
    uploadStatus: PRODUCT_MEDIA_UPLOAD_STATUS.UPLOADED,
    uploadError: null,
    isRemote: false,
    remoteId: resolveRemoteProductImageId(image),
  }
}

/** @deprecated Use attachUploadResultToImage */
export function attachUploadedPathToImage(image, path) {
  return attachUploadResultToImage(image, { upload_id: image?.upload_id, path })
}

/**
 * Apply upload results back onto form media state using content_id.
 *
 * @param {Object} mediaState
 * @param {ProductMediaUploadResult[]} uploadResults
 */
export function applyUploadedPathsToProductMedia(mediaState, uploadResults = []) {
  const resultByContentId = new Map(
    uploadResults.map((result) => [result.content_id, result]),
  )

  const applyToImage = (image) => {
    if (!image) return image

    const contentId = resolveImageContentId(image)
    const result = resultByContentId.get(contentId)
    if (!result) return image

    return attachUploadResultToImage(image, {
      upload_id: result.upload_id,
      image_url: result.image_url,
      path: result.path,
    })
  }

  const subImages = (mediaState.subImages ?? []).map(applyToImage)
  const descriptiveImages = (mediaState.descriptiveImages ?? []).map(applyToImage)
  const variations = (mediaState.variations ?? []).map((variation) => ({
    ...variation,
    values: (variation.values ?? []).map((variantValue) => ({
      ...variantValue,
      images: (variantValue.images ?? []).map(applyToImage),
    })),
  }))

  return {
    mainImage: applyToImage(mediaState.mainImage),
    subImages,
    descriptiveImages,
    variations,
  }
}

export function buildUploadResultsMap(uploadResults = []) {
  return new Map(uploadResults.map((result) => [result.content_id, result]))
}

export function countPendingProductMediaUploads(mediaState) {
  const manifest = buildProductMediaUploadManifest(mediaState)
  return manifest.length
}

export function countUploadedProductMedia(mediaState) {
  let count = 0

  const inspect = (image) => {
    if (isImageUploadedToStorage(image)) count += 1
  }

  inspect(mediaState.mainImage)
  ;(mediaState.subImages ?? []).forEach(inspect)
  ;(mediaState.descriptiveImages ?? []).forEach(inspect)
  ;(mediaState.variations ?? []).forEach((variation) => {
    ;(variation.values ?? []).forEach((variantValue) => {
      ;(variantValue.images ?? []).forEach(inspect)
    })
  })

  return count
}

function resolveImageUploadId(image) {
  if (!image || typeof image !== 'object') return null
  const uploadId = image.upload_id ?? null
  if (uploadId == null || uploadId === '') return null
  return String(uploadId)
}

function resolveImageUrl(image) {
  if (!image || typeof image !== 'object') return null

  const url = image.image_url ?? image.s3Path ?? image.storagePath ?? null
  if (url == null || url === '') return null

  return String(url)
}

function toSavedProductImage(image, index) {
  const uploadId = resolveImageUploadId(image)
  const imageUrl = resolveImageUrl(image)
  const remoteId = resolveRemoteProductImageId(image)

  if (uploadId) {
    return {
      upload_id: uploadId,
      sort_order: index,
      is_primary: index === 0,
    }
  }

  if (imageUrl) {
    return {
      image_url: imageUrl,
      sort_order: index,
      is_primary: index === 0,
    }
  }

  if (remoteId) {
    return {
      id: remoteId,
      sort_order: index,
      is_primary: index === 0,
    }
  }

  return null
}

/**
 * Image sections for the final product create/update JSON once S3 uploads are complete.
 * Wire into productPayload when the backend accepts path-based media instead of FormData files.
 */
export function buildProductMediaSaveImagesPayload({
  mainImage = null,
  subImages = [],
  descriptiveImages = [],
  variations = [],
} = {}) {
  const product_images = [mainImage, ...(Array.isArray(subImages) ? subImages : [])]
    .filter(Boolean)
    .map((image, index) => toSavedProductImage(image, index))
    .filter(Boolean)

  const description_images = (Array.isArray(descriptiveImages) ? descriptiveImages : [])
    .filter(Boolean)
    .map((image, index) => toSavedProductImage(image, index))
    .filter(Boolean)

  const variationsPayload = (variations ?? [])
    .map((variation) => {
      const attribute = variation.attribute?.trim()
      if (!attribute) return null

      const values = (variation.values ?? [])
        .map((variantValue) => {
          const value = variantValue.value?.trim()
          if (!value) return null

          const images = (variantValue.images ?? [])
            .filter(Boolean)
            .map((image, index) => toSavedProductImage(image, index))
            .filter(Boolean)

          if (images.length === 0 && !variantValue.image_url) return null

          return { value, images }
        })
        .filter(Boolean)

      if (values.length === 0) return null

      return { attribute, values }
    })
    .filter(Boolean)

  return {
    product_images,
    description_images,
    variations: variationsPayload,
  }
}
