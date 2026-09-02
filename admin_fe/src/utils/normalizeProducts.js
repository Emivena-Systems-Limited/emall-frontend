import { unwrapApiEnvelope } from './parseApiError'

export function isProductActive(isActive) {
  if (isActive === true || isActive === 1 || isActive === '1') return true
  if (isActive === false || isActive === 0 || isActive === '0') return false
  return String(isActive ?? '').trim().toLowerCase() === 'true'
}

/** Catalogue visibility is driven by API `is_active`; `status` is only used for draft. */
export function mapApiProductStatus(status, isActive) {
  if (String(status ?? '').trim().toLowerCase() === 'draft') return 'draft'
  return isProductActive(isActive) ? 'active' : 'inactive'
}

function resolveImageUrl(image) {
  if (!image || typeof image !== 'object') return ''

  return image.image_url ?? image.url ?? image.image_path ?? ''
}

export function getPrimaryProductImage(images = []) {
  if (!Array.isArray(images) || images.length === 0) return ''
  if (typeof images[0] === 'string') return images.find(Boolean) || ''

  const sorted = [...images].sort(
    (left, right) => Number(left.sort_order ?? 0) - Number(right.sort_order ?? 0),
  )
  const primary = sorted.find(
    (image) => image.is_primary === true || image.is_primary === '1' || image.is_primary === 1,
  )

  return resolveImageUrl(primary) || resolveImageUrl(sorted[0]) || ''
}

export function metadataArrayToMap(metadata = []) {
  if (!Array.isArray(metadata)) return {}
  return metadata.reduce((map, item) => {
    const key = item?.key?.trim()
    if (key && item?.value != null && item?.value !== '') {
      map[key] = String(item.value)
    }
    return map
  }, {})
}

function resolveProductStock(record, variants, context, meta = {}) {
  if (context.quantity != null && context.quantity !== '') {
    return Number(context.quantity)
  }

  if (record.quantity != null && record.quantity !== '') {
    return Number(record.quantity)
  }

  const hasVariantQuantity = variants.some(
    (variant) => variant.quantity != null && variant.quantity !== '',
  )

  if (hasVariantQuantity) {
    return variants.reduce(
      (total, variant) => total + (Number(variant.quantity) || 0),
      0,
    )
  }

  if (meta.quantity != null && meta.quantity !== '') {
    return Number(meta.quantity)
  }

  return null
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

function isUsableCatalogPrice(value) {
  if (value == null || value === '') return false
  const num = Number(value)
  return Number.isFinite(num) && num > 0
}

function toCatalogMoney(value) {
  return isUsableCatalogPrice(value) ? Number(value) : null
}

function resolveNamedDiscountAmount(record = {}, fallback = {}) {
  const candidates = [
    record.discount,
    record.unit_price_discount,
    fallback.discount,
    fallback.savingsAmount,
  ]

  for (const candidate of candidates) {
    const amount = Number(candidate)
    if (Number.isFinite(amount) && amount > 0) return amount
  }

  return 0
}

/**
 * Catalog prices: `discount` is amount off the list/regular price.
 * Example: regular 7000, discount 200 → customer pays 6800.
 */
export function resolveRecordCatalogPricing(record = {}, fallback = {}) {
  const namedDiscount = resolveNamedDiscountAmount(record, fallback)
  const catalogList = toCatalogMoney(
    record.regular_price
    ?? record.price
    ?? fallback.listPrice
    ?? fallback.paidPrice,
  ) ?? 0
  const catalogSale = toCatalogMoney(
    record.regular_discount_price
    ?? record.discounted_price
    ?? record.discount_price
    ?? fallback.salePrice,
  )

  if (namedDiscount > 0 && catalogList > namedDiscount) {
    const derivedSale = catalogList - namedDiscount
    if (catalogSale != null && catalogSale > 0 && catalogSale < catalogList) {
      const saleAgreesWithDiscount = Math.abs(catalogSale - derivedSale) < 0.05
      return {
        listPrice: catalogList,
        salePrice: saleAgreesWithDiscount ? catalogSale : derivedSale,
        discountAmount: namedDiscount,
      }
    }

    return {
      listPrice: catalogList,
      salePrice: derivedSale,
      discountAmount: namedDiscount,
    }
  }

  if (catalogSale != null && catalogList > catalogSale) {
    return {
      listPrice: catalogList,
      salePrice: catalogSale,
      discountAmount: catalogList - catalogSale,
    }
  }

  const listPrice = catalogList
  return {
    listPrice,
    salePrice: listPrice,
    discountAmount: 0,
  }
}

function resolveCatalogPricing(record, firstVariant, context, meta = {}) {
  const productPricing = resolveRecordCatalogPricing(record, {
    paidPrice: toCatalogMoney(context.price),
    listPrice: toCatalogMoney(context.price),
    salePrice: toCatalogMoney(context.salePrice),
    discount: toCatalogMoney(meta.savings_amount),
    savingsAmount: toCatalogMoney(meta.savings_amount),
  })

  if (productPricing.discountAmount > 0 || !firstVariant) {
    return productPricing
  }

  return resolveRecordCatalogPricing(firstVariant, {
    paidPrice: productPricing.salePrice,
    listPrice: productPricing.listPrice,
    salePrice: productPricing.salePrice,
    discount: productPricing.discountAmount,
  })
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
    return {
      lastPage: 1,
      currentPage: 1,
      total: Array.isArray(payload) ? payload.length : payload?.id ? 1 : 0,
    }
  }

  return {
    lastPage: Number(payload.last_page ?? payload.lastPage ?? 1),
    currentPage: Number(payload.current_page ?? payload.currentPage ?? 1),
    total: payload.total == null ? null : Number(payload.total),
  }
}

