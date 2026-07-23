import {
  getDiscountSummary,
  resolveSalesPrice,
  resolveVariantPricing,
  roundMoney,
} from './productPricing'
import { DEFAULT_PRODUCT_FULFILLMENT_CHANNEL } from '../constants/products'
import {
  VARIANT_OPTIONAL_EMPTY_VALUE,
  isBlankVariantField,
  optionalVariantFieldForPayload,
  optionalVariantNumberForPayload,
  optionalVariantStringForJsonPayload,
  optionalVariantNumberOrNullForJsonPayload,
  resolveVariantBarcodePayloadFields,
  resolveVariantCompatibleModelsForPayload,
  resolveVariantDisplayName,
  variantMinimumThresholdForPayload,
} from '../components/variants/variantFormUtils'
import { normalizeKeyDetailsForPayload, normalizeKeyDetailsForJsonPayload } from './productMetadata'
import {
  hasUsableProductImages,
  isKeptRemoteProductImage,
  resolveRemoteProductImageId,
  validateProductImageLimits,
  validateDescriptiveImageLimits,
  validateGalleryImagesRequired,
} from './productImageUtils'
import {
  buildProductMediaSaveImagesPayload,
  isImageUploadedToStorage,
} from './productMediaUploadUtils'

function describeFile(file) {
  if (!file) return null
  return {
    name: file.name,
    type: file.type,
    size: file.size,
  }
}

export function isFileValue(value) {
  return typeof File !== 'undefined' && value instanceof File
}

export function formatProductPayloadSample(formData) {
  const sample = {}
  const metadata = []
  const keyDetails = []

  for (const [key, value] of formData.entries()) {
    const metadataMatch = key.match(/^metadata\[(\d+)]\[(key|value)]$/)
    if (metadataMatch) {
      const index = Number(metadataMatch[1])
      const field = metadataMatch[2]
      if (!metadata[index]) metadata[index] = { key: '', value: '' }
      metadata[index][field] = isFileValue(value) ? describeFile(value) : value
      continue
    }

    const keyDetailsMatch = key.match(/^key_details\[(\d+)]\[(property|value)]$/)
    if (keyDetailsMatch) {
      const index = Number(keyDetailsMatch[1])
      const field = keyDetailsMatch[2]
      if (!keyDetails[index]) keyDetails[index] = { property: '', value: '' }
      keyDetails[index][field] = isFileValue(value) ? describeFile(value) : value
      continue
    }

    if (key === 'key_details[]' && value === '') {
      sample.key_details = []
      continue
    }

    sample[key] = isFileValue(value) ? describeFile(value) : value
  }

  sample.metadata = metadata.filter(Boolean)
  if (keyDetails.length > 0) {
    sample.key_details = keyDetails.filter(Boolean)
  }
  return sample
}

function toNumberOrNull(val) {
  if (val === '' || val === null || val === undefined) return null
  const num = Number(val)
  return isNaN(num) ? null : num
}

function toMoneyOrNull(val) {
  const num = toNumberOrNull(val)
  return num == null ? null : roundMoney(num)
}

function resolvePayloadId(value) {
  if (value == null || value === '') return null

  if (typeof value === 'object') {
    const id = value.id ?? value.brand_id ?? null
    if (id == null || id === '') return null
    return String(id).trim()
  }

  return String(value).trim()
}

function resolveProductPricingValues(values = {}) {
  const discountMode = values.discount_mode ?? 'amount'
  const listPrice = toMoneyOrNull(values.price)
  const salePrice = resolveSalesPrice(
    values.price,
    discountMode,
    values.discount_price,
    values.discount_percent,
  )

  return {
    discountMode,
    listPrice,
    salePrice,
    discountPercent: toNumberOrNull(values.discount_percent),
    discountAmount: toNumberOrNull(values.discount_price),
  }
}

function appendRootPricingFields(formData, values = {}) {
  const { discountMode, listPrice, salePrice, discountPercent, discountAmount } =
    resolveProductPricingValues(values)

  appendFormData(formData, 'regular_price', listPrice)
  appendFormData(formData, 'price', listPrice)
  appendFormData(formData, 'discount_mode', discountMode)

  if (discountMode === 'percent') {
    appendFormData(formData, 'discount_percent', discountPercent)
  } else {
    appendFormData(formData, 'discount_price', discountAmount ?? salePrice)
  }

  appendFormData(formData, 'regular_discount_price', salePrice)
}

