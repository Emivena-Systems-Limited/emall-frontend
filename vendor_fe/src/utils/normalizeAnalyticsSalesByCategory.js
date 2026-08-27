import { CATEGORY_COLORS } from '../constants/analytics'
import { unwrapApiEnvelope } from './parseApiError'

const OTHER_COLOR = '#64748b'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

const SALES_BY_CATEGORY_KEYS = [
  'categories',
  'categoryBreakdown',
  'total_revenue',
  'totalRevenue',
]

function hasSalesByCategoryPayload(record) {
  if (!record || typeof record !== 'object') return false
  if (Array.isArray(record)) return record.length > 0
  return SALES_BY_CATEGORY_KEYS.some((key) => key in record)
}

function isOtherCategory(name) {
  return String(name).trim().toLowerCase() === 'other'
}

function assignCategoryColor(name, index) {
  if (isOtherCategory(name)) return OTHER_COLOR
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

function normalizeCategoryItem(item, index) {
  if (!item || typeof item !== 'object') return null

  const name = firstValue(item.name, item.category_name, item.categoryName, 'Other') || 'Other'
  const revenue = toNumber(item.revenue ?? item.value)
  if (revenue <= 0) return null

  const rawId = item.id ?? item.category_id ?? item.categoryId
  const id = rawId == null || String(rawId).trim() === '' ? null : String(rawId)

  return {
    id,
    name,
    value: revenue,
    revenue,
    percentage: toNumber(item.percentage),
    color: assignCategoryColor(name, index),
  }
}

export function normalizeSalesByCategoryList(raw) {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item, index) => normalizeCategoryItem(item, index))
    .filter(Boolean)
    .sort((a, b) => b.revenue - a.revenue)
    .map((item, index) => ({
      ...item,
      color: assignCategoryColor(item.name, index),
    }))
}

export function extractAnalyticsSalesByCategoryPayload(body) {
  if (!body || typeof body !== 'object') return null

  if (hasSalesByCategoryPayload(body) && !('in_error' in body || 'status_code' in body)) {
    return body
  }

  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (hasSalesByCategoryPayload(payload)) return payload
  if (Array.isArray(payload?.categories)) return payload
  if (Array.isArray(payload?.data)) return payload.data

  return payload
}

export function normalizeAnalyticsSalesByCategory(record, fallbackYear) {
  const year = toNumber(record?.year, fallbackYear)

  if (!record || typeof record !== 'object') {
    return {
      currency: 'GHS',
      year,
      totalRevenue: 0,
      categories: [],
    }
  }

  const categoriesSource = Array.isArray(record.categories)
    ? record.categories
    : Array.isArray(record.categoryBreakdown)
      ? record.categoryBreakdown
      : Array.isArray(record)
        ? record
        : []

  const categories = normalizeSalesByCategoryList(categoriesSource)
  const summedRevenue = categories.reduce((sum, item) => sum + item.revenue, 0)
  const rawTotalRevenue = record.total_revenue ?? record.totalRevenue

  return {
    currency: firstValue(record.currency, 'GHS') || 'GHS',
    year,
    totalRevenue:
      rawTotalRevenue != null && String(rawTotalRevenue).trim() !== ''
        ? toNumber(rawTotalRevenue)
        : summedRevenue,
    categories,
  }
}
