export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png']
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024

export function isValidProductImageFile(file) {
  return ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_FILE_SIZE
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

export function replaceProductImageWithFile(previousImage, file) {
  if (previousImage) revokeProductImagePreview(previousImage)
  return createProductImageFromFile(file)
}

export function revokeProductImagePreview(image) {
  if (image?.preview?.startsWith('blob:')) {
    URL.revokeObjectURL(image.preview)
  }
}
