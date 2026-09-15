import { convertDiscountAmountToPercent } from './productPricing'
import { resolveVariantAttributeFields, isPersistedVariantId } from './productPayload'
import {
  MAIN_PRODUCT_ATTRIBUTE_META_KEY,
  MAIN_PRODUCT_ATTRIBUTE_VALUE_META_KEY,
  MAIN_PRODUCT_HAS_COMPATIBLE_MODELS_META_KEY,
  MAIN_PRODUCT_COMPATIBLE_MODELS_META_KEY,
  findMainProductVariant,
  parseCompatibleModels,
} from './defaultProductVariation'
import {
  fromVariantDescriptionField,
  fromVariantOptionalField,
  fromVariantSalePriceField,
  getVariantLowStockField,
} from '../components/variants/variantFormUtils'
import {
  mapApiProductStatus,
  resolveBrandId,
  resolveNestedBrand,
  resolveSubcategoryRecord,
  isProductActive,
} from './normalizeProducts'
import { findCategoryPath } from './normalizeCategories'
import { isGenericBrand, normalizeBrandRecord } from './normalizeBrands'
import {
  createDescriptiveImageFromRemote,
  hydrateRemoteMediaImage,
  isGalleryProductImage,
  isPrimaryProductImage,
  resolveRemoteProductImageId,
} from './productImageUtils'
import { isDescriptiveProductImage, getMetadataValue, mapKeyDetailsFromRecord } from './productMetadata'

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

function asCategoryId(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'object') {
    const nestedId = value.id ?? value.category_id
    return nestedId == null || nestedId === '' ? '' : String(nestedId)
  }
  return String(value)
}

function resolveNestedCategory(record) {
  if (record?.category && typeof record.category === 'object') return record.category
  if (record?.category_id && typeof record.category_id === 'object') return record.category_id
  return null
}

