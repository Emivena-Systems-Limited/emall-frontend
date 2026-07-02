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

export const RESERVED_KEY_DETAIL_KEYS = new Set([
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

const CONDITION_LABELS = {
  new: 'New',
  like_new: 'Like new',
  good: 'Good',
  fair: 'Fair',
  refurbished: 'Refurbished',
}

export function formatProductCondition(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return null
  return CONDITION_LABELS[normalized] ?? String(value).trim()
}
