import {
  convertDiscountAmountToPercent,
  getDiscountSummary,
  resolveSalesPrice,
  resolveVariantPricing,
  roundMoney,
} from './productPricing'
import { DEFAULT_PRODUCT_FULFILLMENT_CHANNEL } from '../constants/products'
import { isKeptRemoteProductImage, resolveRemoteProductImageId } from './productImageUtils'

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

  for (const [key, value] of formData.entries()) {
    sample[key] = isFileValue(value) ? describeFile(value) : value
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

function buildSingleVariationData(variantValue, variation, values) {
  const attributeKey = slugifyAttributeKey(variation.attribute ?? '')
  const attributeValue = variantValue.value?.trim()
  const pricing = resolveVariantPricing(variantValue, values)

  return {
    variant_name: variantValue.variant_name?.trim() || attributeValue || null,
    quantity: toNumberOrNull(variantValue.quantity) ?? 0,
    reserved_quantity: toNumberOrNull(variantValue.reserved_quantity),
    low_stock_threshold: toNumberOrNull(variantValue.low_stock_threshold),
    barcode: variantValue.barcode?.trim() || null,
    price: pricing.listPrice,
    discount_price: pricing.salePrice,
    sku: variantValue.sku?.trim() || null,
    attributes:
      attributeKey && attributeValue
        ? { [attributeKey]: attributeValue.toLowerCase() }
        : null,
    images: buildVariantImagesPayload(variantValue.images, { filesOnly: true }),
  }
}

function buildVariationsPayload(variations, values) {
  const payload = []

  for (const variation of variations ?? []) {
    for (const val of variation.values ?? []) {
      payload.push(buildSingleVariationData(val, variation, values))
    }
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

function appendNewProductImageFiles(formData, productImages = []) {
  let newImageIndex = 0

  productImages.forEach((image) => {
    if (!isFileValue(image.file)) return

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
  })
}

function appendProductImagesToFormData(
  formData,
  productImages,
  { mode = 'create', mainImage = null, subImages = [] } = {},
) {
  const primaryImage = productImages.find((image) => image.is_primary) ?? productImages[0]
  const primaryFile = primaryImage?.file

  if (mode === 'edit') {
    appendKeepImageIds(formData, collectKeepImageIds(mainImage, subImages))

    if (isFileValue(primaryFile)) {
      formData.append('primary_image', primaryFile, primaryFile.name)
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
  if (!metadata.length) return

  metadata.forEach((item, index) => {
    if (item && typeof item === 'object') {
      Object.entries(item).forEach(([childKey, childValue]) => {
        appendFormData(formData, `metadata[${index}][${childKey}]`, childValue)
      })
      return
    }

    appendFormData(formData, `metadata[${index}]`, item)
  })
}

function metadataEntry(key, value) {
  if (value === null || value === undefined || value === '') return null
  return { key, value: String(value) }
}

function buildPricingMetadata(values) {
  const discountMode = values.discount_mode ?? 'amount'
  const listPrice = roundMoney(Number(values.price))
  const { salesPrice, savings, percentOff, hasDiscount } = getDiscountSummary(
    values.price,
    discountMode,
    values.discount_price,
    values.discount_percent,
  )

  const enteredDiscountPercent = values.discount_percent
  const enteredDiscountPrice = values.discount_price
  const computedPercent = hasDiscount && discountMode === 'amount'
    ? convertDiscountAmountToPercent(values.price, enteredDiscountPrice)
    : ''
  const resolvedPercent = enteredDiscountPercent || computedPercent || (hasDiscount ? String(percentOff) : '')

  const entries = [
    metadataEntry('regular_price', listPrice || values.price),
    metadataEntry('discount_mode', discountMode),
    metadataEntry('discount_price', enteredDiscountPrice),
    metadataEntry('discount_percent', resolvedPercent),
    metadataEntry('sale_price', salesPrice ?? listPrice),
    metadataEntry('percent_off', hasDiscount ? percentOff : null),
    metadataEntry('savings_amount', hasDiscount ? savings : null),
    metadataEntry('has_discount', hasDiscount ? '1' : '0'),
    metadataEntry('quantity', values.quantity),
    metadataEntry('low_stock_threshold', values.low_stock_threshold),
    metadataEntry('barcode', values.barcode?.trim()),
    metadataEntry('sku', values.sku?.trim()),
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

function mergeProductMetadata(values) {
  const pricingMetadata = buildPricingMetadata(values)
  const shippingMetadata = buildShippingMetadata(values)
  const reservedKeys = new Set([
    ...pricingMetadata.map((item) => item.key),
    ...shippingMetadata.map((item) => item.key),
  ])
  const customMetadata = Array.isArray(values.metadata)
    ? values.metadata
      .filter((item) => item?.key?.trim() && item?.value != null && item?.value !== '')
      .map((item) => ({ key: item.key.trim(), value: String(item.value).trim() }))
      .filter((item) => !reservedKeys.has(item.key))
    : []

  return [...pricingMetadata, ...shippingMetadata, ...customMetadata]
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

  return {
    ...variationData,
    variant_name:
      variationData.variant_name
      || attributeValue
      || variantValue.sku?.trim()
      || productValues.sku?.trim()
      || 'Variant',
    quantity: variationData.quantity ?? 0,
    reserved_quantity: variationData.reserved_quantity ?? 0,
    low_stock_threshold:
      variationData.low_stock_threshold
      ?? toNumberOrNull(productValues.low_stock_threshold)
      ?? 1,
    barcode: variationData.barcode || productValues.barcode?.trim() || '',
    price: variationData.price ?? toNumberOrNull(productValues.price) ?? 0,
    discount_price: variationData.discount_price ?? variationData.price ?? toNumberOrNull(productValues.price) ?? 0,
    sku: variationData.sku || productValues.sku?.trim() || '',
    attributes,
  }
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
  variations.forEach((variation, variationIndex) => {
    const keyPrefix = `variations[${variationIndex}]`
    appendSingleVariationFields(formData, variation, keyPrefix)
    appendVariantImagesToFormData(formData, variation.images, {
      mode: 'create',
      prefix: `${keyPrefix}[images]`,
    })
  })
}

export function validateProductImageFiles(mainImage, subImages = [], options = {}) {
  const { mode = 'create' } = options
  const productImages = buildProductImagesPayload(mainImage, subImages)

  if (productImages.length === 0) {
    throw new Error('Main product image is required. Upload a JPG or PNG file and try again.')
  }

  productImages.forEach((image, index) => {
    if (mode === 'edit' && !image.file && (image.remoteId || image.imageUrl)) {
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
  const { mode = 'create', includeVariations = true } = options
  const productImages = validateProductImageFiles(mainImage, subImages, { mode })
  const variations = includeVariations
    ? buildVariationsPayload(values.variations, values)
    : []
  const metadata = mergeProductMetadata(values)
  const tags = values.tags ?? []
  const listPrice = roundMoney(Number(values.price))
  const salePrice = resolveSalesPrice(
    values.price,
    values.discount_mode ?? 'amount',
    values.discount_price,
    values.discount_percent,
  )

  const formData = new FormData()

  appendFormData(formData, 'name', values.name.trim())
  appendFormData(formData, 'sku', values.sku.trim())
  appendFormData(formData, 'description', values.description.trim())
  appendFormData(formData, 'category_id', values.category_id)
  appendFormData(formData, 'subcategory_id', values.subcategory_id)
  appendFormData(formData, 'brand_id', values.brand_id)
  appendFormData(
    formData,
    'fulfillment_channel',
    values.fulfillment_channel || DEFAULT_PRODUCT_FULFILLMENT_CHANNEL,
  )
  appendFormData(formData, 'is_active', values.status === 'active' ? true : Boolean(values.is_active))
  appendFormData(formData, 'status', values.status)
  appendFormData(formData, 'price', listPrice)
  if (salePrice != null) {
    appendFormData(formData, 'discount_price', salePrice)
  }
  appendFormData(formData, 'quantity', Number(values.quantity))
  appendFormData(formData, 'low_stock_threshold', toNumberOrNull(values.low_stock_threshold))
  appendFormData(formData, 'barcode', values.barcode?.trim() || null)

  appendFormData(formData, 'tags', tags)
  appendMetadata(formData, metadata)
  appendFormData(formData, 'shipping', {
    weight: toMoneyOrNull(values.shipping_weight),
    length: toMoneyOrNull(values.shipping_length),
    width: toMoneyOrNull(values.shipping_width),
    height: toMoneyOrNull(values.shipping_height),
  })

  appendProductImagesToFormData(formData, productImages, { mode, mainImage, subImages })

  if (includeVariations) {
    appendVariationFiles(formData, variations)
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
    low_stock_threshold: variantFormValues.low_stock_threshold,
    barcode: variantFormValues.barcode,
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
