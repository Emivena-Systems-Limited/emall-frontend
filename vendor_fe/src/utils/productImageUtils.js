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
  }
}

export function revokeProductImagePreview(image) {
  if (image?.preview) URL.revokeObjectURL(image.preview)
}
