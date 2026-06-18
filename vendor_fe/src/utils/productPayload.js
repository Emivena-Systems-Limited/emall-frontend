import { readImageAsDataUri } from './readImageAsDataUri'
import { resolveSalesPrice, resolveVariantPricing, roundMoney } from './productPricing'

const SAMPLE_DATA_URI_PREFIX_LENGTH = 60

export function shortenDataUriForSample(value, prefixLength = SAMPLE_DATA_URI_PREFIX_LENGTH) {
  if (!value || typeof value !== 'string' || !value.startsWith('data:')) return value
  if (value.length <= prefixLength) return value
  return `${value.slice(0, prefixLength)}… [${value.length} chars]`
}

export function formatProductPayloadSample(payload) {
  return {
    ...payload,
    primary_image: shortenDataUriForSample(payload.primary_image),
    product_images: (payload.product_images ?? []).map((image) => ({
      ...image,
      image_url: shortenDataUriForSample(image.image_url),
    })),
    variations: (payload.variations ?? []).map((variation) => ({
      ...variation,
      images: (variation.images ?? []).map((image) => ({
        ...image,
        image_url: shortenDataUriForSample(image.image_url),
      })),
    })),
  }
}

export async function buildProductImagesPayload(mainImage, subImages = []) {
  const images = [mainImage, ...subImages].filter(Boolean)
  return Promise.all(
    images.map(async (image, index) => ({
      image_url: await readImageAsDataUri(image.file),
      sort_order: index,
      is_primary: index === 0,
    })),
  )
}

export function metadataRowsToObject(rows) {
  return rows.reduce((metadata, row) => {
    const key = row.key?.trim()
    const value = row.value?.trim()
    if (key && value) metadata[key] = value
    return metadata
  }, {})
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

function buildVariantImagesPayload(images = [], legacyImageUrl = '') {
  const normalized = Array.isArray(images) ? images : []
  if (normalized.length > 0) {
    return normalized.map((image, index) => ({
      image_url: image.preview ?? image.image_url ?? '',
      sort_order: index,
      is_primary: index === 0,
    })).filter((image) => image.image_url)
  }

  const url = legacyImageUrl?.trim()
  if (!url) return []

  return [{
    image_url: url,
    sort_order: 0,
    is_primary: true,
  }]
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
            : {},
        images: buildVariantImagesPayload(val.images, val.image_url),
      })
    }
  }

  return payload
}

export function buildProductPayload(values, productImages = []) {
  const primary_image =
    productImages.find((image) => image.is_primary)?.image_url
    ?? productImages[0]?.image_url
    ?? null

  return {
    name: values.name.trim(),
    description: values.description.trim(),
    category_slug: values.category_slug,
    subcategory_slug: values.subcategory_slug,
    brand_slug: values.brand_slug,
    status: values.status,
    tags: values.tags ?? [],
    quantity: Number(values.quantity),
    low_stock_threshold: toNumberOrNull(values.low_stock_threshold),
    barcode: values.barcode?.trim() || null,
    metadata: metadataRowsToObject(values.metadata),
    primary_image,
    product_images: productImages,
    variations: buildVariationsPayload(values.variations, values),
    shipping: {
      weight: toMoneyOrNull(values.shipping_weight),
      length: toMoneyOrNull(values.shipping_length),
      width: toMoneyOrNull(values.shipping_width),
      height: toMoneyOrNull(values.shipping_height),
    },
  }
}
