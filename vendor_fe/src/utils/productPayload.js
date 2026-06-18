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
    product_images: (payload.product_images ?? []).map((image) => ({
      ...image,
      image_url: shortenDataUriForSample(image.image_url),
    })),
    variations: (payload.variations ?? []).map((variation) => ({
      ...variation,
      values: variation.values.map((value) => ({
        ...value,
        image_url: shortenDataUriForSample(value.image_url),
      })),
    })),
  }
}

export async function buildProductImagesPayload(images = []) {
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

export function buildProductPayload(values, productImages = []) {
  return {
    name: values.name.trim(),
    sku: values.sku.trim(),
    description: values.description.trim(),
    category_slug: values.category_slug,
    subcategory_slug: values.subcategory_slug,
    brand_slug: values.brand_slug,
    status: values.status,
    tags: values.tags ?? [],
    price: roundMoney(Number(values.price)),
    discount_price: resolveSalesPrice(
      values.price,
      values.discount_mode ?? 'amount',
      values.discount_price,
      values.discount_percent,
    ),
    quantity: Number(values.quantity),
    low_stock_threshold: toNumberOrNull(values.low_stock_threshold),
    barcode: values.barcode?.trim() || null,
    metadata: metadataRowsToObject(values.metadata),
    variations: (values.variations ?? []).map((variation) => ({
      attribute: variation.attribute,
      values: variation.values.map((val) => {
        const pricing = resolveVariantPricing(val, values)
        return {
          value: val.value,
          sku: val.sku?.trim() || null,
          price: pricing.listPrice,
          discount_price: pricing.salePrice,
          quantity: toNumberOrNull(val.quantity),
          image_url: val.image_url?.trim() || null,
        }
      }),
    })),
    shipping: {
      weight: toMoneyOrNull(values.shipping_weight),
      length: toMoneyOrNull(values.shipping_length),
      width: toMoneyOrNull(values.shipping_width),
      height: toMoneyOrNull(values.shipping_height),
    },
    product_images: productImages,
  }
}
