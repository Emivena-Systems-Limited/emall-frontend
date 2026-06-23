import {
  convertDiscountAmountToPercent,
  getDiscountSummary,
  resolveSalesPrice,
  resolveVariantPricing,
  roundMoney,
} from './productPricing'
import { DEFAULT_PRODUCT_FULFILLMENT_CHANNEL } from '../constants/products'

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

function buildVariantImagesPayload(images = []) {
  return (Array.isArray(images) ? images : [])
    .map((image, index) => {
      const file = resolveImageFile(image)
      if (!file) return null

      return {
        file,
        sort_order: index,
        is_primary: index === 0,
      }
    })
    .filter(Boolean)
}

function buildVariationsPayload(variations, values) {
  const payload = []

  for (const variation of variations ?? []) {
    const attributeKey = slugifyAttributeKey(variation.attribute ?? '')
    for (const val of variation.values ?? []) {
      const pricing = resolveVariantPricing(val, values)
      const attributeValue = val.value?.trim()

      payload.push({
        variant_name: val.variant_name?.trim() || attributeValue || null,
        quantity: toNumberOrNull(val.quantity) ?? 0,
        reserved_quantity: toNumberOrNull(val.reserved_quantity),
        low_stock_threshold: toNumberOrNull(val.low_stock_threshold),
        barcode: val.barcode?.trim() || null,
        price: pricing.listPrice,
        discount_price: pricing.salePrice,
        sku: val.sku?.trim() || null,
        attributes:
          attributeKey && attributeValue
            ? { [attributeKey]: attributeValue.toLowerCase() }
            : null,
        images: buildVariantImagesPayload(val.images),
      })
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
      formData.append(`product_images[${index}][image_url]`, image.file, image.file.name)
    } else if (image.remoteId) {
      formData.append(`product_images[${index}][id]`, image.remoteId)
    } else if (image.imageUrl) {
      formData.append(`product_images[${index}][image_url]`, image.imageUrl)
    }

    formData.append(`product_images[${index}][sort_order]`, String(image.sort_order))
    formData.append(`product_images[${index}][is_primary]`, image.is_primary ? '1' : '0')
  })
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

function appendVariationFiles(formData, variations) {
  variations.forEach((variation, variationIndex) => {
    Object.entries(variation).forEach(([field, value]) => {
      if (field === 'images' || field === 'attributes') return
      appendFormData(formData, `variations[${variationIndex}][${field}]`, value)
    })

    if (variation.attributes && Object.keys(variation.attributes).length > 0) {
      appendFormData(formData, `variations[${variationIndex}][attributes]`, variation.attributes)
    }

    variation.images.forEach((image, imageIndex) => {
      formData.append(
        `variations[${variationIndex}][images][${imageIndex}][image_url]`,
        image.file,
        image.file.name,
      )
      formData.append(
        `variations[${variationIndex}][images][${imageIndex}][sort_order]`,
        String(image.sort_order),
      )
      formData.append(
        `variations[${variationIndex}][images][${imageIndex}][is_primary]`,
        image.is_primary ? '1' : '0',
      )
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
  const { mode = 'create' } = options
  const productImages = validateProductImageFiles(mainImage, subImages, { mode })
  const primaryImage = productImages.find((image) => image.is_primary) ?? productImages[0]
  const primaryFile = primaryImage?.file
  const variations = buildVariationsPayload(values.variations, values)
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

  if (isFileValue(primaryFile)) {
    formData.append('primary_image', primaryFile, primaryFile.name)
  } else if (mode === 'edit' && primaryImage?.remoteId) {
    appendFormData(formData, 'primary_image_id', primaryImage.remoteId)
  }

  appendProductImageFiles(formData, productImages)
  appendVariationFiles(formData, variations)

  return formData
}