function resolveCategoryFields(record, categoryTree = []) {
  const categoryRecord = resolveNestedCategory(record)
  const subcategoryRecord = resolveSubcategoryRecord(record)

  const rawCategoryId = asCategoryId(record.category_id) || asCategoryId(categoryRecord)
  const rawSubcategoryId = asCategoryId(record.subcategory_id)
    || asCategoryId(record.sub_category_id)
    || asCategoryId(subcategoryRecord)

  const parentFromRecord = asCategoryId(record.parent_category_id)
    || asCategoryId(categoryRecord?.parent_id)
    || asCategoryId(categoryRecord?.parentId)
    || asCategoryId(subcategoryRecord?.parent_id)
    || asCategoryId(subcategoryRecord?.parentId)

  const leafId = rawSubcategoryId || rawCategoryId
  const path = findCategoryPath(categoryTree, leafId)
    || findCategoryPath(categoryTree, rawCategoryId)

  if (path?.length) {
    const root = path[0]
    const leaf = path[path.length - 1]
    const subcategoryId = path.length > 1
      ? String(leaf.id)
      : (rawSubcategoryId && rawSubcategoryId !== String(root.id) ? rawSubcategoryId : '')

    return {
      category_id: String(root.id),
      subcategory_id: subcategoryId,
    }
  }

  if (rawSubcategoryId) {
    const parentId = parentFromRecord || (rawCategoryId && rawCategoryId !== rawSubcategoryId ? rawCategoryId : '')
    return {
      category_id: parentId || rawCategoryId,
      subcategory_id: rawSubcategoryId,
    }
  }

  if (parentFromRecord && rawCategoryId && parentFromRecord !== rawCategoryId) {
    return {
      category_id: parentFromRecord,
      subcategory_id: rawCategoryId,
    }
  }

  if (parentFromRecord) {
    return {
      category_id: parentFromRecord,
      subcategory_id: rawCategoryId && rawCategoryId !== parentFromRecord ? rawCategoryId : '',
    }
  }

  return {
    category_id: rawCategoryId,
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

function pickFirstUsableSalePrice(listPrice, ...candidates) {
  const list = Number(listPrice)

  for (const candidate of candidates) {
    if (!isUsablePrice(candidate)) continue
    const sale = Number(candidate)
    if (Number.isFinite(list) && list > 0 && sale >= list) continue
    return candidate
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

  const rawSalePrice = pickFirstUsableSalePrice(
    listPrice,
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

function resolveMainProductOptionFields(record, firstVariant, metadataMap = {}) {
  const fromMetaAttribute = String(
    metadataMap[MAIN_PRODUCT_ATTRIBUTE_META_KEY]
    ?? getMetadataValue(record.metadata, MAIN_PRODUCT_ATTRIBUTE_META_KEY)
    ?? '',
  ).trim()
  const fromMetaValue = String(
    metadataMap[MAIN_PRODUCT_ATTRIBUTE_VALUE_META_KEY]
    ?? getMetadataValue(record.metadata, MAIN_PRODUCT_ATTRIBUTE_VALUE_META_KEY)
    ?? '',
  ).trim()

  if (fromMetaAttribute && fromMetaValue) {
    return {
      main_attribute: fromMetaAttribute,
      main_attribute_value: fromMetaValue,
    }
  }

  if (firstVariant) {
    const { attributeKey, attributeValue } = resolveVariantAttributeFields(firstVariant)
    const attributeLabel = String(firstVariant.attribute ?? '').trim()
      || humanizeAttributeKey(attributeKey)
    const valueText = attributeValue != null && attributeValue !== '' ? String(attributeValue).trim() : ''

    return {
      main_attribute: attributeLabel,
      main_attribute_value: valueText,
    }
  }

  return {
    main_attribute: '',
    main_attribute_value: '',
  }
}

function resolveProductCompatibleModels(record, metadataMap, productValues, variants = []) {
  const fromMetaFlag = String(
    metadataMap[MAIN_PRODUCT_HAS_COMPATIBLE_MODELS_META_KEY]
    ?? getMetadataValue(record.metadata, MAIN_PRODUCT_HAS_COMPATIBLE_MODELS_META_KEY)
    ?? '',
  ).trim()
  const fromMetaModels = parseCompatibleModels(
    metadataMap[MAIN_PRODUCT_COMPATIBLE_MODELS_META_KEY]
    ?? getMetadataValue(record.metadata, MAIN_PRODUCT_COMPATIBLE_MODELS_META_KEY),
  )

  if (fromMetaModels.length > 0 || fromMetaFlag === '1' || fromMetaFlag.toLowerCase() === 'true') {
    return {
      has_compatible_models: fromMetaModels.length > 0,
      compatible_models: fromMetaModels,
    }
  }

  const defaultVariant = findMainProductVariant(variants, productValues)
  const variantModels = parseCompatibleModels(defaultVariant?.compatible_models)
  if (variantModels.length > 0) {
    return {
      has_compatible_models: true,
      compatible_models: variantModels,
    }
  }

  return {
    has_compatible_models: false,
    compatible_models: [],
  }
}

function mapVariantImages(images = []) {
  return [...images]
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
    .map(hydrateRemoteMediaImage)
}

function resolveVariantInventoryValue(variant, field) {
  const value = variant?.inventory?.[field] ?? variant?.[field]
  return value == null ? '' : String(value)
}

function mapApiVariantToFormValue(variant, valueOverride = '') {
  return {
    id: variant.id ?? `val-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    value: valueOverride,
    variant_name: fromVariantOptionalField(variant.variant_name),
    sku: fromVariantOptionalField(variant.sku),
    price: fromVariantOptionalField(
      variant.regular_price == null && variant.price == null
        ? ''
        : String(variant.regular_price ?? variant.price),
    ),
    discount_price: fromVariantSalePriceField(
      variant.regular_discount_price ?? variant.discount_price,
      variant.regular_price ?? variant.price,
    ),
    quantity: variant.quantity == null ? '' : String(variant.quantity),
    reserved_quantity: fromVariantOptionalField(resolveVariantInventoryValue(variant, 'reserved_quantity')),
    low_stock_threshold: fromVariantOptionalField(
      resolveVariantInventoryValue(variant, 'low_stock_threshold')
      || resolveVariantInventoryValue(variant, 'minimum_threshold'),
    ),
    minimum_threshold: fromVariantOptionalField(
      resolveVariantInventoryValue(variant, 'low_stock_threshold')
      || resolveVariantInventoryValue(variant, 'minimum_threshold'),
    ),
    barcode: fromVariantOptionalField(variant.barcode),
    barcode_type: fromVariantOptionalField(variant.barcode_type) || 'UPC',
    weight: fromVariantOptionalField(variant.weight == null ? '' : String(variant.weight)),
    length: fromVariantOptionalField(variant.length == null ? '' : String(variant.length)),
    width: fromVariantOptionalField(variant.width == null ? '' : String(variant.width)),
    height: fromVariantOptionalField(variant.height == null ? '' : String(variant.height)),
    description: fromVariantDescriptionField(variant.description),
    has_compatible_models: Boolean(
      variant.has_compatible_models ?? variant.compatible_models?.length,
    ),
    compatible_models: Array.isArray(variant.compatible_models)
      ? variant.compatible_models.filter(Boolean)
      : [],
    images: mapVariantImages(variant.images),
    secondary_variants: [],
  }
}

function getVariantAttributeEntries(variant = {}) {
  const named = Array.isArray(variant.attributes)
    ? variant.attributes
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const name = String(item.name ?? item.attribute ?? '').trim()
        const value = String(item.value ?? '').trim()
        if (!name || !value) return null
        return {
          name,
          value,
          is_primary: item.is_primary === true || item.is_primary === 1 || item.is_primary === '1',
        }
      })
      .filter(Boolean)
    : []

  if (named.length > 0) {
    const primary = named.find((entry) => entry.is_primary) ?? named[0]
    return {
      primary,
      secondaries: named.filter((entry) => entry !== primary),
    }
  }

  const { attributeKey, attributeValue } = resolveVariantAttributeFields(variant)
  const primaryName = String(variant.attribute ?? '').trim() || humanizeAttributeKey(attributeKey)
  const primaryValue = String(attributeValue ?? '').trim()
  const nestedSecondaries = (Array.isArray(variant.secondary_variants) ? variant.secondary_variants : [])
    .map((item) => ({
      name: String(item?.attribute ?? '').trim(),
      value: String(item?.value ?? '').trim(),
      is_primary: false,
      sku: item?.sku,
      quantity: item?.quantity,
      reserved_quantity: item?.reserved_quantity,
      low_stock_threshold: item?.low_stock_threshold ?? item?.minimum_threshold,
      minimum_threshold: item?.minimum_threshold ?? item?.low_stock_threshold,
      price: item?.price ?? item?.regular_price,
      discount_price: item?.discount_price ?? item?.regular_discount_price,
      id: item?.id,
    }))
    .filter((item) => item.name && item.value)

  return {
    primary: { name: primaryName, value: primaryValue, is_primary: true },
    secondaries: nestedSecondaries,
  }
}

function mapSecondaryAttributeToFormValue(variant, secondary) {
  const lowStockThreshold = fromVariantOptionalField(
    getVariantLowStockField({
      low_stock_threshold: secondary.low_stock_threshold
        ?? resolveVariantInventoryValue(variant, 'low_stock_threshold'),
      minimum_threshold: secondary.minimum_threshold
        ?? resolveVariantInventoryValue(variant, 'minimum_threshold'),
    }),
  )

  return {
    id: isPersistedVariantId(variant.id)
      ? variant.id
      : (secondary.id ?? `sv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    attribute: secondary.name,
    value: secondary.value,
    sku: fromVariantOptionalField(secondary.sku ?? variant.sku),
    quantity: secondary.quantity == null && variant.quantity == null
      ? ''
      : String(secondary.quantity ?? variant.quantity),
    reserved_quantity: fromVariantOptionalField(
      secondary.reserved_quantity ?? resolveVariantInventoryValue(variant, 'reserved_quantity'),
    ),
    low_stock_threshold: lowStockThreshold,
    minimum_threshold: lowStockThreshold,
    price: fromVariantOptionalField(
      secondary.price == null && variant.regular_price == null && variant.price == null
        ? ''
        : String(secondary.price ?? variant.regular_price ?? variant.price),
    ),
    discount_price: fromVariantSalePriceField(
      secondary.discount_price ?? variant.regular_discount_price ?? variant.discount_price,
      secondary.price ?? variant.regular_price ?? variant.price,
    ),
  }
}

function resolveVariationGroupKey(grouped, attributeLabel) {
  const existing = [...grouped.keys()].find(
    (key) => key.toLowerCase() === attributeLabel.toLowerCase(),
  )
  return existing || attributeLabel
}

function mapVariantsToFormVariations(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) return []

  const byId = new Map(
    variants
      .filter((variant) => variant?.id != null)
      .map((variant) => [String(variant.id), variant]),
  )
  const grouped = new Map()
  const primarySlots = new Map()

  const getOrCreateSlot = (attributeLabel, primaryValue, variant) => {
    const groupKey = resolveVariationGroupKey(grouped, attributeLabel)
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        id: `var-${groupKey.toLowerCase().replace(/\s+/g, '-')}`,
        attribute: groupKey,
        values: [],
      })
    }

    const slotKey = `${groupKey.toLowerCase()}::${String(primaryValue).toLowerCase()}`
    let slot = primarySlots.get(slotKey)
    if (!slot) {
      slot = mapApiVariantToFormValue(variant, primaryValue)
      grouped.get(groupKey).values.push(slot)
      primarySlots.set(slotKey, slot)
    }
    return slot
  }

  const addSecondaries = (slot, variant, secondaries = []) => {
    secondaries.forEach((secondary) => {
      if (!secondary?.name || !secondary?.value) return
      const alreadyAdded = slot.secondary_variants.some((item) => (
        String(item.attribute).toLowerCase() === secondary.name.toLowerCase()
        && String(item.value).toLowerCase() === secondary.value.toLowerCase()
      ))
      if (alreadyAdded) return
      slot.secondary_variants.push(mapSecondaryAttributeToFormValue(variant, secondary))
    })
  }

  variants.forEach((variant) => {
    const parentId = variant.primary_variant_id != null ? String(variant.primary_variant_id) : ''
    if (parentId && byId.has(parentId)) return

    const { primary, secondaries } = getVariantAttributeEntries(variant)
    const attributeLabel = String(primary?.name ?? '').trim()
    const primaryValue = String(primary?.value ?? '').trim()
    if (!attributeLabel || !primaryValue) return

    addSecondaries(getOrCreateSlot(attributeLabel, primaryValue, variant), variant, secondaries)
  })

  variants.forEach((variant) => {
    const parentId = variant.primary_variant_id != null ? String(variant.primary_variant_id) : ''
    const parent = parentId ? byId.get(parentId) : null
    if (!parent) return

    const parentEntries = getVariantAttributeEntries(parent)
    const attributeLabel = String(parentEntries.primary?.name ?? '').trim()
    const primaryValue = String(parentEntries.primary?.value ?? '').trim()
    if (!attributeLabel || !primaryValue) return

    const slot = getOrCreateSlot(attributeLabel, primaryValue, parent)
    const { primary, secondaries } = getVariantAttributeEntries(variant)
    const extras = [primary, ...secondaries].filter((entry) => (
      entry?.name
      && entry.name.toLowerCase() !== attributeLabel.toLowerCase()
    ))
    addSecondaries(slot, variant, extras)
  })

  return Array.from(grouped.values())
}

function sortProductImages(images = []) {
  return [...images].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
}

function getDescriptiveImageDedupeKey(image) {
  if (typeof image === 'string') {
    const normalized = image.trim().split(/[?#]/)[0]
    return normalized || null
  }

  const url = String(image?.image_url ?? image?.url ?? image?.preview ?? image?.image_path ?? '').trim()
  if (url) return url.split(/[?#]/)[0]

  const remoteId = resolveRemoteProductImageId(image)
  return remoteId ? `id:${remoteId}` : null
}

function mergeDescriptiveImageRecords(existing, candidate) {
  const existingId = resolveRemoteProductImageId(existing)
  const candidateId = resolveRemoteProductImageId(candidate)

  if (!existingId && candidateId) return candidate
  // Both (or neither) carry ids — keep the first-seen record, which comes from
  // the descriptive_images list, the canonical source for description_images.
  return existing
}

function mergeDescriptiveImageSources(descriptiveImages = [], productImages = []) {
  const merged = new Map()

  sortProductImages([
    ...(Array.isArray(descriptiveImages) ? descriptiveImages : []),
    ...(Array.isArray(productImages) ? productImages : []).filter(isDescriptiveProductImage),
  ]).forEach((image, index) => {
    const key = getDescriptiveImageDedupeKey(image) ?? `__index__:${index}`
    const existing = merged.get(key)

    if (!existing) {
      merged.set(key, image)
      return
    }

    merged.set(key, mergeDescriptiveImageRecords(existing, image))
  })

  return sortProductImages([...merged.values()])
}

export function mapProductImagesToFormState(images = [], descriptiveImages = []) {
  const productSource = sortProductImages(
    (Array.isArray(images) ? images : []).filter((image) => !isDescriptiveProductImage(image)),
  )
  const descriptiveSource = mergeDescriptiveImageSources(descriptiveImages, images)

  const hasPrimaryFlag = productSource.some(isPrimaryProductImage)
  const mainRecord = hasPrimaryFlag
    ? productSource.find(isPrimaryProductImage) ?? null
    : productSource[0] ?? null
  const galleryRecords = hasPrimaryFlag
    ? productSource.filter(isGalleryProductImage)
    : productSource.filter((image) => image !== mainRecord)

  return {
    mainImage: mainRecord ? hydrateRemoteMediaImage(mainRecord) : null,
    subImages: galleryRecords.map(hydrateRemoteMediaImage),
    descriptiveImages: descriptiveSource.map(createDescriptiveImageFromRemote),
  }
}

export function mapProductRecordToFormValues(record, options = {}) {
  if (!record?.id) return null

  const variants = Array.isArray(record.variants) ? record.variants : []
  const firstVariant = variants[0]
  const shipping = record.shipping ?? {}
  const metadataMap = metadataToMap(record.metadata)
  const { category_id, subcategory_id } = resolveCategoryFields(record, options.categoryTree ?? [])
  const pricing = resolvePricingFields(record, firstVariant, metadataMap)

  const resolveQuantity = () => {
    const metadataQuantity = getMetadataValue(record.metadata, 'quantity')
    if (metadataQuantity != null && metadataQuantity !== '') {
      return String(metadataQuantity)
    }
    if (metadataMap.quantity != null) return String(metadataMap.quantity)
    if (record.quantity != null) return String(record.quantity)
    if (firstVariant?.quantity != null) return String(firstVariant.quantity)
    return ''
  }

  return {
    name: record.name ?? '',
    sku: getMetadataValue(record.metadata, 'sku')
      ?? metadataMap.sku
      ?? record.sku
      ?? firstVariant?.sku
      ?? '',
    description: record.description ?? '',
    category_id,
    subcategory_id,
    brand_id: (() => {
      const brandId = resolveBrandId(record)
      const nestedBrand = resolveNestedBrand(record)
      if (isGenericBrand(nestedBrand)) return ''
      if (isGenericBrand(brandId)) return ''
      return brandId ? String(brandId) : ''
    })(),
    condition: record.condition ?? metadataMap.condition ?? '',
    tags: normalizeTags(record.tags),
    key_details: mapKeyDetailsFromRecord(record),
    ...(() => {
      const mainOption = resolveMainProductOptionFields(record, firstVariant, metadataMap)
      return {
        ...mainOption,
        ...resolveProductCompatibleModels(record, metadataMap, mainOption, variants),
      }
    })(),
    ...pricing,
    quantity: resolveQuantity(),
    reserved_quantity: firstVariant?.reserved_quantity != null
      ? String(firstVariant.reserved_quantity)
      : '',
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
    is_active: isProductActive(record.is_active),
  }
}

export function mapProductRecordToFormState(record, options = {}) {
  const formValues = mapProductRecordToFormValues(record, options)
  if (!formValues) return null

  const { mainImage, subImages, descriptiveImages } = mapProductImagesToFormState(
    record.images ?? record.product_images,
    record.descriptive_images,
  )

  return {
    formValues,
    productBrand: normalizeBrandRecord(resolveNestedBrand(record)),
    mainImage,
    subImages,
    descriptiveImages,
  }
}
