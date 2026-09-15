function isNumericAttributeKey(key) {
  return /^\d+$/.test(String(key ?? '').trim())
}

export function normalizeVariantAttributeEntries(attributes = []) {
  if (!Array.isArray(attributes)) return []

  return attributes
    .map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return null
      const name = String(item.name ?? item.attribute ?? item.key ?? '').trim()
      const value = String(item.value ?? item.option ?? '').trim()
      if (!name || !value) return null
      return {
        name,
        value,
        is_primary: item.is_primary === true || item.is_primary === 1 || item.is_primary === '1',
      }
    })
    .filter(Boolean)
}

export function parseVariantAttributes(attributes) {
  if (attributes == null) {
    return { attributeKey: 'option', attributeValue: '' }
  }

  const namedEntries = normalizeVariantAttributeEntries(attributes)
  if (namedEntries.length > 0) {
    const primary = namedEntries.find((entry) => entry.is_primary) ?? namedEntries[0]
    return { attributeKey: primary.name, attributeValue: primary.value }
  }

  if (Array.isArray(attributes)) {
    const first = attributes[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const [attributeKey, attributeValue] = Object.entries(first)[0] ?? ['option', '']
      return { attributeKey: attributeKey ?? 'option', attributeValue: attributeValue ?? '' }
    }
    return { attributeKey: 'option', attributeValue: first ?? '' }
  }

  if (typeof attributes === 'object') {
    const namedObjectEntries = Object.entries(attributes).filter(
      ([key]) => key != null && !isNumericAttributeKey(key),
    )
    if (namedObjectEntries.length > 0) {
      const [attributeKey, attributeValue] = namedObjectEntries[0]
      return { attributeKey, attributeValue: attributeValue ?? '' }
    }
  }

  return { attributeKey: 'option', attributeValue: '' }
}

/** API variants may expose flat `attribute`/`value` or nested `attributes`. */
export function resolveVariantAttributeFields(variant) {
  if (!variant || typeof variant !== 'object') {
    return { attributeKey: 'option', attributeValue: '' }
  }

  const rawAttribute = variant.attribute
  if (rawAttribute && typeof rawAttribute === 'object' && !Array.isArray(rawAttribute)) {
    const attributeKey = String(rawAttribute.key ?? rawAttribute.name ?? rawAttribute.label ?? '').trim()
    const attributeValue = rawAttribute.value ?? rawAttribute.option ?? ''
    if (attributeKey || attributeValue) {
      return { attributeKey: attributeKey || 'option', attributeValue: attributeValue ?? '' }
    }
  }

  const flatAttribute = String(typeof rawAttribute === 'object' ? '' : (rawAttribute ?? '')).trim()
  const flatValue = variant.value ?? variant.variant_name ?? ''

  if (flatAttribute) {
    return { attributeKey: flatAttribute, attributeValue: flatValue ?? '' }
  }

  return parseVariantAttributes(variant.attributes)
}

export function getVariantAttributeValue(variant, attributeName) {
  const normalized = String(attributeName ?? '').trim().toLowerCase()
  if (!normalized || !variant || typeof variant !== 'object') return ''

  const namedEntries = normalizeVariantAttributeEntries(variant.attributes)
  if (namedEntries.length > 0) {
    const match = namedEntries.find((entry) => entry.name.toLowerCase() === normalized)
    if (match) return match.value
  }

  const flatAttribute = String(typeof variant.attribute === 'object' ? '' : (variant.attribute ?? '')).trim().toLowerCase()
  if (flatAttribute === normalized) {
    return String(variant.value ?? variant.variant_name ?? '').trim()
  }

  if (variant.attributes && typeof variant.attributes === 'object' && !Array.isArray(variant.attributes)) {
    for (const [key, value] of Object.entries(variant.attributes)) {
      if (String(key).trim().toLowerCase() === normalized && value != null && value !== '') {
        return String(value).trim()
      }
    }
  }

  if (normalized === 'color' && variant.color != null && variant.color !== '') {
    return String(variant.color).trim()
  }
  if (normalized === 'colour' && variant.colour != null && variant.colour !== '') {
    return String(variant.colour).trim()
  }
  if (normalized === 'colour' && variant.color != null && variant.color !== '') {
    return String(variant.color).trim()
  }
  if (normalized === 'size' && variant.size != null && variant.size !== '') {
    return String(variant.size).trim()
  }

  return ''
}

export function resolveVariantStock(variant, fallback = 0) {
  if (!variant || typeof variant !== 'object') return fallback
  if (variant.inventory?.available_quantity != null && variant.inventory.available_quantity !== '') {
    const available = Number(variant.inventory.available_quantity)
    if (Number.isFinite(available)) return available
  }
  if (variant.quantity != null && variant.quantity !== '') {
    const quantity = Number(variant.quantity)
    if (Number.isFinite(quantity)) return quantity
  }
  return fallback
}

