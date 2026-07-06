import { PRODUCT_CONDITION_OPTIONS } from '../constants/products'

export const RESERVED_PRODUCT_METADATA_KEYS = new Set([
  'regular_price',
  'regular_discount_price',
  'sale_price',
  'discount_mode',
  'discount_price',
  'discount_percent',
  'percent_off',
  'savings_amount',
  'has_discount',
  'quantity',
  'low_stock_threshold',
  'barcode',
  'sku',
  'shipping_weight',
  'shipping_length',
  'shipping_width',
  'shipping_height',
  'condition',
])

export function isReservedProductMetadataKey(key) {
  return RESERVED_PRODUCT_METADATA_KEYS.has(String(key ?? '').trim())
}

export function mapKeyDetailsFromMetadata(metadata = []) {
  return (Array.isArray(metadata) ? metadata : [])
    .filter((item) => item?.key && !isReservedProductMetadataKey(item.key))
    .map((item) => ({
      id: `kd-${String(item.key).replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).slice(2, 7)}`,
      key: item.key,
      value: item.value ?? '',
    }))
}

export function normalizeKeyDetailsForPayload(keyDetails = []) {
  return (Array.isArray(keyDetails) ? keyDetails : [])
    .filter((item) => {
      const property = String(item?.property ?? item?.key ?? '').trim()
      return property && item?.value != null && String(item.value).trim() !== ''
    })
    .map((item) => ({
      property: String(item.property ?? item.key).trim(),
      value: String(item.value).trim(),
    }))
}

export function getMetadataValue(metadata, key) {
  if (!Array.isArray(metadata)) return undefined
  const item = metadata.find((m) => m && (m.key === key || m.meta_key === key))
  return item ? item.value ?? item.meta_value : undefined
}

export function formatPackageDimensions(metadata) {
  const length = getMetadataValue(metadata, 'shipping_length')
  const width = getMetadataValue(metadata, 'shipping_width')
  const height = getMetadataValue(metadata, 'shipping_height')
  const dimensions = [length, width, height].filter(
    (value) => value !== undefined && value !== null && String(value).trim() !== '',
  )

  if (dimensions.length > 0) {
    return `${dimensions.join(' x ')} cm`
  }

  const packageDimensions = getMetadataValue(metadata, 'package_dimensions')
  if (packageDimensions && String(packageDimensions).trim()) {
    return String(packageDimensions).trim()
  }

  return null
}

export function formatItemWeight(metadata, fallback = 'Lightweight everyday carry') {
  const weight = getMetadataValue(metadata, 'shipping_weight')
  if (weight !== undefined && weight !== null && String(weight).trim() !== '') {
    return `${String(weight).trim()} kg`
  }

  return fallback
}

export const KEY_DETAIL_PRIORITY = [
  'category',
  'model/sku',
  'sku',
  'barcode',
  'condition',
  'brand',
  'package dimensions',
  'item weight',
  'manufacturer',
  'department',
  'item model number',
  'date first available',
  'asin',
]

const KEY_DETAIL_ALIASES = {
  sku: 'model/sku',
  'item model number': 'model/sku',
}

export function normalizeKeyDetailKey(key) {
  const normalized = String(key ?? '').trim().toLowerCase()
  return KEY_DETAIL_ALIASES[normalized] ?? normalized
}

export function getKeyDetailPriority(key) {
  const normalized = normalizeKeyDetailKey(key)
  const index = KEY_DETAIL_PRIORITY.indexOf(normalized)
  return index === -1 ? KEY_DETAIL_PRIORITY.length : index
}

export function sortKeyDetailEntries(entries) {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const priorityDiff = getKeyDetailPriority(a.entry[0]) - getKeyDetailPriority(b.entry[0])
      return priorityDiff !== 0 ? priorityDiff : a.index - b.index
    })
    .map(({ entry }) => entry)
}

const RESERVED_KEY_DETAIL_KEYS = new Set([
  'category',
  'model/sku',
  'sku',
  'barcode',
  'condition',
  'brand',
  'package dimensions',
  'item weight',
  'manufacturer',
])

export function isReservedKeyDetailKey(key) {
  return RESERVED_KEY_DETAIL_KEYS.has(normalizeKeyDetailKey(key))
}

export function mapKeyDetailsFromRecord(record) {
  const fromKeyDetails = Array.isArray(record?.key_details) ? record.key_details : []
  if (fromKeyDetails.length > 0) {
    return fromKeyDetails
      .map((item, index) => ({
        id: item.id ?? `kd-${index}-${Math.random().toString(36).slice(2, 7)}`,
        key: String(item.property ?? item.key ?? '').trim(),
        value: item.value ?? '',
      }))
      .filter((item) => item.key)
  }

  return mapKeyDetailsFromMetadata(record?.metadata)
}

export function getProductConditionLabel(value) {
  if (!value) return null
  return PRODUCT_CONDITION_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export function isDescriptiveProductImage(image) {
  if (!image || typeof image !== 'object') return false
  const type = String(image.image_type ?? image.type ?? '').trim().toLowerCase()
  return type === 'descriptive' || image.is_descriptive === true || image.is_descriptive === 1
}

export function mapDescriptiveImageUrls(descriptiveImages) {
  if (!Array.isArray(descriptiveImages)) return []

  return descriptiveImages
    .map((image) => {
      if (typeof image === 'string') return image.trim()
      return String(image?.image_url ?? image?.url ?? image?.preview ?? '').trim()
    })
    .filter(Boolean)
}
