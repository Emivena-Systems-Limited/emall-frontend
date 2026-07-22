function isNumericAttributeKey(key) {
  return /^\d+$/.test(String(key ?? '').trim())
}

export function parseVariantAttributes(attributes) {
  if (attributes == null) {
    return { attributeKey: 'option', attributeValue: '' }
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
    const namedEntries = Object.entries(attributes).filter(
      ([key]) => key != null && !isNumericAttributeKey(key),
    )
    if (namedEntries.length > 0) {
      const [attributeKey, attributeValue] = namedEntries[0]
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

  const flatAttribute = String(variant.attribute ?? '').trim()
  const flatValue = variant.value ?? variant.variant_name ?? ''

  if (flatAttribute) {
    return { attributeKey: flatAttribute, attributeValue: flatValue ?? '' }
  }

  return parseVariantAttributes(variant.attributes)
}

export function getVariantAttributeValue(variant, attributeName) {
  const normalized = String(attributeName ?? '').trim().toLowerCase()
  if (!normalized || !variant || typeof variant !== 'object') return ''

  const flatAttribute = String(variant.attribute ?? '').trim().toLowerCase()
  if (flatAttribute === normalized) {
    return String(variant.value ?? variant.variant_name ?? '').trim()
  }

  if (variant.attributes && typeof variant.attributes === 'object') {
    for (const [key, value] of Object.entries(variant.attributes)) {
      if (String(key).trim().toLowerCase() === normalized && value != null && value !== '') {
        return String(value).trim()
      }
    }
  }

  if (normalized === 'color' && variant.color != null && variant.color !== '') {
    return String(variant.color).trim()
  }
  if (normalized === 'size' && variant.size != null && variant.size !== '') {
    return String(variant.size).trim()
  }

  return ''
}

export function getVariantCompatibleModels(variant) {
  if (!variant?.has_compatible_models) return []
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
