import { unwrapApiEnvelope } from './parseApiError'

const TOP_PRODUCTS_LIMIT = 6

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

const TOP_PRODUCTS_KEYS = [
  'products',
  'topProducts',
  'items',
]

function hasTopProductsPayload(record) {
  if (!record || typeof record !== 'object') return false
  if (Array.isArray(record)) return record.length > 0
  return TOP_PRODUCTS_KEYS.some((key) => key in record)
}

function normalizeProductItem(item) {
  if (!item || typeof item !== 'object') return null

  const name = firstValue(item.name, item.product_name, item.productName)
  if (!name) return null

  const rawId = item.id ?? item.product_id ?? item.productId
  const id = rawId == null || String(rawId).trim() === '' ? name : String(rawId)

  return {
    id,
    name,
    category: firstValue(item.category, item.category_name, item.categoryName, item.parent_category),
    units: toNumber(item.units ?? item.quantity ?? item.units_sold),
    revenue: toNumber(item.revenue),
    trend: toNumber(item.trend ?? item.trend_percent ?? item.trendPercent),
  }
}

export function normalizeTopProductsList(raw) {
  if (!Array.isArray(raw)) return []

  return raw
    .map(normalizeProductItem)
    .filter(Boolean)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, TOP_PRODUCTS_LIMIT)
}

export function extractAnalyticsTopProductsPayload(body) {
  if (!body || typeof body !== 'object') return null

  if (hasTopProductsPayload(body) && !('in_error' in body || 'status_code' in body)) {
    return body
  }

  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (hasTopProductsPayload(payload)) return payload
  if (Array.isArray(payload?.products)) return payload
  if (Array.isArray(payload?.data)) return payload.data

  return payload
}

export function normalizeAnalyticsTopProducts(record, fallbackYear) {
  const year = toNumber(record?.year, fallbackYear)

  if (!record || typeof record !== 'object') {
    return {
      currency: 'GHS',
      year,
      products: [],
    }
  }

  const productsSource = Array.isArray(record.products)
    ? record.products
    : Array.isArray(record.topProducts)
      ? record.topProducts
      : Array.isArray(record.items)
        ? record.items
        : Array.isArray(record)
          ? record
          : []

  return {
    currency: firstValue(record.currency, 'GHS') || 'GHS',
    year,
    products: normalizeTopProductsList(productsSource),
  }
}
