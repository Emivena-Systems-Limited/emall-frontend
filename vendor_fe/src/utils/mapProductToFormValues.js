import { convertDiscountAmountToPercent } from './productPricing'
import { parseVariantAttributes } from './productPayload'
import { fromVariantOptionalField } from '../components/variants/variantFormUtils'
import {
  mapApiProductStatus,
  resolveBrandId,
  resolveSubcategoryRecord,
} from './normalizeProducts'
import { createProductImageFromRemote, isGalleryProductImage, isPrimaryProductImage } from './productImageUtils'
import { isDescriptiveProductImage, mapKeyDetailsFromRecord } from './productMetadata'

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

function isUsablePrice(value) {
  if (value === '' || value == null) return false
  const num = Number(value)
  return Number.isFinite(num) && num > 0
}

function pickFirstUsablePrice(...candidates) {
  for (const candidate of candidates) {
    if (isUsablePrice(candidate)) return candidate
  }
  return null
}

function resolvePricingFields(record, firstVariant, metadataMap = {}) {
  const listPrice = pickFirstUsablePrice(
    record.regular_price,
    record.price,
    firstVariant?.regular_price,
    firstVariant?.price,
  )

  const rawSalePrice = pickFirstUsablePrice(
    record.regular_discount_price,
    record.discount_price,
    firstVariant?.regular_discount_price,
    firstVariant?.discount_price,
  )

  const hasSalePrice = rawSalePrice != null

  const discountMode = metadataMap.discount_mode ?? 'amount'
  const discountPercent = metadataMap.discount_percent
    ?? (hasSalePrice && listPrice
      ? String(convertDiscountAmountToPercent(listPrice, rawSalePrice) ?? '')
      : '')

  return {
    price: listPrice == null ? '' : String(listPrice),
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

function resolveVariantInventoryValue(variant, field) {
  const value = variant?.inventory?.[field] ?? variant?.[field]
  return value == null ? '' : String(value)
}

function mapVariantsToFormVariations(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) return []

  const grouped = new Map()

  variants.forEach((variant) => {
    const { attributeKey, attributeValue } = parseVariantAttributes(variant.attributes)
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
      variant_name: fromVariantOptionalField(variant.variant_name),
      sku: fromVariantOptionalField(variant.sku),
      price: fromVariantOptionalField(variant.price == null ? '' : String(variant.price)),
      discount_price: fromVariantOptionalField(
        variant.discount_price == null ? '' : String(variant.discount_price),
      ),
      quantity: variant.quantity == null ? '' : String(variant.quantity),
      reserved_quantity: fromVariantOptionalField(resolveVariantInventoryValue(variant, 'reserved_quantity')),
      low_stock_threshold: fromVariantOptionalField(resolveVariantInventoryValue(variant, 'low_stock_threshold')),
      barcode: fromVariantOptionalField(variant.barcode),
      barcode_type: fromVariantOptionalField(variant.barcode_type) || 'UPC',
      weight: fromVariantOptionalField(variant.weight == null ? '' : String(variant.weight)),
      length: fromVariantOptionalField(variant.length == null ? '' : String(variant.length)),
      width: fromVariantOptionalField(variant.width == null ? '' : String(variant.width)),
      height: fromVariantOptionalField(variant.height == null ? '' : String(variant.height)),
      description: fromVariantOptionalField(variant.description),
      has_compatible_models: Boolean(variant.compatible_models?.length),
      compatible_models: Array.isArray(variant.compatible_models) ? variant.compatible_models : [],
      images: mapVariantImages(variant.images),
    })
  })

  return Array.from(grouped.values())
}

function sortProductImages(images = []) {
  return [...images].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
}

export function mapProductImagesToFormState(images = [], descriptiveImages = []) {
  const productSource = sortProductImages(
    (Array.isArray(images) ? images : []).filter((image) => !isDescriptiveProductImage(image)),
  )
  const descriptiveSource = sortProductImages([
    ...(Array.isArray(descriptiveImages) ? descriptiveImages : []),
    ...(Array.isArray(images) ? images : []).filter(isDescriptiveProductImage),
  ])

  const hasPrimaryFlag = productSource.some(isPrimaryProductImage)
  const mainRecord = hasPrimaryFlag
    ? productSource.find(isPrimaryProductImage) ?? null
    : productSource[0] ?? null
  const galleryRecords = hasPrimaryFlag
    ? productSource.filter(isGalleryProductImage)
    : productSource.filter((image) => image !== mainRecord)

  return {
    mainImage: mainRecord ? createProductImageFromRemote(mainRecord) : null,
    subImages: galleryRecords.map(createProductImageFromRemote),
    descriptiveImages: descriptiveSource.map(createProductImageFromRemote),
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
    condition: record.condition ?? metadataMap.condition ?? '',
    tags: normalizeTags(record.tags),
    key_details: mapKeyDetailsFromRecord(record),
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
  }
}

export function mapProductRecordToFormState(record) {
  const formValues = mapProductRecordToFormValues(record)
  if (!formValues) return null

  const { mainImage, subImages, descriptiveImages } = mapProductImagesToFormState(
    record.images ?? record.product_images,
    record.descriptive_images,
  )

  return {
    formValues,
    mainImage,
    subImages,
    descriptiveImages,
  }
}
