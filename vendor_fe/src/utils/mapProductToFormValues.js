import { convertDiscountAmountToPercent } from './productPricing'
import {
  mapApiProductStatus,
  resolveBrandId,
  resolveSubcategoryRecord,
} from './normalizeProducts'
import { createProductImageFromRemote } from './productImageUtils'

function humanizeAttributeKey(key = '') {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean)
  }

  if (typeof tags === 'string' && tags.trim()) {
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  }

  return []
}

function metadataToMap(metadata = []) {
  if (!Array.isArray(metadata)) return {}

  return metadata.reduce((map, item) => {
    const key = item?.key?.trim()
    if (!key || item?.value == null || item?.value === '') return map
    map[key] = String(item.value)
    return map
  }, {})
}

function resolveCategoryFields(record) {
  const subcategoryRecord = resolveSubcategoryRecord(record)
  const subcategoryId = typeof record.subcategory_id === 'object'
    ? record.subcategory_id?.id
    : record.subcategory_id ?? subcategoryRecord?.id ?? ''

  if (subcategoryId) {
    const categoryId = typeof record.category_id === 'object'
      ? record.category_id?.id
      : record.category_id ?? record.category?.id ?? ''

    return {
      category_id: record.parent_category_id ?? record.category?.parent_id ?? categoryId,
      subcategory_id: subcategoryId,
    }
  }

  if (record.category?.parent_id) {
    return {
      category_id: record.category.parent_id,
      subcategory_id: record.category.id ?? record.category_id ?? '',
    }
  }

  const categoryId = typeof record.category_id === 'object'
    ? record.category_id?.id
    : record.category_id ?? record.category?.id ?? ''

  return {
    category_id: categoryId,
    subcategory_id: '',
  }
}

function resolvePricingFields(record, firstVariant, metadataMap = {}) {
  const listPrice =
    record.price
    ?? firstVariant?.price
    ?? (metadataMap.regular_price ? Number(metadataMap.regular_price) : undefined)
    ?? ''

  const rawSalePrice =
    record.discount_price
    ?? firstVariant?.discount_price
    ?? (metadataMap.has_discount === '1' && metadataMap.sale_price
      ? Number(metadataMap.sale_price)
      : undefined)
    ?? ''

  const hasSalePrice = rawSalePrice !== '' && rawSalePrice != null && Number(rawSalePrice) > 0

  const discountMode = metadataMap.discount_mode ?? 'amount'
  const discountPercent = metadataMap.discount_percent
    ?? (hasSalePrice && listPrice
      ? String(convertDiscountAmountToPercent(listPrice, rawSalePrice) ?? '')
      : '')

  return {
    price: listPrice === '' || listPrice == null ? '' : String(listPrice),
    discount_mode: discountMode,
    discount_price: hasSalePrice && discountMode === 'amount' ? String(rawSalePrice) : '',
    discount_percent: hasSalePrice && discountMode === 'percent' ? String(discountPercent) : discountPercent,
  }
}

function mapVariantImages(images = []) {
  return [...images]
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
    .map(createProductImageFromRemote)
}

function mapVariantsToFormVariations(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) return []

  const grouped = new Map()

  variants.forEach((variant) => {
    const attributeEntries = Object.entries(variant.attributes ?? {})
    const [attributeKey = 'option', attributeValue = ''] = attributeEntries[0] ?? []
    const attributeLabel = humanizeAttributeKey(attributeKey)

    if (!grouped.has(attributeLabel)) {
      grouped.set(attributeLabel, {
        id: `var-${attributeLabel.toLowerCase().replace(/\s+/g, '-')}`,
        attribute: attributeLabel,
        values: [],
      })
    }

    grouped.get(attributeLabel).values.push({
      id: variant.id ?? `val-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      value: attributeValue,
      variant_name: variant.variant_name ?? '',
      sku: variant.sku ?? '',
      price: variant.price == null ? '' : String(variant.price),
      discount_price: variant.discount_price == null ? '' : String(variant.discount_price),
      quantity: variant.quantity == null ? '' : String(variant.quantity),
      reserved_quantity: variant.reserved_quantity == null ? '' : String(variant.reserved_quantity),
      low_stock_threshold: variant.low_stock_threshold == null ? '' : String(variant.low_stock_threshold),
      barcode: variant.barcode ?? '',
      images: mapVariantImages(variant.images),
    })
  })

  return Array.from(grouped.values())
}

export function mapProductImagesToFormState(images = []) {
  const sorted = [...(Array.isArray(images) ? images : [])]
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
    .map(createProductImageFromRemote)

  return {
    mainImage: sorted[0] ?? null,
    subImages: sorted.slice(1),
  }
}

export function mapProductRecordToFormValues(record) {
  if (!record?.id) return null

  const variants = Array.isArray(record.variants) ? record.variants : []
  const firstVariant = variants[0]
  const shipping = record.shipping ?? {}
  const metadataMap = metadataToMap(record.metadata)
  const { category_id, subcategory_id } = resolveCategoryFields(record)
  const pricing = resolvePricingFields(record, firstVariant, metadataMap)

  const resolveQuantity = () => {
    if (record.quantity != null) return String(record.quantity)
    if (firstVariant?.quantity != null) return String(firstVariant.quantity)
    if (metadataMap.quantity != null) return String(metadataMap.quantity)
    return ''
  }

  return {
    name: record.name ?? '',
    sku: record.sku ?? firstVariant?.sku ?? metadataMap.sku ?? '',
    description: record.description ?? '',
    category_id,
    subcategory_id,
    brand_id: resolveBrandId(record),
    tags: normalizeTags(record.tags),
    ...pricing,
    quantity: resolveQuantity(),
    low_stock_threshold: record.low_stock_threshold != null
      ? String(record.low_stock_threshold)
      : (metadataMap.low_stock_threshold ?? ''),
    barcode: record.barcode ?? firstVariant?.barcode ?? metadataMap.barcode ?? '',
    variations: mapVariantsToFormVariations(variants),
    shipping_weight: shipping.weight ?? record.shipping_weight ?? metadataMap.shipping_weight ?? '',
    shipping_length: shipping.length ?? record.shipping_length ?? metadataMap.shipping_length ?? '',
    shipping_width: shipping.width ?? record.shipping_width ?? metadataMap.shipping_width ?? '',
    shipping_height: shipping.height ?? record.shipping_height ?? metadataMap.shipping_height ?? '',
    status: mapApiProductStatus(record.status, record.is_active),
    fulfillment_channel: record.fulfillment_channel ?? 'vendor',
    is_active: record.is_active === true || record.is_active === 1 || record.is_active === '1',
    metadata: Array.isArray(record.metadata) ? record.metadata : [],
  }
}

export function mapProductRecordToFormState(record) {
  const formValues = mapProductRecordToFormValues(record)
  if (!formValues) return null

  const { mainImage, subImages } = mapProductImagesToFormState(record.images)

  return {
    formValues,
    mainImage,
    subImages,
  }
}
