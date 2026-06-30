export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png']
export const MAX_PRODUCT_IMAGE_COUNT = 5
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
