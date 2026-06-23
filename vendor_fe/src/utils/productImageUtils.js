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
  }
}

export function createProductImageFromRemote(image) {
  return {
    id: image.id ?? `remote-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file: null,
    preview: image.image_url ?? image.preview ?? '',
    remoteId: image.id ?? null,
    isRemote: true,
  }
}

export function revokeProductImagePreview(image) {
  if (image?.preview?.startsWith('blob:')) {
    URL.revokeObjectURL(image.preview)
  }
}
