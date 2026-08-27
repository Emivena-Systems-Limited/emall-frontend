import { unwrapApiEnvelope } from './parseApiError'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

const SALES_BY_REGION_KEYS = [
  'regions',
  'salesByRegion',
  'total_revenue',
  'totalRevenue',
  'total_orders',
  'totalOrders',
]

function hasSalesByRegionPayload(record) {
  if (!record || typeof record !== 'object') return false
  if (Array.isArray(record)) return record.length > 0
  return SALES_BY_REGION_KEYS.some((key) => key in record)
}

function normalizeRegionItem(item) {
  if (!item || typeof item !== 'object') return null

  const name = firstValue(item.name, item.region_name, item.regionName, 'Other') || 'Other'
  const revenue = toNumber(item.revenue)
  if (revenue <= 0) return null

  const rawId = item.id ?? item.region_id ?? item.regionId
  const id = rawId == null || String(rawId).trim() === '' ? null : String(rawId)

  return {
    id,
    name,
    revenue,
    orders: toNumber(item.orders),
    percentage: toNumber(item.percentage),
  }
}

export function normalizeSalesByRegionList(raw) {
  if (!Array.isArray(raw)) return []

  return raw
    .map(normalizeRegionItem)
    .filter(Boolean)
    .sort((a, b) => b.revenue - a.revenue)
}

export function extractAnalyticsSalesByRegionPayload(body) {
  if (!body || typeof body !== 'object') return null

  if (hasSalesByRegionPayload(body) && !('in_error' in body || 'status_code' in body)) {
    return body
  }

  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  if (hasSalesByRegionPayload(payload)) return payload
  if (Array.isArray(payload?.regions)) return payload
  if (Array.isArray(payload?.data)) return payload.data

  return payload
}

export function normalizeAnalyticsSalesByRegion(record, fallbackYear) {
  const year = toNumber(record?.year, fallbackYear)

  if (!record || typeof record !== 'object') {
    return {
      currency: 'GHS',
      year,
      totalRevenue: 0,
      totalOrders: 0,
      regions: [],
    }
  }

  const regionsSource = Array.isArray(record.regions)
    ? record.regions
    : Array.isArray(record.salesByRegion)
      ? record.salesByRegion
      : Array.isArray(record)
        ? record
        : []

  const regions = normalizeSalesByRegionList(regionsSource)
  const summedRevenue = regions.reduce((sum, item) => sum + item.revenue, 0)
  const summedOrders = regions.reduce((sum, item) => sum + item.orders, 0)
  const rawTotalRevenue = record.total_revenue ?? record.totalRevenue
  const rawTotalOrders = record.total_orders ?? record.totalOrders

  return {
    currency: firstValue(record.currency, 'GHS') || 'GHS',
    year,
    totalRevenue:
      rawTotalRevenue != null && String(rawTotalRevenue).trim() !== ''
        ? toNumber(rawTotalRevenue)
        : summedRevenue,
    totalOrders:
      rawTotalOrders != null && String(rawTotalOrders).trim() !== ''
        ? toNumber(rawTotalOrders)
        : summedOrders,
    regions,
  }
}
