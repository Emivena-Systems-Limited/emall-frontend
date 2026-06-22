import { unwrapApiEnvelope } from './parseApiError'

export function mapApiProductStatus(status, isActive) {
  const normalizedStatus = String(status ?? '').toLowerCase()
  const active = isActive === true || isActive === 1 || isActive === '1'

  if (normalizedStatus === 'approved' && active) return 'active'
  if (normalizedStatus === 'active' && active) return 'active'
  if (normalizedStatus === 'draft') return 'draft'
  if (!active) return 'inactive'

  return normalizedStatus === 'approved' ? 'active' : 'inactive'
}

export function getPrimaryProductImage(images = []) {
  if (!Array.isArray(images) || images.length === 0) return ''

  const primary = images.find((image) => image.is_primary === true || image.is_primary === '1' || image.is_primary === 1)
  return primary?.image_url ?? images[0]?.image_url ?? ''
}

export function extractProductRecord(body) {
  const envelope = unwrapApiEnvelope(body)
  const record = envelope?.data ?? body

  if (Array.isArray(record)) return record[0] ?? null
  if (record && typeof record === 'object' && record.id) return record

  return null
}

export function extractProductList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data

  if (Array.isArray(payload)) {
    return payload.filter((item) => item && item.id)
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data.filter((item) => item && item.id)
  }

  if (payload && payload.id) {
    return [payload]
  }

  return []
}

export function getProductPaginationMeta(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data

  if (!payload || Array.isArray(payload) || payload.id) {
    return { lastPage: 1, currentPage: 1 }
  }

  return {
    lastPage: payload.last_page ?? 1,
    currentPage: payload.current_page ?? 1,
  }
}

export function toCatalogProduct(record, context = {}) {
  if (!record?.id) return null

  const variants = Array.isArray(record.variants) ? record.variants : []
  const firstVariant = variants[0]
  const variantStock = variants.reduce(
    (total, variant) => total + (Number(variant.quantity) || 0),
    0,
  )

  return {
    id: record.id,
    name: record.name,
    slug: record.slug ?? '',
    sku: context.sku ?? firstVariant?.sku ?? '—',
    brand: context.brandName ?? record.brand?.brand_name ?? record.brand_name ?? '—',
    brandSlug: context.brandSlug ?? record.brand?.slug ?? '',
    category: context.categoryName ?? record.category?.category_name ?? record.category_name ?? '—',
    categorySlug: context.categorySlug ?? record.category?.slug ?? '',
    stock: (context.quantity ?? variantStock ?? Number(record.quantity)) || 0,
    status: mapApiProductStatus(record.status, record.is_active),
    price: Number(
      context.salePrice
      ?? firstVariant?.discount_price
      ?? firstVariant?.price
      ?? context.price
      ?? record.price
      ?? 0,
    ),
    image: getPrimaryProductImage(record.images),
    createdAt: record.created_at ?? context.createdAt ?? new Date().toISOString(),
    apiStatus: record.status ?? '',
  }
}