export function toCatalogProduct(record, context = {}) {
  if (!record?.id) return null

  const variants = Array.isArray(record.variants) ? record.variants : []
  const firstVariant = variants[0]
  const categoryRecord = resolveCategoryRecord(record)
  const subcategoryRecord = resolveSubcategoryRecord(record)
  const meta = metadataArrayToMap(record.metadata)
  const brandName = resolveBrandName(record, context)

  const pricing = resolveCatalogPricing(record, firstVariant, context, meta)
  const regularPrice = pricing.listPrice
  const salePrice = pricing.salePrice
  const hasDiscount = pricing.discountAmount > 0 && salePrice > 0 && salePrice < regularPrice

  return {
    id: record.id,
    name: record.name,
    slug: record.slug ?? '',
    sku: context.sku ?? record.sku ?? meta.sku ?? firstVariant?.sku ?? '—',
    brandId: resolveBrandId(record),
    brand: brandName || '—',
    brandSlug: resolveBrandSlug(record, context),
    category: formatCatalogCategoryLabel(record, context),
    categorySlug: context.categorySlug ?? categoryRecord?.slug ?? '',
    subcategory: subcategoryRecord?.category_name ?? subcategoryRecord?.name ?? '',
    subcategorySlug: subcategoryRecord?.slug ?? '',
    stock: resolveProductStock(record, variants, context, meta),
    lowStockThreshold: meta.low_stock_threshold ? Number(meta.low_stock_threshold) : null,
    barcode: meta.barcode ?? record.barcode ?? firstVariant?.barcode ?? null,
    status: mapApiProductStatus(record.status, record.is_active),
    regularPrice,
    salePrice,
    listPrice: regularPrice,
    price: salePrice,
    hasDiscount,
    discountPercent: hasDiscount
      ? ((regularPrice - salePrice) / regularPrice) * 100
      : 0,
    savingsAmount: hasDiscount ? pricing.discountAmount : 0,
    shippingWeight: meta.shipping_weight ? Number(meta.shipping_weight) : null,
    shippingLength: meta.shipping_length ? Number(meta.shipping_length) : null,
    shippingWidth: meta.shipping_width ? Number(meta.shipping_width) : null,
    shippingHeight: meta.shipping_height ? Number(meta.shipping_height) : null,
    fulfillmentChannel: record.fulfillment_channel ?? 'vendor',
    tags: Array.isArray(record.tags) ? record.tags : [],
    description: record.description ?? '',
    images: Array.isArray(record.images) ? record.images : [],
    variants,
    metadata: Array.isArray(record.metadata) ? record.metadata : [],
    image: getPrimaryProductImage(record.images),
    createdAt: record.created_at ?? context.createdAt ?? null,
    apiStatus: record.status ?? '',
  }
}
