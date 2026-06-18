const ACCEPTED_TYPES = ['image/jpeg', 'image/png']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export function isAcceptedImageFile(file) {
  return file && ACCEPTED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
}

export function readImageAsDataUri(file) {
  return new Promise((resolve, reject) => {
    if (!isAcceptedImageFile(file)) {
      reject(new Error('Only JPG or PNG images up to 5MB are allowed'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}