function slugifyAttributeKey(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

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

function resolveImageFile(image) {
  if (isFileValue(image)) return image
  if (isFileValue(image?.file)) return image.file
  return null
}

function buildProductImagesPayload(mainImage, subImages = []) {
  const images = [mainImage, ...subImages].filter(Boolean)

  return images.map((image, index) => {
    const file = resolveImageFile(image)

    return {
      file,
      remoteId: image?.remoteId ?? null,
      imageUrl: image?.isRemote ? image.preview : null,
      upload_id: image?.upload_id ?? null,
      sort_order: index,
      is_primary: index === 0,
    }
  })
}

function buildVariantImagesPayload(images = [], { filesOnly = false } = {}) {
  const normalized = (Array.isArray(images) ? images : []).map((image, index) => {
    const file = resolveImageFile(image)

    return {
      file,
      remoteId: image?.remoteId ?? null,
      imageUrl: image?.isRemote ? image.preview : null,
      sort_order: index,
      is_primary: index === 0,
    }
  })

  return filesOnly ? normalized.filter((image) => isFileValue(image.file)) : normalized
}

function resolveVariantImageLabel(variantValue, variation) {
  return (
    variantValue.value?.trim()
    || variantValue.variant_name?.trim()
    || variation.attribute?.trim()
    || 'Variant'
  )
}

function assertVariantImagesPresent(variantValue, variation, { mode = 'create' } = {}) {
  const label = resolveVariantImageLabel(variantValue, variation)
  const images = variantValue.images ?? []

  if (!hasUsableProductImages(images, variantValue.image_url)) {
    throw new Error(`"${label}" requires at least one image. Upload a JPG or PNG file and try again.`)
  }

  if (mode === 'create') {
    const hasFileUpload = images.some((image) => isFileValue(image?.file))
    const hasStoragePath = images.some((image) => isImageUploadedToStorage(image))
    if (!hasFileUpload && !hasStoragePath && !String(variantValue.image_url ?? '').trim()) {
      throw new Error(`"${label}" requires at least one image. Upload a JPG or PNG file and try again.`)
    }
  }
}

function buildSingleVariationFields(variantValue, variation, values) {
  const attributeValue = variantValue.value?.trim()
  const pricing = resolveVariantPricing(variantValue, values)
  const hasCustomPrice =
    !isBlankVariantField(variantValue.price)
    && variantValue.price !== VARIANT_OPTIONAL_EMPTY_VALUE

  let discountPrice = pricing.salePrice
  if (hasCustomPrice) {
    const rawSale = variantValue.discount_price
    if (isBlankVariantField(rawSale) || rawSale === VARIANT_OPTIONAL_EMPTY_VALUE) {
      discountPrice = VARIANT_OPTIONAL_EMPTY_VALUE
    }
  }

  const barcodeFields = resolveVariantBarcodePayloadFields(variantValue)
  const compatibleModelsFields = resolveVariantCompatibleModelsForPayload(variantValue)

  return {
    value: attributeValue || null,
    variant_name: resolveVariantDisplayName(variantValue, variation, values),
    quantity: toNumberOrNull(variantValue.quantity) ?? 0,
    reserved_quantity: optionalVariantNumberForPayload(variantValue.reserved_quantity, 0),
    low_stock_threshold: variantMinimumThresholdForPayload(
      variantValue.minimum_threshold ?? variantValue.low_stock_threshold,
    ),
    ...barcodeFields,
    weight: optionalVariantNumberForPayload(variantValue.weight, 0),
    length: optionalVariantNumberForPayload(variantValue.length, 0),
    width: optionalVariantNumberForPayload(variantValue.width, 0),
    height: optionalVariantNumberForPayload(variantValue.height, 0),
    description: optionalVariantFieldForPayload(variantValue.description),
    ...compatibleModelsFields,
    price: pricing.listPrice,
    regular_price: pricing.listPrice,
    discount_price: discountPrice,
    regular_discount_price: discountPrice,
    sku: optionalVariantFieldForPayload(variantValue.sku),
  }
}

function buildSingleVariationJsonFields(variantValue, variation, values) {
  const attributeValue = variantValue.value?.trim()
  const pricing = resolveVariantPricing(variantValue, values)
  const hasCustomPrice =
    !isBlankVariantField(variantValue.price)
    && variantValue.price !== VARIANT_OPTIONAL_EMPTY_VALUE

  let discountPrice = pricing.salePrice
  if (hasCustomPrice) {
    const rawSale = variantValue.discount_price
    if (isBlankVariantField(rawSale) || rawSale === VARIANT_OPTIONAL_EMPTY_VALUE) {
      discountPrice = null
    }
  }

  const barcodeFields = resolveVariantBarcodePayloadFields(variantValue)
  const compatibleModelsFields = resolveVariantCompatibleModelsForPayload(variantValue)

  return {
    value: attributeValue || null,
    variant_name: resolveVariantDisplayName(variantValue, variation, values),
    quantity: toNumberOrNull(variantValue.quantity) ?? 0,
    reserved_quantity: optionalVariantNumberForPayload(variantValue.reserved_quantity, 0),
    low_stock_threshold: variantMinimumThresholdForPayload(
      variantValue.minimum_threshold ?? variantValue.low_stock_threshold,
    ),
    ...barcodeFields,
    weight: optionalVariantNumberOrNullForJsonPayload(variantValue.weight),
    length: optionalVariantNumberOrNullForJsonPayload(variantValue.length),
    width: optionalVariantNumberOrNullForJsonPayload(variantValue.width),
    height: optionalVariantNumberOrNullForJsonPayload(variantValue.height),
    description: optionalVariantStringForJsonPayload(variantValue.description),
    ...compatibleModelsFields,
    price: pricing.listPrice,
    regular_price: pricing.listPrice,
    discount_price: discountPrice,
    regular_discount_price: discountPrice,
    sku: optionalVariantStringForJsonPayload(variantValue.sku),
  }
}

function buildSingleVariationValueData(variantValue, variation, values) {
  return {
    ...buildSingleVariationFields(variantValue, variation, values),
    images: buildVariantImagesPayload(variantValue.images, { filesOnly: true }),
  }
}

function buildSingleVariationJsonValueData(variantValue, variation, values) {
  const images = (variantValue.images ?? [])
    .filter(Boolean)
    .map((image, index) => buildStoragePathImageEntry(image, index))
    .filter(Boolean)

  return {
    ...buildSingleVariationJsonFields(variantValue, variation, values),
    images,
  }
}

/** Flat single-variant record — used by the standalone variant create/update endpoints. */
function buildSingleVariationData(variantValue, variation, values) {
  const attributeKey = slugifyAttributeKey(variation.attribute ?? '')
  const attributeValue = variantValue.value?.trim()

  return {
    attribute: variation.attribute?.trim() || null,
    value: attributeValue || null,
    ...buildSingleVariationValueData(variantValue, variation, values),
    attributes:
      attributeKey && attributeValue
        ? { [attributeKey]: attributeValue.toLowerCase() }
        : null,
  }
}

function buildVariationsPayload(variations, values) {
  const payload = []

  for (const variation of variations ?? []) {
    const attribute = variation.attribute?.trim()
    if (!attribute) continue

    const groupValues = []

    for (const val of variation.values ?? []) {
      assertVariantImagesPresent(val, variation, { mode: 'create' })
      groupValues.push(buildSingleVariationValueData(val, variation, values))
    }

    if (groupValues.length === 0) continue

    payload.push({
      attribute,
      values: groupValues,
    })
  }

  return payload
}

function appendFormDataValue(formData, key, value) {
  if (value === undefined) return

  if (isFileValue(value)) {
    formData.append(key, value, value.name)
    return
  }

  if (value === null) {
    formData.append(key, '')
    return
  }

  if (typeof value === 'boolean') {
    formData.append(key, value ? '1' : '0')
    return
  }

  formData.append(key, String(value))
}

function appendFormData(formData, key, value) {
  if (isFileValue(value) || value === null || typeof value !== 'object') {
    appendFormDataValue(formData, key, value)
    return
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return

    value.forEach((item, index) => {
      if (item !== null && typeof item === 'object' && !isFileValue(item) && !Array.isArray(item)) {
        Object.entries(item).forEach(([childKey, childValue]) => {
          appendFormData(formData, `${key}[${index}][${childKey}]`, childValue)
        })
        return
      }

      appendFormData(formData, `${key}[${index}]`, item)
    })
    return
  }

  const entries = Object.entries(value)
  if (entries.length === 0) return

  entries.forEach(([childKey, childValue]) => {
    appendFormData(formData, `${key}[${childKey}]`, childValue)
  })
}

function appendProductImageFiles(formData, productImages) {
  productImages.forEach((image, index) => {
    if (isFileValue(image.file)) {
      formData.append(`images[${index}][image_url]`, image.file, image.file.name)
    } else if (image.remoteId) {
      formData.append(`images[${index}][id]`, image.remoteId)
    } else if (image.imageUrl) {
      formData.append(`images[${index}][image_url]`, image.imageUrl)
    }

    formData.append(`images[${index}][sort_order]`, String(image.sort_order))
    formData.append(`images[${index}][is_primary]`, image.is_primary ? '1' : '0')
  })
}

function collectKeepImageIds(mainImage, subImages = []) {
  // Collect from form state — not the normalized payload objects.
  // Unchanged remote images still in the form are kept.
  // Removed or replaced images are omitted so the backend can drop their IDs.
  return [mainImage, ...subImages]
    .filter(Boolean)
    .filter(isKeptRemoteProductImage)
    .map((image) => resolveRemoteProductImageId(image))
    .filter(Boolean)
}

function appendKeepImageIds(formData, keepImageIds = [], keyPrefix = '') {
  keepImageIds.forEach((id, index) => {
    const key = keyPrefix
      ? `${keyPrefix}[keep_image_ids][${index}]`
      : `keep_image_ids[${index}]`
    formData.append(key, id)
  })
}

function appendRemovedImageIds(formData, removedImageIds = [], fieldName = 'removed_image_ids') {
  removedImageIds.forEach((id, index) => {
    formData.append(`${fieldName}[${index}]`, String(id))
  })
}

function appendNewProductImageFiles(formData, productImages = []) {
  let newImageIndex = 0

  productImages.forEach((image) => {
    if (isFileValue(image.file)) {
      formData.append(
        `images[${newImageIndex}][image_url]`,
        image.file,
        image.file.name,
      )
      formData.append(`images[${newImageIndex}][sort_order]`, String(image.sort_order))
      formData.append(
        `images[${newImageIndex}][is_primary]`,
        image.is_primary ? '1' : '0',
      )
      newImageIndex += 1
      return
    }

    if (image.upload_id && !image.remoteId) {
      appendPresignedImageEntry(formData, image, `images[${newImageIndex}]`)
      newImageIndex += 1
    }
  })
}

function buildDescriptiveImagesPayload(descriptiveImages = []) {
  return (Array.isArray(descriptiveImages) ? descriptiveImages : [])
    .filter(Boolean)
    .map((image) => {
      const file = resolveImageFile(image)

      return {
        file,
        remoteId: image?.remoteId ?? null,
        imageUrl: image?.isRemote ? image.preview : null,
        upload_id: image?.upload_id ?? null,
      }
    })
}

function appendDescriptiveImageFiles(formData, descriptiveImages) {
  let index = 0

  descriptiveImages.forEach((image) => {
    if (!isFileValue(image.file)) return

    formData.append(`descriptive_images[${index}]`, image.file, image.file.name)
    index += 1
  })
}

function collectKeepDescriptiveImageIds(descriptiveImages = []) {
  return (Array.isArray(descriptiveImages) ? descriptiveImages : [])
    .filter(Boolean)
    .filter(isKeptRemoteProductImage)
    .map((image) => resolveRemoteProductImageId(image))
    .filter(Boolean)
}

function appendNewDescriptiveImageFiles(formData, descriptiveImages = []) {
  let newImageIndex = 0

  descriptiveImages.forEach((image) => {
    if (isFileValue(image.file)) {
      formData.append(
        `descriptive_images[${newImageIndex}]`,
        image.file,
        image.file.name,
      )
      newImageIndex += 1
      return
    }

    if (image.upload_id && !image.remoteId) {
      appendPresignedImageEntry(formData, image, `descriptive_images[${newImageIndex}]`, {
        includePrimary: false,
      })
      newImageIndex += 1
    }
  })
}

function appendKeyDetailsToFormData(formData, keyDetails = []) {
  const normalized = normalizeKeyDetailsForPayload(keyDetails)

  if (normalized.length === 0) {
    appendFormDataEmptyArray(formData, 'key_details')
    return
  }

  normalized.forEach((item, index) => {
    formData.append(`key_details[${index}][property]`, item.property)
    formData.append(`key_details[${index}][value]`, item.value)
  })
}

/** Presigned JSON create expects each key_details[n] to be a JSON string. */
function appendKeyDetailsStringsToFormData(formData, keyDetails = []) {
  const entries = normalizeKeyDetailsForJsonPayload(keyDetails)

  if (entries.length === 0) {
    appendFormDataEmptyArray(formData, 'key_details')
    return
  }

  entries.forEach((entry, index) => {
    formData.append(`key_details[${index}]`, entry)
  })
}

function appendPresignedImageEntry(formData, image, prefix, { includePrimary = true } = {}) {
  if (!image) return false

  let appended = false

  if (image.upload_id) {
    formData.append(`${prefix}[upload_id]`, String(image.upload_id))
    appended = true
  } else if (image.image_url) {
    formData.append(`${prefix}[image_url]`, String(image.image_url))
    appended = true
  } else if (image.id) {
    formData.append(`${prefix}[id]`, String(image.id))
    appended = true
  }

  if (!appended) return false

  formData.append(`${prefix}[sort_order]`, String(image.sort_order ?? 0))

  if (includePrimary) {
    formData.append(
      `${prefix}[is_primary]`,
      (image.is_primary ?? false) ? '1' : '0',
    )
  }

  return true
}

function appendPresignedImagesToFormData(
  formData,
  images = [],
  prefix = 'product_images',
  options = {},
) {
  const list = (Array.isArray(images) ? images : []).filter(Boolean)

  if (list.length === 0) {
    appendFormDataEmptyArray(formData, prefix)
    return
  }

  list.forEach((image, index) => {
    appendPresignedImageEntry(formData, image, `${prefix}[${index}]`, options)
  })
}

function appendPresignedVariationsToFormData(formData, variations = []) {
  variations.forEach((group, groupIndex) => {
    const groupPrefix = `variations[${groupIndex}]`
    formData.append(`${groupPrefix}[attribute]`, group.attribute)

    group.values.forEach((valueData, valueIndex) => {
      const valuePrefix = `${groupPrefix}[values][${valueIndex}]`
      appendVariationValueFields(formData, valueData, valuePrefix)
      // Same bracket shape as product_images: [upload_id][sort_order][is_primary]
      appendPresignedImagesToFormData(
        formData,
        valueData.images ?? [],
        `${valuePrefix}[images]`,
        { includePrimary: true },
      )
    })
  })
}

function appendDescriptiveImagesToFormData(
  formData,
  descriptiveImages,
  { mode = 'create', sourceImages = [], removedDescriptiveImageIds = [] } = {},
) {
  if (mode === 'edit') {
    collectKeepDescriptiveImageIds(sourceImages).forEach((id, index) => {
      formData.append(`keep_descriptive_image_ids[${index}]`, id)
    })

    if (removedDescriptiveImageIds.length > 0) {
      appendRemovedImageIds(formData, removedDescriptiveImageIds, 'removed_descriptive_image_ids')
    }

    appendNewDescriptiveImageFiles(formData, descriptiveImages)
    return
  }

  appendDescriptiveImageFiles(formData, descriptiveImages)
}

export function validateDescriptiveImageFiles(descriptiveImages = [], options = {}) {
  const { mode = 'create' } = options
  const images = Array.isArray(descriptiveImages) ? descriptiveImages : []

  if (images.length === 0) return []

  const limitsResult = validateDescriptiveImageLimits(images)

  if (!limitsResult.valid) {
    throw new Error(limitsResult.message)
  }

  const payload = buildDescriptiveImagesPayload(images)

  payload.forEach((image, index) => {
    if (mode === 'edit' && !image.file && (image.remoteId || image.imageUrl || image.upload_id)) {
      return
    }

    if (!isFileValue(image.file)) {
      throw new Error(`Descriptive image ${index + 1} is invalid. Re-upload the image and try again.`)
    }
  })

  return mode === 'edit'
    ? payload.filter((image) => isFileValue(image.file) || image.upload_id)
    : payload
}

function appendProductImagesToFormData(
  formData,
  productImages,
  {
    mode = 'create',
    mainImage = null,
    subImages = [],
    removedProductImageIds = [],
  } = {},
) {
  const primaryImage = productImages.find((image) => image.is_primary) ?? productImages[0]
  const primaryFile = primaryImage?.file

  if (mode === 'edit') {
    appendKeepImageIds(formData, collectKeepImageIds(mainImage, subImages))

    if (removedProductImageIds.length > 0) {
      appendRemovedImageIds(formData, removedProductImageIds)
    }

    if (isFileValue(primaryFile)) {
      formData.append('primary_image', primaryFile, primaryFile.name)
    } else if (primaryImage?.upload_id && !primaryImage?.remoteId) {
      appendPresignedImageEntry(formData, primaryImage, 'primary_image')
    }

    appendNewProductImageFiles(formData, productImages)
    return
  }

  if (isFileValue(primaryFile)) {
    formData.append('primary_image', primaryFile, primaryFile.name)
  }

  appendProductImageFiles(formData, productImages)
}

function appendMetadata(formData, metadata) {
  if (!Array.isArray(metadata) || metadata.length === 0) return
  appendFormData(formData, 'metadata', metadata)
}

function metadataEntry(key, value) {
  if (value === null || value === undefined || value === '') return null
  return { key, value: String(value) }
}

function buildPricingMetadata(values) {
  const { discountMode } = resolveProductPricingValues(values)
  const { savings, percentOff, hasDiscount } = getDiscountSummary(
    values.price,
    discountMode,
    values.discount_price,
    values.discount_percent,
  )

  const entries = [
    metadataEntry('sku', values.sku?.trim()),
    metadataEntry('quantity', values.quantity),
    metadataEntry('low_stock_threshold', values.low_stock_threshold),
    metadataEntry('barcode', values.barcode?.trim()),
    metadataEntry('percent_off', hasDiscount ? percentOff : null),
    metadataEntry('savings_amount', hasDiscount ? savings : null),
    metadataEntry('has_discount', hasDiscount ? '1' : '0'),
  ]

  return entries.filter(Boolean)
}

function buildShippingMetadata(values) {
  const entries = [
    metadataEntry('shipping_weight', toMoneyOrNull(values.shipping_weight)),
    metadataEntry('shipping_length', toMoneyOrNull(values.shipping_length)),
    metadataEntry('shipping_width', toMoneyOrNull(values.shipping_width)),
    metadataEntry('shipping_height', toMoneyOrNull(values.shipping_height)),
  ]

  return entries.filter(Boolean)
}

export function mergeProductMetadata(values) {
  const pricingMetadata = buildPricingMetadata(values)
  const shippingMetadata = buildShippingMetadata(values)

  return [...pricingMetadata, ...shippingMetadata]
}

function appendNewVariantImageFiles(formData, productImages = [], prefix = 'variations[0][images]') {
  let newImageIndex = 0

  productImages.forEach((image) => {
    if (!isFileValue(image.file)) return

    formData.append(
      `${prefix}[${newImageIndex}][image_url]`,
      image.file,
      image.file.name,
    )
    formData.append(`${prefix}[${newImageIndex}][sort_order]`, String(image.sort_order))
    formData.append(
      `${prefix}[${newImageIndex}][is_primary]`,
      image.is_primary ? '1' : '0',
    )
    newImageIndex += 1
  })
}

function appendFormDataEmptyArray(formData, prefix = 'images') {
  // Laravel expects a real array, not the string "[]". PHP bracket notation
  // ensures the field is parsed as an array type in multipart form data.
  formData.append(`${prefix}[]`, '')
}

function appendVariantImagesToFormData(
  formData,
  productImages,
  {
    mode = 'create',
    sourceImages = [],
    prefix = 'variations[0][images]',
    keepImageIdsPrefix = '',
  } = {},
) {
  if (mode === 'edit') {
    appendKeepImageIds(
      formData,
      collectKeepImageIds(null, sourceImages),
      keepImageIdsPrefix,
    )

    const hasNewUploads = productImages.some((image) => isFileValue(image.file))
    if (hasNewUploads) {
      appendNewVariantImageFiles(formData, productImages, prefix)
    } else {
      appendFormDataEmptyArray(formData, prefix)
    }
    return
  }

  productImages.forEach((image, imageIndex) => {
    if (!isFileValue(image.file)) return

    formData.append(`${prefix}[${imageIndex}][image_url]`, image.file, image.file.name)
    formData.append(`${prefix}[${imageIndex}][sort_order]`, String(image.sort_order))
    formData.append(
      `${prefix}[${imageIndex}][is_primary]`,
      image.is_primary ? '1' : '0',
    )
  })
}

function resolveFormFieldKey(keyPrefix, field) {
  return keyPrefix ? `${keyPrefix}[${field}]` : field
}

function normalizeVariantUpdateData(variationData, variantValue, variation, productValues) {
  const attributeKey = slugifyAttributeKey(variation.attribute ?? '')
  const attributeValue = variantValue.value?.trim()
  // Same attribute shape as AddProduct → buildSingleVariationData
  const attributes =
    attributeKey && attributeValue
      ? { [attributeKey]: attributeValue.toLowerCase() }
      : variationData.attributes

  const barcodeFields = resolveVariantBarcodePayloadFields(variantValue)
  const compatibleModelsFields = resolveVariantCompatibleModelsForPayload(variantValue)

  return {
    ...variationData,
    attribute: variation.attribute?.trim() || variationData.attribute || null,
    value: attributeValue || variationData.value || null,
    variant_name: resolveVariantDisplayName(variantValue, variation, productValues),
    quantity: variationData.quantity ?? 0,
    reserved_quantity: optionalVariantNumberForPayload(variantValue.reserved_quantity, 0),
    low_stock_threshold:
      variationData.low_stock_threshold
      ?? variationData.minimum_threshold
      ?? variantMinimumThresholdForPayload(
        variantValue.minimum_threshold ?? variantValue.low_stock_threshold,
      ),
    barcode: barcodeFields.barcode ?? '',
    barcode_type: barcodeFields.barcode_type,
    weight: variationData.weight ?? null,
    length: variationData.length ?? null,
    width: variationData.width ?? null,
    height: variationData.height ?? null,
    description: variationData.description || null,
    ...compatibleModelsFields,
    price: variationData.price ?? toNumberOrNull(productValues.price) ?? 0,
    regular_price:
      variationData.regular_price
      ?? variationData.price
      ?? toNumberOrNull(productValues.price)
      ?? 0,
    discount_price:
      variationData.discount_price
      ?? variationData.regular_discount_price
      ?? null,
    regular_discount_price:
      variationData.regular_discount_price
      ?? variationData.discount_price
      ?? null,
    sku: variationData.sku || productValues.sku?.trim() || '',
    attributes,
  }
}

function appendVariationValueFields(formData, valueData, keyPrefix = '') {
  Object.entries(valueData).forEach(([field, value]) => {
    if (field === 'images') return
    appendFormData(formData, resolveFormFieldKey(keyPrefix, field), value)
  })
}

function appendSingleVariationFields(formData, variation, keyPrefix = '') {
  Object.entries(variation).forEach(([field, value]) => {
    if (field === 'images' || field === 'attributes') return
    appendFormData(formData, resolveFormFieldKey(keyPrefix, field), value)
  })

  if (variation.attributes && Object.keys(variation.attributes).length > 0) {
    appendFormData(
      formData,
      resolveFormFieldKey(keyPrefix, 'attributes'),
      variation.attributes,
    )
  }
}

function appendVariationFiles(formData, variations) {
  variations.forEach((group, groupIndex) => {
    const groupPrefix = `variations[${groupIndex}]`
    appendFormData(formData, `${groupPrefix}[attribute]`, group.attribute)

    group.values.forEach((valueData, valueIndex) => {
      const valuePrefix = `${groupPrefix}[values][${valueIndex}]`
      appendVariationValueFields(formData, valueData, valuePrefix)
      appendVariantImagesToFormData(formData, valueData.images, {
        mode: 'create',
        prefix: `${valuePrefix}[images]`,
      })
    })
  })
}

export function validateProductImageFiles(mainImage, subImages = [], options = {}) {
  const { mode = 'create' } = options
  const galleryResult = validateGalleryImagesRequired(mainImage, subImages)
  if (!galleryResult.valid) {
    throw new Error(galleryResult.message)
  }

  const limitsResult = validateProductImageLimits(mainImage, subImages)

  if (!limitsResult.valid) {
    throw new Error(limitsResult.message)
  }

  const productImages = buildProductImagesPayload(mainImage, subImages)

  if (productImages.length === 0) {
    throw new Error('Main product image is required. Upload a JPG or PNG file and try again.')
  }

  productImages.forEach((image, index) => {
    if (mode === 'edit' && !image.file && (image.remoteId || image.imageUrl || image.upload_id)) {
      return
    }

    if (!isFileValue(image.file)) {
      throw new Error(
        index === 0
          ? 'Main product image file is invalid. Re-upload the image and try again.'
          : `Gallery image ${index} is invalid. Re-upload the image and try again.`,
      )
    }
  })

  return productImages
}

export function buildProductPayload(values, mainImage, subImages = [], options = {}) {
  const {
    mode = 'create',
    includeVariations = true,
    descriptiveImages = [],
    removedProductImageIds = [],
    removedDescriptiveImageIds = [],
  } = options
  const productImages = validateProductImageFiles(mainImage, subImages, { mode })
  const descriptiveImagePayload = validateDescriptiveImageFiles(descriptiveImages, { mode })
  const variations = includeVariations
    ? buildVariationsPayload(values.variations, values)
    : []
  const metadata = mergeProductMetadata(values)
  const tags = values.tags ?? []

  const formData = new FormData()

  appendFormData(formData, 'name', values.name.trim())
  appendFormData(formData, 'sku', values.sku.trim())
  appendFormData(formData, 'description', values.description.trim())
  appendFormData(formData, 'category_id', values.category_id)
  appendFormData(formData, 'subcategory_id', values.subcategory_id)
  appendFormData(formData, 'brand_id', values.brand_id)
  appendFormData(formData, 'condition', values.condition)
  appendFormData(
    formData,
    'fulfillment_channel',
    values.fulfillment_channel || DEFAULT_PRODUCT_FULFILLMENT_CHANNEL,
  )
  appendFormData(formData, 'is_active', values.status === 'active' ? true : Boolean(values.is_active))
  appendFormData(formData, 'status', values.status)
  appendRootPricingFields(formData, values)
  appendFormData(formData, 'quantity', Number(values.quantity))
  appendFormData(formData, 'low_stock_threshold', toNumberOrNull(values.low_stock_threshold))
  appendFormData(formData, 'barcode', values.barcode?.trim() || null)

  appendFormData(formData, 'tags', tags)
  appendKeyDetailsToFormData(formData, values.key_details)
  appendMetadata(formData, metadata)
  appendFormData(formData, 'shipping', {
    weight: toMoneyOrNull(values.shipping_weight),
    length: toMoneyOrNull(values.shipping_length),
    width: toMoneyOrNull(values.shipping_width),
    height: toMoneyOrNull(values.shipping_height),
  })

  appendProductImagesToFormData(formData, productImages, {
    mode,
    mainImage,
    subImages,
    removedProductImageIds,
  })
  appendDescriptiveImagesToFormData(formData, descriptiveImagePayload, {
    mode,
    sourceImages: descriptiveImages,
    removedDescriptiveImageIds,
  })

  if (includeVariations) {
    appendVariationFiles(formData, variations)
  }

  return formData
}

function buildStoragePathImageEntry(image, index) {
  const uploadId = image?.upload_id ?? null
  const imageUrl = image?.image_url ?? image?.s3Path ?? image?.storagePath ?? null

  if (uploadId) {
    return {
      upload_id: String(uploadId),
      sort_order: index,
      is_primary: index === 0,
    }
  }

  if (!imageUrl) return null

  return {
    image_url: String(imageUrl),
    sort_order: index,
    is_primary: index === 0,
  }
}

function buildVariationsJsonPayload(variations, values, { mode = 'create' } = {}) {
  const payload = []

  for (const variation of variations ?? []) {
    const attribute = variation.attribute?.trim()
    if (!attribute) continue

    const groupValues = []

    for (const val of variation.values ?? []) {
      assertVariantImagesPresent(val, variation, { mode })

      const valueData = buildSingleVariationJsonValueData(val, variation, values)

      if (valueData.images.length === 0) {
        throw new Error(
          `"${resolveVariantImageLabel(val, variation)}" image upload did not finish. Please try again.`,
        )
      }

      groupValues.push(valueData)
    }

    if (groupValues.length === 0) continue

    payload.push({
      attribute,
      values: groupValues,
    })
  }

  return payload
}

function assertProductImagesUploaded(mainImage, subImages = []) {
  const galleryResult = validateGalleryImagesRequired(mainImage, subImages)
  if (!galleryResult.valid) {
    throw new Error(galleryResult.message)
  }

  const limitsResult = validateProductImageLimits(mainImage, subImages)
  if (!limitsResult.valid) {
    throw new Error(limitsResult.message)
  }

  const images = [mainImage, ...subImages].filter(Boolean)

  images.forEach((image, index) => {
    if (isImageUploadedToStorage(image) || isKeptRemoteProductImage(image)) return

    throw new Error(
      index === 0
        ? 'Main product image upload did not finish. Please try publishing again.'
        : `Gallery image ${index} upload did not finish. Please try publishing again.`,
    )
  })
}

/**
 * JSON product create payload using presigned upload_id references (after S3 upload).
 * Sent as application/json so the request body is readable in devtools.
 */
export function buildProductCreateJsonPayload(
  values,
  mainImage,
  subImages = [],
  options = {},
) {
  const {
    includeVariations = true,
    descriptiveImages = [],
    variations: variationsOverride,
  } = options

  const variationSource = variationsOverride ?? values.variations

  assertProductImagesUploaded(mainImage, subImages)

  if (descriptiveImages.length > 0) {
    const limitsResult = validateDescriptiveImageLimits(descriptiveImages)
    if (!limitsResult.valid) {
      throw new Error(limitsResult.message)
    }

    descriptiveImages.forEach((image, index) => {
      if (isImageUploadedToStorage(image) || isKeptRemoteProductImage(image)) return
      throw new Error(`Descriptive image ${index + 1} upload did not finish. Please try publishing again.`)
    })
  }

  const { discountMode, listPrice, salePrice, discountPercent, discountAmount } =
    resolveProductPricingValues(values)
  const metadata = mergeProductMetadata(values)
  const mediaImages = buildProductMediaSaveImagesPayload({
    mainImage,
    subImages,
    descriptiveImages,
    variations: variationSource,
  })

  return {
    name: values.name.trim(),
    sku: values.sku.trim(),
    description: values.description.trim(),
    category_id: resolvePayloadId(values.category_id),
    subcategory_id: resolvePayloadId(values.subcategory_id),
    brand_id: resolvePayloadId(values.brand_id),
    condition: values.condition,
    fulfillment_channel: values.fulfillment_channel || DEFAULT_PRODUCT_FULFILLMENT_CHANNEL,
    is_active: values.status === 'active' ? true : Boolean(values.is_active),
    status: values.status,
    regular_price: listPrice,
    price: listPrice,
    discount_mode: discountMode,
    discount_percent: discountMode === 'percent' ? discountPercent : undefined,
    discount_price: discountMode === 'percent' ? undefined : (discountAmount ?? salePrice),
    regular_discount_price: salePrice,
    quantity: Number(values.quantity),
    low_stock_threshold: toNumberOrNull(values.low_stock_threshold),
    barcode: values.barcode?.trim() || null,
    tags: values.tags ?? [],
    key_details: normalizeKeyDetailsForJsonPayload(values.key_details),
    metadata,
    shipping: {
      weight: toMoneyOrNull(values.shipping_weight),
      length: toMoneyOrNull(values.shipping_length),
      width: toMoneyOrNull(values.shipping_width),
      height: toMoneyOrNull(values.shipping_height),
    },
    product_images: mediaImages.product_images,
    description_images: mediaImages.description_images,
    variations: includeVariations
      ? buildVariationsJsonPayload(variationSource, values, { mode: 'create' })
      : [],
  }
}

/** @deprecated Prefer buildProductCreateJsonPayload for presigned create (readable JSON body). */
export function buildProductCreateFormDataPayload(
  values,
  mainImage,
  subImages = [],
  options = {},
) {
  const {
    includeVariations = true,
    descriptiveImages = [],
    variations: variationsOverride,
  } = options

  const variationSource = variationsOverride ?? values.variations

  assertProductImagesUploaded(mainImage, subImages)

  if (descriptiveImages.length > 0) {
    const limitsResult = validateDescriptiveImageLimits(descriptiveImages)
    if (!limitsResult.valid) {
      throw new Error(limitsResult.message)
    }

    descriptiveImages.forEach((image, index) => {
      if (isImageUploadedToStorage(image) || isKeptRemoteProductImage(image)) return
      throw new Error(`Descriptive image ${index + 1} upload did not finish. Please try publishing again.`)
    })
  }

  const metadata = mergeProductMetadata(values)
  const mediaImages = buildProductMediaSaveImagesPayload({
    mainImage,
    subImages,
    descriptiveImages,
    variations: variationSource,
  })

  const variations = includeVariations
    ? buildVariationsJsonPayload(variationSource, values, { mode: 'create' })
    : []

  const formData = new FormData()

  appendFormData(formData, 'name', values.name.trim())
  appendFormData(formData, 'sku', values.sku.trim())
  appendFormData(formData, 'description', values.description.trim())
  appendFormData(formData, 'category_id', resolvePayloadId(values.category_id))
  appendFormData(formData, 'subcategory_id', resolvePayloadId(values.subcategory_id))
  appendFormData(formData, 'brand_id', resolvePayloadId(values.brand_id))
  appendFormData(formData, 'condition', values.condition)
  appendFormData(
    formData,
    'fulfillment_channel',
    values.fulfillment_channel || DEFAULT_PRODUCT_FULFILLMENT_CHANNEL,
  )
  appendFormData(formData, 'is_active', values.status === 'active' ? true : Boolean(values.is_active))
  appendFormData(formData, 'status', values.status)
  appendRootPricingFields(formData, values)
  appendFormData(formData, 'quantity', Number(values.quantity))
  appendFormData(formData, 'low_stock_threshold', toNumberOrNull(values.low_stock_threshold))
  appendFormData(formData, 'barcode', values.barcode?.trim() || null)
  appendFormData(formData, 'tags', values.tags ?? [])
  appendKeyDetailsStringsToFormData(formData, values.key_details)
  appendMetadata(formData, metadata)
  appendFormData(formData, 'shipping', {
    weight: toMoneyOrNull(values.shipping_weight),
    length: toMoneyOrNull(values.shipping_length),
    width: toMoneyOrNull(values.shipping_width),
    height: toMoneyOrNull(values.shipping_height),
  })
  appendPresignedImagesToFormData(formData, mediaImages.product_images, 'product_images', {
    includePrimary: true,
  })
  appendPresignedImagesToFormData(formData, mediaImages.description_images, 'description_images', {
    includePrimary: true,
  })

  if (variations.length > 0) {
    appendPresignedVariationsToFormData(formData, variations)
  }

  return formData
}

function appendPutMethodOverride(formData) {
  formData.append('_method', 'PUT')
}

export function buildProductInfoPayload(values, mainImage, subImages = [], options = {}) {
  const formData = buildProductPayload(values, mainImage, subImages, {
    ...options,
    mode: options.mode ?? 'edit',
    includeVariations: false,
    descriptiveImages: options.descriptiveImages ?? [],
  })

  appendPutMethodOverride(formData)

  return formData
}

export function isPersistedVariantId(variantId) {
  if (!variantId) return false

  const id = String(variantId)
  return !id.startsWith('val-') && !id.startsWith('var-')
}

export function iterateVariantFormEntries(variations = []) {
  const entries = []

  for (const variation of variations ?? []) {
    for (const variantValue of variation.values ?? []) {
      entries.push({ variation, variantValue })
    }
  }

  return entries
}

function buildSingleVariantFormData(variantFormValues, productValues) {
  const fakeVariation = { attribute: variantFormValues.attribute ?? '' }
  const fakeVariantValue = {
    value: variantFormValues.value,
    variant_name: variantFormValues.variant_name,
    sku: variantFormValues.sku,
    price: variantFormValues.price,
    discount_price: variantFormValues.discount_price,
    quantity: variantFormValues.quantity,
    reserved_quantity: variantFormValues.reserved_quantity,
    minimum_threshold: variantFormValues.minimum_threshold,
    barcode: variantFormValues.barcode,
    barcode_type: variantFormValues.barcode_type,
    weight: variantFormValues.weight,
    length: variantFormValues.length,
    width: variantFormValues.width,
    height: variantFormValues.height,
    description: variantFormValues.description,
    has_compatible_models: variantFormValues.has_compatible_models,
    compatible_models: variantFormValues.compatible_models,
    images: variantFormValues.images ?? [],
  }

  return {
    variationData: normalizeVariantUpdateData(
      buildSingleVariationData(fakeVariantValue, fakeVariation, productValues),
      fakeVariantValue,
      fakeVariation,
      productValues,
    ),
    normalizedImages: buildVariantImagesPayload(fakeVariantValue.images, { filesOnly: false }),
    sourceImages: fakeVariantValue.images,
  }
}

export function buildSingleVariantUpdatePayload(variantFormValues, variantId, productValues) {
  assertVariantImagesPresent(
    variantFormValues,
    { attribute: variantFormValues.attribute ?? '' },
    { mode: 'edit' },
  )

  const { variationData, normalizedImages, sourceImages } = buildSingleVariantFormData(
    variantFormValues,
    productValues,
  )
  const formData = new FormData()

  appendPutMethodOverride(formData)
  appendSingleVariationFields(formData, variationData)
  appendVariantImagesToFormData(formData, normalizedImages, {
    mode: 'edit',
    sourceImages,
    prefix: 'images',
    keepImageIdsPrefix: '',
  })

  if (import.meta.env.DEV) {
    console.log(`[edit variant ${variantId}] FormData payload:`, formatProductPayloadSample(formData))
  }

  return formData
}

export function buildSingleVariantCreatePayload(variantFormValues, productId, productValues) {
  assertVariantImagesPresent(
    variantFormValues,
    { attribute: variantFormValues.attribute ?? '' },
    { mode: 'create' },
  )

  const { variationData, normalizedImages } = buildSingleVariantFormData(
    variantFormValues,
    productValues,
  )
  const formData = new FormData()

  appendFormData(formData, 'product_id', productId)
  appendSingleVariationFields(formData, variationData)
  normalizedImages.forEach((image, index) => {
    if (!isFileValue(image.file)) return
    formData.append(`images[${index}][image_url]`, image.file, image.file.name)
    formData.append(`images[${index}][sort_order]`, String(image.sort_order))
    formData.append(`images[${index}][is_primary]`, image.is_primary ? '1' : '0')
  })

  if (import.meta.env.DEV) {
    console.log('[add variant] FormData payload:', formatProductPayloadSample(formData))
  }

  return formData
}

export function buildProductVariationsUpdatePayload(productValues) {
  const entries = iterateVariantFormEntries(productValues.variations).filter(
    ({ variantValue }) => Boolean(variantValue.value?.trim()),
  )
  const formData = new FormData()

  appendPutMethodOverride(formData)

  entries.forEach(({ variation, variantValue }, index) => {
    assertVariantImagesPresent(variantValue, variation, { mode: 'edit' })

    const keyPrefix = `variations[${index}]`
    const variationData = normalizeVariantUpdateData(
      buildSingleVariationData(variantValue, variation, productValues),
      variantValue,
      variation,
      productValues,
    )
    const normalizedImages = buildVariantImagesPayload(variantValue.images ?? [], { filesOnly: false })

    if (isPersistedVariantId(variantValue.id)) {
      appendFormData(formData, `${keyPrefix}[product_variant_id]`, String(variantValue.id))
    }

    appendSingleVariationFields(formData, variationData, keyPrefix)
    appendVariantImagesToFormData(formData, normalizedImages, {
      mode: 'edit',
      sourceImages: variantValue.images ?? [],
      prefix: `${keyPrefix}[images]`,
      keepImageIdsPrefix: keyPrefix,
    })
  })

  return formData
}

export function buildVariantUpdatePayload(variantValue, variation, productValues) {
  return buildProductVariationsUpdatePayload({
    ...productValues,
    variations: [
      {
        ...variation,
        values: [variantValue],
      },
    ],
  })
}

export function buildProductVariationsPayload(values) {
  const variations = buildVariationsPayload(values.variations, values)
  const formData = new FormData()

  appendVariationFiles(formData, variations)

  return formData
}

export function buildProductStatusPayload(status) {
  const formData = new FormData()
  appendFormData(formData, 'is_active', status === 'active')
  appendFormData(formData, 'status', status)
  return formData
}
