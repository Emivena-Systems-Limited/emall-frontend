import { unwrapApiEnvelope } from './parseApiError'

export function normalizeBrandRecord(record) {
  if (!record || typeof record !== 'object') return null

  const name = record.brand_name ?? record.name ?? ''
  const slug = record.slug ?? record.brand_slug ?? ''

  if (!name || !record.id) return null

  return {
    id: record.id,
    slug: slug || name.trim().toLowerCase().replace(/\s+/g, '-'),
    name,
    isActive: record.is_active ?? record.isActive ?? true,
  }
}

export function capitalizeBrandName(name) {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function extractCreatedBrand(body) {
  const envelope = unwrapApiEnvelope(body)
  const record = envelope?.data ?? body
  if (Array.isArray(record)) return normalizeBrandRecord(record[0])
  return normalizeBrandRecord(record)
}

export function extractBrandRecords(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data

  if (Array.isArray(payload)) {
    return payload.map(normalizeBrandRecord).filter(Boolean)
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data.map(normalizeBrandRecord).filter(Boolean)
  }

  return []
}

export function getBrandPaginationMeta(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data

  if (!payload || Array.isArray(payload)) {
    return { lastPage: 1, currentPage: 1 }
  }

  return {
    lastPage: payload.last_page ?? 1,
    currentPage: payload.current_page ?? 1,
  }
}

export function extractBrandList(body) {
  return extractBrandRecords(body).filter((brand) => brand.isActive)
}

export function sortBrandsAlphabetically(brands) {
  return [...brands].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  )
}

export function toBrandSelectOptions(brands) {
  return sortBrandsAlphabetically(brands).map((brand) => ({
    value: brand.id,
    label: brand.name,
  }))
}

export function findBrandBySlug(brands, slug) {
  if (!slug) return null
  return brands.find((brand) => brand.slug === slug) ?? null
}

export function findBrandById(brands, id) {
  if (!id) return null
  return brands.find((brand) => brand.id === id) ?? null
}

export function getBrandDisplayLabel(brandId, brands) {
  if (!brandId) return null
  const match = findBrandById(brands, brandId)
  return match?.name ?? brandId
}
