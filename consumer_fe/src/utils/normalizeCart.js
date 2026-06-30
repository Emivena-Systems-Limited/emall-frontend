import { buildCartItem } from '../store/slices/cartSlice'

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.cart_items)) return value.cart_items
  return []
}

function getImage(record) {
  const product = record.product ?? record.item ?? {}
  const images = product.images ?? product.product_images ?? []
  const image = Array.isArray(images) ? images[0] : images

  if (typeof image === 'string') return image
  return firstValue(
    record.image,
    record.image_url,
    product.image,
    product.image_url,
    product.thumbnail,
    image?.url,
    image?.image_url,
    image?.image,
  )
}

export function normalizeCartItem(record) {
  const product = record.product ?? record.item ?? record
  const variant = record.variant ?? record.product_variant ?? product.variant ?? {}
  const productId = firstValue(record.product_id, product.id, product.product_id)
  const variantId = firstValue(record.product_variant_id, record.variant_id, variant.id)

  return buildCartItem({
    id: productId,
    cartItemId: firstValue(record.id, record.cart_item_id),
    productId,
    variantId,
    sku: firstValue(record.sku, variant.sku, product.sku),
    name: firstValue(product.name, product.product_name, product.title, record.name),
    title: firstValue(product.title, product.name, record.name),
    variant: firstValue(record.variant_name, variant.variant_name, variant.name, record.color, product.color),
    storage: firstValue(record.storage, record.size, variant.size, variant.sku),
    price: firstValue(record.price, record.unit_price, variant.discount_price, variant.price, product.price),
    compareAt: firstValue(record.compare_at, record.original_price, variant.price, product.original_price),
    quantity: firstValue(record.quantity, record.qty, 1),
    image: getImage(record),
    href: product.slug ? `/${product.slug}` : undefined,
    selected: firstValue(record.selected, record.is_selected, true),
    seller: firstValue(product.store?.store_name, product.store?.name, product.vendor?.name, record.store_name),
  })
}

export function extractCartItems(payload) {
  const source = payload?.cart ?? payload?.data?.cart ?? payload?.data ?? payload
  return toArray(source).map(normalizeCartItem)
}

export function buildAddToCartPayload(item) {
  return {
    product_id: item.productId,
    product_variant_id: item.variantId || undefined,
    variant_id: item.variantId || undefined,
    quantity: item.quantity,
  }
}
