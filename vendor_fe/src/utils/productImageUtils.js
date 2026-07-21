import {
  DESCRIPTIVE_IMAGE_ASPECT_TOLERANCE,
  DESCRIPTIVE_IMAGE_HEIGHT,
  DESCRIPTIVE_IMAGE_MAX_SCALE,
  DESCRIPTIVE_IMAGE_MIN_SCALE,
  DESCRIPTIVE_IMAGE_RECOMMENDED_LABEL,
  DESCRIPTIVE_IMAGE_WIDTH,
  FEATURED_PRODUCT_IMAGE_ASPECT_TOLERANCE,
  FEATURED_PRODUCT_IMAGE_HEIGHT,
  FEATURED_PRODUCT_IMAGE_MAX_SCALE,
  FEATURED_PRODUCT_IMAGE_MIN_SCALE,
  FEATURED_PRODUCT_IMAGE_RECOMMENDED_LABEL,
  FEATURED_PRODUCT_IMAGE_WIDTH,
  MAX_DESCRIPTIVE_IMAGE_COUNT,
  MAX_DESCRIPTIVE_IMAGE_FILE_BYTES,
  MAX_DESCRIPTIVE_IMAGES_TOTAL_BYTES,
  PRIMARY_PRODUCT_IMAGE_ASPECT_TOLERANCE,
  PRIMARY_PRODUCT_IMAGE_HEIGHT,
  PRIMARY_PRODUCT_IMAGE_MAX_SCALE,
  PRIMARY_PRODUCT_IMAGE_MIN_SCALE,
  PRIMARY_PRODUCT_IMAGE_LANDSCAPE_EXAMPLE_LABEL,
  PRIMARY_PRODUCT_IMAGE_RECOMMENDED_LABEL,
  PRIMARY_PRODUCT_IMAGE_WIDTH,
  PRODUCT_IMAGE_MAX_ASPECT_RATIO,
  PRODUCT_IMAGE_MAX_LONG_EDGE_PX,
  PRODUCT_IMAGE_MIN_ASPECT_RATIO,
  PRODUCT_IMAGE_MIN_SHORT_EDGE_PX,
} from '../constants/products'

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_PRODUCT_IMAGE_COUNT = 5
export const MIN_GALLERY_IMAGE_COUNT = 1
export const MAX_PRODUCT_IMAGES_TOTAL_BYTES = 5 * 1024 * 1024

/** @deprecated Per-file size is no longer enforced; use total collection limits instead. */
export const MAX_IMAGE_FILE_SIZE = MAX_PRODUCT_IMAGES_TOTAL_BYTES

export function isAcceptedProductImageType(file) {
  return Boolean(file && ACCEPTED_IMAGE_TYPES.includes(file.type))
}

export function isValidProductImageFile(file) {
  return isAcceptedProductImageType(file)
}

export function getProductImageByteSize(image) {
  if (!image?.file) return 0
  return image.file.size
}

export function countProductImages(mainImage, subImages = []) {
  return (mainImage ? 1 : 0) + subImages.length
}

export function sumProductImagesBytes(mainImage, subImages = []) {
  return [mainImage, ...subImages]
    .filter(Boolean)
    .reduce((total, image) => total + getProductImageByteSize(image), 0)
}