export function resolveVariantLowStockThreshold(variant, fallback = 10) {
  if (!variant || typeof variant !== 'object') return fallback
  if (variant.inventory?.minimum_threshold != null && variant.inventory.minimum_threshold !== '') {
    const threshold = Number(variant.inventory.minimum_threshold)
    if (Number.isFinite(threshold)) return threshold
  }
  if (variant.low_stock_threshold != null && variant.low_stock_threshold !== '') {
    const threshold = Number(variant.low_stock_threshold)
    if (Number.isFinite(threshold)) return threshold
  }
  if (variant.minimum_threshold != null && variant.minimum_threshold !== '') {
    const threshold = Number(variant.minimum_threshold)
    if (Number.isFinite(threshold)) return threshold
  }
  return fallback
}

/** Primary image URL from API variant record (`images[]`, flat `image_url`, or legacy `image`). */
export function resolveVariantImageUrl(variant) {
  if (!variant || typeof variant !== 'object') return null

  const firstImage = Array.isArray(variant.images) ? variant.images[0] : null
  const url = firstImage?.image_url
    ?? firstImage?.url
    ?? firstImage?.preview
    ?? variant.image_url
    ?? variant.image
    ?? null

  const normalized = String(url ?? '').trim()
  return normalized || null
}

/** All image URLs from an API variant record, in display order. */
export function collectVariantImageUrls(variant) {
  if (!variant || typeof variant !== 'object') return []

  const urls = []
  if (Array.isArray(variant.images)) {
    variant.images.forEach((image) => {
      const url = typeof image === 'string'
        ? image
        : (image?.image_url ?? image?.url ?? image?.preview ?? '')
      const normalized = String(url ?? '').trim()
      if (normalized) urls.push(normalized)
    })
  }

  const fallback = resolveVariantImageUrl(variant)
  if (fallback && !urls.includes(fallback)) urls.push(fallback)

  return [...new Set(urls)]
}

export function getVariantCompatibleModels(variant) {
  if (!variant || typeof variant !== 'object') return []
  if (variant.has_compatible_models === false) return []
  if (!Array.isArray(variant.compatible_models)) return []
  return variant.compatible_models
    .map((model) => (typeof model === 'string' ? model : model?.name ?? '').trim())
    .filter(Boolean)
}

export function variantHasCompatibleModel(variant, model) {
  const target = String(model ?? '').trim().toLowerCase()
  if (!target) return true
  return getVariantCompatibleModels(variant).some(
    (entry) => entry.toLowerCase() === target,
  )
}

export function isSameVariantOption(selected, value) {
  if (selected == null || value == null || selected === '' || value === '') return false
  return String(selected).trim().toLowerCase() === String(value).trim().toLowerCase()
}

/** Map a variant attribute value to the matching option label from the product list. */
export function resolveCanonicalVariantOption(rawValue, options = []) {
  if (rawValue == null || rawValue === '') return ''
  const normalized = String(rawValue).trim().toLowerCase()
  if (!normalized) return ''

  const match = (Array.isArray(options) ? options : []).find(
    (option) => String(option).trim().toLowerCase() === normalized,
  )

  return match != null ? String(match) : String(rawValue).trim()
}

export function resolveNestedBrand(record) {
  if (record?.brand && typeof record.brand === 'object') {
    return record.brand
  }
  if (record?.brand_id && typeof record.brand_id === 'object' && record.brand_id.id) {
    return record.brand_id
  }
  return null
}

export function resolveBrandName(record) {
  const brand = resolveNestedBrand(record)
  return brand?.brand_name ?? brand?.name ?? record?.brand_name ?? ''
}

function getMetadataMapValue(metadata, key) {
  if (!Array.isArray(metadata)) return ''
  const match = metadata.find((entry) => String(entry?.key ?? '').trim() === key)
  return String(match?.value ?? '').trim()
}

/** True when the listing has a single auto-generated SKU named after the product. */
export function isSimpleListingProduct(product = {}) {
  const name = String(product.name ?? product.title ?? '').trim()
  const variants = Array.isArray(product.variants) ? product.variants : []
  const mainAttribute = String(
    product.mainAttribute
    ?? product.main_attribute
    ?? getMetadataMapValue(product.metadata, 'main_attribute'),
  ).trim()
  const mainAttributeValue = String(
    product.mainAttributeValue
    ?? product.main_attribute_value
    ?? getMetadataMapValue(product.metadata, 'main_attribute_value'),
  ).trim()
  const namedAsSimple = Boolean(name)
    && isSameVariantOption(mainAttribute, name)
    && isSameVariantOption(mainAttributeValue, name)

  if (variants.length > 1) return false

  if (variants.length === 1) {
    const namedEntries = normalizeVariantAttributeEntries(variants[0].attributes)
    if (namedEntries.length > 1) return false
    if (namedAsSimple) return true
    const { attributeKey, attributeValue } = resolveVariantAttributeFields(variants[0])
    return Boolean(name)
      && isSameVariantOption(attributeKey, name)
      && isSameVariantOption(attributeValue, name)
  }

  return namedAsSimple
}
