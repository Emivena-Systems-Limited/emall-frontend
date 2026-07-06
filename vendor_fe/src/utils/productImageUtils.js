import {
  MAX_DESCRIPTIVE_IMAGE_COUNT,
  MAX_DESCRIPTIVE_IMAGE_FILE_BYTES,
  MAX_DESCRIPTIVE_IMAGES_TOTAL_BYTES,
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

export function createProductImageFromFile(file) {
  return {
    id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    preview: URL.createObjectURL(file),
    isRemote: false,
    remoteId: null,
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

  return {
    id: remoteId ?? `remote-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file: null,
    preview: image.image_url ?? image.url ?? image.preview ?? image.image_path ?? '',
    remoteId,
    isRemote: true,
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

export function replaceProductImageWithFile(previousImage, file) {
  if (previousImage) revokeProductImagePreview(previousImage)
  return createProductImageFromFile(file)
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