export function formatImageStorageSize(bytes) {
  const size = Number(bytes) || 0
  if (size < 1024) return `${size} B`
  const mb = size / (1024 * 1024)
  if (mb >= 0.1) return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`
  return `${Math.round(size / 1024)} KB`
}

export function getProductImageLimitsSummary(mainImage, subImages = []) {
  const count = countProductImages(mainImage, subImages)
  const bytes = sumProductImagesBytes(mainImage, subImages)

  return {
    count,
    bytes,
    maxCount: MAX_PRODUCT_IMAGE_COUNT,
    maxBytes: MAX_PRODUCT_IMAGES_TOTAL_BYTES,
    remainingSlots: Math.max(0, MAX_PRODUCT_IMAGE_COUNT - count),
    remainingBytes: Math.max(0, MAX_PRODUCT_IMAGES_TOTAL_BYTES - bytes),
  }
}

export function validateProductImageLimits(mainImage, subImages = []) {
  const { count, bytes } = getProductImageLimitsSummary(mainImage, subImages)

  if (count > MAX_PRODUCT_IMAGE_COUNT) {
    return {
      valid: false,
      message: `You can upload at most ${MAX_PRODUCT_IMAGE_COUNT} images (including the main photo).`,
    }
  }

  if (bytes > MAX_PRODUCT_IMAGES_TOTAL_BYTES) {
    return {
      valid: false,
      message: `Total image size cannot exceed ${formatImageStorageSize(MAX_PRODUCT_IMAGES_TOTAL_BYTES)} (currently ${formatImageStorageSize(bytes)}).`,
    }
  }

  return { valid: true }
}

export function validateGalleryImagesRequired(mainImage, subImages = []) {
  if (!mainImage) {
    return {
      valid: false,
      message: 'Add a main product image to continue',
    }
  }

  const galleryCount = (Array.isArray(subImages) ? subImages : []).filter(Boolean).length
  if (galleryCount < MIN_GALLERY_IMAGE_COUNT) {
    return {
      valid: false,
      message: `Add at least ${MIN_GALLERY_IMAGE_COUNT} gallery image in addition to the main photo.`,
    }
  }

  return { valid: true }
}

export function validateProductImagesForStep(mainImage, subImages = []) {
  const galleryResult = validateGalleryImagesRequired(mainImage, subImages)
  if (!galleryResult.valid) {
    return galleryResult
  }

  return validateProductImageLimits(mainImage, subImages)
}

export function getStandaloneImageLimitsSummary(
  images = [],
  {
    maxCount = MAX_PRODUCT_IMAGE_COUNT,
    maxBytes = MAX_PRODUCT_IMAGES_TOTAL_BYTES,
  } = {},
) {
  const normalized = (Array.isArray(images) ? images : []).filter(Boolean)
  const count = normalized.length
  const bytes = normalized.reduce((total, image) => total + getProductImageByteSize(image), 0)

  return {
    count,
    bytes,
    maxCount,
    maxBytes,
    remainingSlots: Math.max(0, maxCount - count),
    remainingBytes: Math.max(0, maxBytes - bytes),
  }
}

export function validateStandaloneImageLimits(
  images = [],
  {
    maxCount = MAX_PRODUCT_IMAGE_COUNT,
    maxBytes = MAX_PRODUCT_IMAGES_TOTAL_BYTES,
    maxFileBytes = null,
    label = 'images',
  } = {},
) {
  const normalized = (Array.isArray(images) ? images : []).filter(Boolean)
  const { count, bytes } = getStandaloneImageLimitsSummary(normalized, { maxCount, maxBytes })

  if (maxFileBytes) {
    const oversizedIndex = normalized.findIndex(
      (image) => getProductImageByteSize(image) > maxFileBytes,
    )
    if (oversizedIndex >= 0) {
      const singularLabel = label.endsWith('s') ? label.slice(0, -1) : label
      return {
        valid: false,
        message: `Each ${singularLabel} must not exceed ${formatImageStorageSize(maxFileBytes)} (check image ${oversizedIndex + 1}).`,
      }
    }
  }

  if (count > maxCount) {
    return {
      valid: false,
      message: `You can upload at most ${maxCount} ${label}.`,
    }
  }

  if (bytes > maxBytes) {
    return {
      valid: false,
      message: `Total ${label} size cannot exceed ${formatImageStorageSize(maxBytes)} (currently ${formatImageStorageSize(bytes)}).`,
    }
  }

  return { valid: true }
}

export function pickStandaloneImageFiles({
  images = [],
  files = [],
  maxCount = MAX_PRODUCT_IMAGE_COUNT,
  maxBytes = MAX_PRODUCT_IMAGES_TOTAL_BYTES,
  maxFileBytes = null,
}) {
  const typeValidFiles = files.filter(isAcceptedProductImageType)
  const summary = getStandaloneImageLimitsSummary(images, { maxCount, maxBytes })
  const notices = []

  if (files.length > 0 && typeValidFiles.length === 0) {
    return {
      accepted: [],
      notices: ['Only JPG and PNG images are allowed.'],
    }
  }

  if (files.length > typeValidFiles.length) {
    notices.push('Some files were skipped because only JPG and PNG images are allowed.')
  }

  if (summary.remainingSlots <= 0) {
    return {
      accepted: [],
      notices: [
        ...notices,
        `You can upload at most ${maxCount} image${maxCount === 1 ? '' : 's'}.`,
      ],
    }
  }

  const accepted = []
  let runningBytes = summary.bytes
  let skippedOversized = 0

  for (const file of typeValidFiles) {
    if (accepted.length >= summary.remainingSlots) break
    if (maxFileBytes && file.size > maxFileBytes) {
      skippedOversized += 1
      continue
    }
    if (runningBytes + file.size > maxBytes) break
    accepted.push(file)
    runningBytes += file.size
  }

  if (skippedOversized > 0) {
    notices.push(
      `Some files were skipped because each image must not exceed ${formatImageStorageSize(maxFileBytes)}.`,
    )
  }

  if (accepted.length === 0 && typeValidFiles.length > 0) {
    notices.push(
      summary.remainingBytes <= 0
        ? `Total image size cannot exceed ${formatImageStorageSize(maxBytes)}.`
        : `No more images fit within the ${formatImageStorageSize(maxBytes)} total limit.`,
    )
  } else if (accepted.length < typeValidFiles.length - skippedOversized) {
    notices.push(`Only ${accepted.length} photo(s) were added due to image limits.`)
  }

  return { accepted, notices }
}

/**
 * Pick incoming files that fit count and combined size limits.
 * @param {'main'|'gallery'} target
 */
export function pickProductImageFiles({
  mainImage = null,
  subImages = [],
  files = [],
  target = 'gallery',
}) {
  const typeValidFiles = files.filter(isAcceptedProductImageType)
  const summary = getProductImageLimitsSummary(mainImage, subImages)
  const notices = []

  if (files.length > 0 && typeValidFiles.length === 0) {
    return {
      accepted: [],
      notices: ['Only JPG and PNG images are allowed.'],
    }
  }

  if (files.length > typeValidFiles.length) {
    notices.push('Some files were skipped because only JPG and PNG images are allowed.')
  }

  if (target === 'main') {
    const file = typeValidFiles[0]
    if (!file) {
      return { accepted: [], notices }
    }

    if (typeValidFiles.length > 1) {
      notices.push('Only one main photo can be selected at a time.')
    }

    const replacingMain = Boolean(mainImage)
    const nextCount = replacingMain ? summary.count : summary.count + 1
    if (nextCount > MAX_PRODUCT_IMAGE_COUNT) {
      return {
        accepted: [],
        notices: [
          ...notices,
          `You can upload at most ${MAX_PRODUCT_IMAGE_COUNT} images. Remove a gallery photo first.`,
        ],
      }
    }

    const mainBytes = getProductImageByteSize(mainImage)
    const nextBytes = summary.bytes - mainBytes + file.size
    if (nextBytes > MAX_PRODUCT_IMAGES_TOTAL_BYTES) {
      return {
        accepted: [],
        notices: [
          ...notices,
          `This photo would exceed the ${formatImageStorageSize(MAX_PRODUCT_IMAGES_TOTAL_BYTES)} total limit for all images.`,
        ],
      }
    }

    return { accepted: [file], notices }
  }

  if (summary.remainingSlots <= 0) {
    return {
      accepted: [],
      notices: [
        ...notices,
        `You can upload at most ${MAX_PRODUCT_IMAGE_COUNT} images (including the main photo).`,
      ],
    }
  }

  const accepted = []
  let runningBytes = summary.bytes

  for (const file of typeValidFiles) {
    if (accepted.length >= summary.remainingSlots) break
    if (runningBytes + file.size > MAX_PRODUCT_IMAGES_TOTAL_BYTES) break
    accepted.push(file)
    runningBytes += file.size
  }

  if (accepted.length === 0 && typeValidFiles.length > 0) {
    notices.push(
      summary.remainingBytes <= 0
        ? `Total image size cannot exceed ${formatImageStorageSize(MAX_PRODUCT_IMAGES_TOTAL_BYTES)}.`
        : `No more images fit within the ${formatImageStorageSize(MAX_PRODUCT_IMAGES_TOTAL_BYTES)} total limit.`,
    )
  } else if (accepted.length < typeValidFiles.length) {
    const hitCountLimit = accepted.length >= summary.remainingSlots
    const hitSizeLimit = accepted.length < typeValidFiles.length && !hitCountLimit
    if (hitCountLimit && hitSizeLimit) {
      notices.push(`Only ${accepted.length} photo(s) were added due to the 5-image and 5MB total limits.`)
    } else if (hitCountLimit) {
      notices.push(`Only ${accepted.length} photo(s) were added (maximum ${MAX_PRODUCT_IMAGE_COUNT} images).`)
    } else {
      notices.push(`Only ${accepted.length} photo(s) were added to stay within the 5MB total limit.`)
    }
  }

  return { accepted, notices }
}

export function isPrimaryProductImage(image) {
  if (!image || typeof image !== 'object') return false
  return image.is_primary === true || image.is_primary === '1' || image.is_primary === 1
}

export function isGalleryProductImage(image) {
  if (!image || typeof image !== 'object') return false
  return image.is_primary === false || image.is_primary === '0' || image.is_primary === 0
}

export function createProductImageFromFile(file, meta = {}) {
  const id = meta.id ?? `img-${Date.now()}-${Math.random().toString(36).slice(2)}`

  return {
    id,
    content_id: meta.content_id ?? id,
    file,
    preview: URL.createObjectURL(file),
    isRemote: false,
    remoteId: null,
    upload_id: null,
    image_url: null,
    s3Path: null,
    storagePath: null,
    uploadStatus: 'idle',
    uploadError: null,
    width: meta.width ?? null,
    height: meta.height ?? null,
  }
}

function isFileValue(value) {
  return typeof File !== 'undefined' && value instanceof File
}

export function resolveRemoteProductImageId(image) {
  if (!image || typeof image !== 'object') return null

  const remoteId =
    image.remoteId
    ?? image.id
    ?? image.product_image_id
    ?? image.image_id
    ?? image.uuid
    ?? null

  if (remoteId == null || remoteId === '') return null

  const id = String(remoteId)
  if (id.startsWith('img-') || id.startsWith('remote-')) return null

  return id
}

export function createProductImageFromRemote(image) {
  const remoteId = resolveRemoteProductImageId(image)
  const id = remoteId ?? `remote-${Date.now()}-${Math.random().toString(36).slice(2)}`

  return {
    id,
    content_id: image.content_id ?? id,
    file: null,
    preview: image.image_url ?? image.url ?? image.preview ?? image.image_path ?? '',
    remoteId,
    isRemote: true,
    s3Path: image.s3Path ?? image.storagePath ?? image.image_path ?? null,
    storagePath: image.storagePath ?? image.s3Path ?? image.image_path ?? null,
    uploadStatus: 'uploaded',
    uploadError: null,
  }
}

export function isKeptRemoteProductImage(image) {
  if (!image || isFileValue(image.file)) return false
  return resolveRemoteProductImageId(image) != null
}

export function isUsableProductImage(image) {
  if (!image || typeof image !== 'object') return false
  if (isFileValue(image.file)) return true
  return Boolean(String(image.preview ?? '').trim())
}

export function hasUsableProductImages(images = [], fallbackImageUrl = null) {
  if (String(fallbackImageUrl ?? '').trim()) return true
  return Array.isArray(images) && images.some(isUsableProductImage)
}

export function replaceProductImageWithFile(previousImage, file, meta = {}) {
  if (previousImage) revokeProductImagePreview(previousImage)
  return createProductImageFromFile(file, meta)
}

export function revokeProductImagePreview(image) {
  if (image?.preview?.startsWith('blob:')) {
    URL.revokeObjectURL(image.preview)
  }
}

export function getDescriptiveImageLimitOptions() {
  return {
    maxCount: MAX_DESCRIPTIVE_IMAGE_COUNT,
    maxBytes: MAX_DESCRIPTIVE_IMAGES_TOTAL_BYTES,
    maxFileBytes: MAX_DESCRIPTIVE_IMAGE_FILE_BYTES,
    label: 'descriptive images',
  }
}

export function validateDescriptiveImageLimits(images = []) {
  if (!Array.isArray(images) || images.length === 0) {
    return { valid: true }
  }

  return validateStandaloneImageLimits(images, getDescriptiveImageLimitOptions())
}

export function pickDescriptiveImageFiles({ images = [], files = [] }) {
  return pickStandaloneImageFiles({
    images,
    files,
    ...getDescriptiveImageLimitOptions(),
  })
}

export function getDescriptiveDimensionGuidance() {
  return buildImageDimensionGuidance({
    targetWidth: DESCRIPTIVE_IMAGE_WIDTH,
    targetHeight: DESCRIPTIVE_IMAGE_HEIGHT,
    minScale: DESCRIPTIVE_IMAGE_MIN_SCALE,
    maxScale: DESCRIPTIVE_IMAGE_MAX_SCALE,
  })
}

function buildImageDimensionGuidance({
  targetWidth,
  targetHeight,
  minScale,
  maxScale,
}) {
  return {
    targetWidth,
    targetHeight,
    label: `${targetWidth} × ${targetHeight} px`,
    minWidth: Math.round(targetWidth * minScale),
    maxWidth: Math.round(targetWidth * maxScale),
    minHeight: Math.round(targetHeight * minScale),
    maxHeight: Math.round(targetHeight * maxScale),
    aspectRatioLabel: `${targetWidth}:${targetHeight}`,
  }
}

export function getPrimaryDimensionGuidance() {
  return buildImageDimensionGuidance({
    targetWidth: PRIMARY_PRODUCT_IMAGE_WIDTH,
    targetHeight: PRIMARY_PRODUCT_IMAGE_HEIGHT,
    minScale: PRIMARY_PRODUCT_IMAGE_MIN_SCALE,
    maxScale: PRIMARY_PRODUCT_IMAGE_MAX_SCALE,
  })
}

/** Combined square + landscape acceptance ranges shown in the main-photo upload UI. */
export function getPrimaryAcceptedDimensionGuidance() {
  const square = getPrimaryDimensionGuidance()
  const landscape = getFeaturedDimensionGuidance()

  return {
    ...square,
    label: `${square.label} (square) or ${PRIMARY_PRODUCT_IMAGE_LANDSCAPE_EXAMPLE_LABEL} (landscape)`,
    minWidth: Math.min(square.minWidth, landscape.minWidth),
    maxWidth: Math.max(square.maxWidth, landscape.maxWidth),
    minHeight: Math.min(square.minHeight, landscape.minHeight),
    maxHeight: Math.max(square.maxHeight, landscape.maxHeight),
  }
}

export function getFeaturedDimensionGuidance() {
  return buildImageDimensionGuidance({
    targetWidth: FEATURED_PRODUCT_IMAGE_WIDTH,
    targetHeight: FEATURED_PRODUCT_IMAGE_HEIGHT,
    minScale: FEATURED_PRODUCT_IMAGE_MIN_SCALE,
    maxScale: FEATURED_PRODUCT_IMAGE_MAX_SCALE,
  })
}

function evaluateProductImageDimensions(width, height, {
  guidance,
  aspectTolerance,
  invalidMessage,
}) {
  if (!width || !height) {
    return {
      status: 'unknown',
      valid: false,
      width,
      height,
      dimensionLabel: null,
      message: 'Could not read image dimensions. Try re-uploading the file.',
    }
  }

  const targetRatio = guidance.targetWidth / guidance.targetHeight
  const ratio = width / height
  const ratioDiff = Math.abs(ratio - targetRatio) / targetRatio
  const shortEdge = Math.min(width, height)
  const longEdge = Math.max(width, height)
  const minShort = Math.min(guidance.minWidth, guidance.minHeight)
  const maxLong = Math.max(guidance.maxWidth, guidance.maxHeight)
  const sizeOk = shortEdge >= minShort && longEdge <= maxLong
  const aspectOk = ratioDiff <= aspectTolerance
  const dimensionLabel = `${width} × ${height} px`

  if (sizeOk && aspectOk) {
    const widthDelta = Math.abs(width - guidance.targetWidth) / guidance.targetWidth
    const heightDelta = Math.abs(height - guidance.targetHeight) / guidance.targetHeight
    const isIdeal = widthDelta <= 0.08 && heightDelta <= 0.08

    return {
      status: isIdeal ? 'ideal' : 'acceptable',
      valid: true,
      width,
      height,
      dimensionLabel,
    }
  }

  return {
    status: 'invalid',
    valid: false,
    width,
    height,
    dimensionLabel,
    message: invalidMessage(dimensionLabel, guidance),
  }
}

/** Last-resort check: any reasonably sized product photo, regardless of target profile. */
function evaluateLenientProductImageDimensions(width, height) {
  if (!width || !height) {
    return {
      status: 'unknown',
      valid: false,
      width,
      height,
      dimensionLabel: null,
      message: 'Could not read image dimensions. Try re-uploading the file.',
    }
  }

  const shortEdge = Math.min(width, height)
  const longEdge = Math.max(width, height)
  const ratio = width / height
  const dimensionLabel = `${width} × ${height} px`

  if (
    shortEdge >= PRODUCT_IMAGE_MIN_SHORT_EDGE_PX
    && longEdge <= PRODUCT_IMAGE_MAX_LONG_EDGE_PX
    && ratio >= PRODUCT_IMAGE_MIN_ASPECT_RATIO
    && ratio <= PRODUCT_IMAGE_MAX_ASPECT_RATIO
  ) {
    return {
      status: 'acceptable',
      valid: true,
      width,
      height,
      dimensionLabel,
    }
  }

  return {
    status: 'invalid',
    valid: false,
    width,
    height,
    dimensionLabel,
    message: (
      `This image is ${dimensionLabel}. Use at least ${PRODUCT_IMAGE_MIN_SHORT_EDGE_PX}px on the `
      + 'shortest side. Very wide panoramas or tall strips are not supported.'
    ),
  }
}

export function evaluatePrimaryImageDimensions(width, height) {
  const squareGuidance = getPrimaryDimensionGuidance()
  const landscapeGuidance = getFeaturedDimensionGuidance()

  const squareResult = evaluateProductImageDimensions(width, height, {
    guidance: squareGuidance,
    aspectTolerance: PRIMARY_PRODUCT_IMAGE_ASPECT_TOLERANCE,
    invalidMessage: () => '',
  })

  if (squareResult.valid) return squareResult

  const landscapeResult = evaluateProductImageDimensions(width, height, {
    guidance: landscapeGuidance,
    aspectTolerance: FEATURED_PRODUCT_IMAGE_ASPECT_TOLERANCE,
    invalidMessage: () => '',
  })

  if (landscapeResult.valid) return landscapeResult

  const lenientResult = evaluateLenientProductImageDimensions(width, height)
  if (lenientResult.valid) return lenientResult

  const dimensionLabel = `${width} × ${height} px`

  return {
    status: 'invalid',
    valid: false,
    width,
    height,
    dimensionLabel,
    message: lenientResult.message ?? (
      `This image is ${dimensionLabel}. Use a square photo near ${PRIMARY_PRODUCT_IMAGE_RECOMMENDED_LABEL}, `
      + `or a wide landscape near ${FEATURED_PRODUCT_IMAGE_RECOMMENDED_LABEL}. `
      + `Sizes like ${PRIMARY_PRODUCT_IMAGE_LANDSCAPE_EXAMPLE_LABEL} are fine.`
    ),
  }
}

export function evaluateFeaturedImageDimensions(width, height) {
  const guidance = getFeaturedDimensionGuidance()

  const profileResult = evaluateProductImageDimensions(width, height, {
    guidance,
    aspectTolerance: FEATURED_PRODUCT_IMAGE_ASPECT_TOLERANCE,
    invalidMessage: () => '',
  })

  if (profileResult.valid) return profileResult

  const lenientResult = evaluateLenientProductImageDimensions(width, height)
  if (lenientResult.valid) return lenientResult

  return {
    status: 'invalid',
    valid: false,
    width,
    height,
    dimensionLabel: `${width} × ${height} px`,
    message: lenientResult.message ?? (
      `This image is ${width} × ${height} px. Use a wide landscape photo near `
      + `${FEATURED_PRODUCT_IMAGE_RECOMMENDED_LABEL} when possible.`
    ),
  }
}

export function evaluateDescriptiveImageDimensions(width, height) {
  const guidance = getDescriptiveDimensionGuidance()

  const profileResult = evaluateProductImageDimensions(width, height, {
    guidance,
    aspectTolerance: DESCRIPTIVE_IMAGE_ASPECT_TOLERANCE,
    invalidMessage: () => '',
  })

  if (profileResult.valid) return profileResult

  const lenientResult = evaluateLenientProductImageDimensions(width, height)
  if (lenientResult.valid) return lenientResult

  return {
    status: 'invalid',
    valid: false,
    width,
    height,
    dimensionLabel: `${width} × ${height} px`,
    message: lenientResult.message ?? (
      `This image is ${width} × ${height} px. Use a wide landscape photo near `
      + `${DESCRIPTIVE_IMAGE_RECOMMENDED_LABEL} when possible.`
    ),
  }
}

export async function validatePrimaryImageDimensions(image) {
  if (!image) return { valid: true }

  const dimensions = await resolveProductImageDimensions(image)
  const result = evaluatePrimaryImageDimensions(dimensions.width, dimensions.height)

  if (!result.valid) {
    return {
      valid: false,
      message: result.message ?? 'Primary image dimensions are not suitable for product cards.',
    }
  }

  return { valid: true }
}

export async function validateFeaturedImageDimensions(images = []) {
  const normalized = (Array.isArray(images) ? images : []).filter(Boolean)
  if (normalized.length === 0) return { valid: true }

  for (let index = 0; index < normalized.length; index += 1) {
    const dimensions = await resolveProductImageDimensions(normalized[index])
    const result = evaluateFeaturedImageDimensions(dimensions.width, dimensions.height)

    if (!result.valid) {
      return {
        valid: false,
        index,
        message: `${result.message} (Gallery image ${index + 1})`,
      }
    }
  }

  return { valid: true }
}

export function readImageFileDimensions(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Missing image file'))
      return
    }

    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image dimensions'))
    }

    image.src = url
  })
}

export function readImageUrlDimensions(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('Missing image URL'))
      return
    }

    const image = new Image()

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }

    image.onerror = () => {
      reject(new Error('Could not read image dimensions'))
    }

    image.src = url
  })
}

export async function resolveProductImageDimensions(image) {
  if (!image) return { width: null, height: null }

  if (image.width && image.height) {
    return { width: image.width, height: image.height }
  }

  if (image.file) {
    const dimensions = await readImageFileDimensions(image.file)
    return dimensions
  }

  const preview = String(image.preview ?? '').trim()
  if (preview) {
    return readImageUrlDimensions(preview)
  }

  return { width: null, height: null }
}

export async function validateDescriptiveImageDimensions(images = []) {
  const normalized = (Array.isArray(images) ? images : []).filter(Boolean)
  if (normalized.length === 0) return { valid: true }

  for (let index = 0; index < normalized.length; index += 1) {
    const dimensions = await resolveProductImageDimensions(normalized[index])
    const result = evaluateDescriptiveImageDimensions(dimensions.width, dimensions.height)

    if (!result.valid) {
      return {
        valid: false,
        index,
        message: `${result.message} (Image ${index + 1})`,
      }
    }
  }

  return { valid: true }
}
