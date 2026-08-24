export const ATTRIBUTE_PRESETS = ['Color', 'Size', 'Material', 'Weight', 'Style', 'Capacity', 'Flavor']
export const CUSTOM_ATTRIBUTE_LABEL = 'My own option type'

export function isPresetAttribute(attribute = '') {
  return ATTRIBUTE_PRESETS.includes(attribute)
}

export const BARCODE_TYPE_OPTIONS = [
  { value: 'UPC', label: 'UPC', hint: 'Universal Product Code · 12 digits' },
  { value: 'EAN', label: 'EAN', hint: 'European Article Number · 13 digits' },
  { value: 'ISBN', label: 'ISBN', hint: 'Book identifier · 10 or 13 digits' },
  { value: 'GTIN', label: 'GTIN', hint: 'Global Trade Item Number · 8–14 digits' },
]

export const VARIANT_DESCRIPTION_MAX_LENGTH = 300

/** Default variant low-stock alert threshold sent when the field is left blank. */
export const DEFAULT_VARIANT_MINIMUM_THRESHOLD = 5

export const MAX_VARIANT_IMAGE_COUNT = 3
export const VARIANT_IMAGE_UPLOAD_HINT =
  `Optional · Up to ${MAX_VARIANT_IMAGE_COUNT} photos · JPG or PNG · Max 5MB each`
export const COLOR_VARIANT_IMAGE_REQUIRED_MESSAGE =
  'Add at least one photo for this color'

export function isColorVariantAttribute(attribute = '') {
  return /^(color|colour)$/i.test(String(attribute ?? '').trim())
}

export function getVariantImageUploadHint(attribute = '') {
  if (isColorVariantAttribute(attribute)) {
    return `Required · Up to ${MAX_VARIANT_IMAGE_COUNT} photos · JPG or PNG · Max 5MB each`
  }
  return VARIANT_IMAGE_UPLOAD_HINT
}
