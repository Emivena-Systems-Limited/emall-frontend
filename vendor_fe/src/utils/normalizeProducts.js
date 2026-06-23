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

function resolveImageUrl(image) {
  if (!image || typeof image !== 'object') return ''

  return image.image_url ?? image.url ?? image.image_path ?? ''
}

export function getPrimaryProductImage(images = []) {
  if (!Array.isArray(images) || images.length === 0) return ''

  const sorted = [...images].sort(
    (left, right) => Number(left.sort_order ?? 0) - Number(right.sort_order ?? 0),
  )
  const primary = sorted.find(
    (image) => image.is_primary === true || image.is_primary === '1' || image.is_primary === 1,
  )

  return resolveImageUrl(primary) || resolveImageUrl(sorted[0]) || ''
}

function resolveProductStock(record, variants, context) {
  if (context.quantity != null && context.quantity !== '') {
    return Number(context.quantity)
  }

  if (record.quantity != null && record.quantity !== '') {
    return Number(record.quantity)
  }

  const hasVariantQuantity = variants.some(
    (variant) => variant.quantity != null && variant.quantity !== '',
  )

  if (!hasVariantQuantity) return null

  return variants.reduce(
    (total, variant) => total + (Number(variant.quantity) || 0),
    0,
  )
}

function slugifyLabel(value = '') {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function resolveNestedBrand(record) {
  if (record?.brand && typeof record.brand === 'object') {
    return record.brand
  }

  if (record?.brand_id && typeof record.brand_id === 'object' && record.brand_id.id) {
    return record.brand_id
  }

  return null
}

export function resolveBrandId(record) {
  const brand = resolveNestedBrand(record)
  if (brand?.id) return brand.id
  if (typeof record?.brand_id === 'string') return record.brand_id
  return ''
}

function resolveBrandName(record, context = {}) {
  const brand = resolveNestedBrand(record)

  return (
    context.brandName
    ?? brand?.brand_name
    ?? brand?.name
    ?? record?.brand_name
    ?? ''
  )
}

function resolveBrandSlug(record, context = {}) {
  const brand = resolveNestedBrand(record)
  const name = resolveBrandName(record, context)

  return (
    context.brandSlug
    ?? brand?.slug
    ?? brand?.brand_slug
    ?? (name ? slugifyLabel(name) : '')
  )
}

export function resolveSubcategoryRecord(record) {
  if (record?.sub_category && typeof record.sub_category === 'object') {
    return record.sub_category
  }

  if (record?.subcategory && typeof record.subcategory === 'object') {
    return record.subcategory
  }

  return null
}

function resolveCategoryRecord(record) {
  if (record?.category && typeof record.category === 'object') {
    return record.category
  }

  if (record?.category_id && typeof record.category_id === 'object') {
    return record.category_id
  }

  return null
}

function resolveSubcategoryId(record) {
  const subcategory = resolveSubcategoryRecord(record)

  if (typeof record?.subcategory_id === 'object') {
    return record.subcategory_id?.id ?? subcategory?.id ?? ''
  }

  return record?.subcategory_id ?? subcategory?.id ?? ''
}

function formatCatalogCategoryLabel(record, context = {}) {
  const category = resolveCategoryRecord(record)
  const subcategory = resolveSubcategoryRecord(record)
  const parentName = context.categoryName ?? category?.category_name ?? category?.name ?? record?.category_name ?? '—'
  const subName = subcategory?.category_name ?? subcategory?.name ?? record?.subcategory_name ?? ''

  if (subName) return `${parentName} · ${subName}`
  return parentName
}

function resolveCatalogListPrice(record, firstVariant, context) {
  return Number(
    context.price
    ?? firstVariant?.price
    ?? record.price
    ?? 0,
  )
}
function resolveCatalogPrice(record, firstVariant, context) {
  const salePrice = context.salePrice
    ?? firstVariant?.discount_price
    ?? record.discount_price

  if (salePrice != null && salePrice !== '') {
    return Number(salePrice)
  }

  return resolveCatalogListPrice(record, firstVariant, context)
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
  const categoryRecord = resolveCategoryRecord(record)
  const subcategoryRecord = resolveSubcategoryRecord(record)
  const regularPrice = resolveCatalogListPrice(record, firstVariant, context)
  const salePrice = resolveCatalogPrice(record, firstVariant, context)
  const hasDiscount = salePrice > 0 && regularPrice > 0 && salePrice < regularPrice
  const brandName = resolveBrandName(record, context)

  return {
    id: record.id,
    name: record.name,
    slug: record.slug ?? '',
    sku: context.sku ?? firstVariant?.sku ?? record.sku ?? '—',
    brandId: resolveBrandId(record),
    brand: brandName || '—',
    brandSlug: resolveBrandSlug(record, context),
    category: formatCatalogCategoryLabel(record, context),
    categorySlug: context.categorySlug ?? categoryRecord?.slug ?? '',
    subcategory: subcategoryRecord?.category_name ?? subcategoryRecord?.name ?? '',
    subcategorySlug: subcategoryRecord?.slug ?? '',
    stock: resolveProductStock(record, variants, context),
    status: mapApiProductStatus(record.status, record.is_active),
    regularPrice,
    salePrice,
    listPrice: regularPrice,
    price: salePrice,
    hasDiscount,
    image: getPrimaryProductImage(record.images),
    createdAt: record.created_at ?? context.createdAt ?? null,
    apiStatus: record.status ?? '',
  }
}
