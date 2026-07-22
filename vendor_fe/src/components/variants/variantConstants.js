export const ATTRIBUTE_PRESETS = ['Color', 'Size', 'Material', 'Weight', 'Style', 'Capacity', 'Flavor']
export const CUSTOM_ATTRIBUTE_LABEL = 'Custom attribute'

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

// Backend currently only stores a single image per variant. Bump this once multi-image
// variant uploads are supported server-side — the upload UI already handles it either way.
export const MAX_VARIANT_IMAGE_COUNT = 1
