import { GENERIC_BRAND_NAME, GENERIC_BRAND_SLUG } from '../constants/brands'
import { unwrapApiEnvelope } from './parseApiError'

export function normalizeBrandRecord(record) {
  if (!record || typeof record !== 'object') return null

  const name = record.brand_name ?? record.name ?? ''
  const slug = record.slug ?? record.brand_slug ?? ''
  const id = record.id ?? record.brand_id ?? null

  if (!name || id == null || id === '') return null

  return {
    id: String(id),
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

export function isGenericBrand(brandOrValue) {
  if (brandOrValue == null || brandOrValue === '') return false

  if (typeof brandOrValue === 'object') {
    const slug = String(brandOrValue.slug ?? brandOrValue.brand_slug ?? '').trim().toLowerCase()
    const name = String(
      brandOrValue.name ?? brandOrValue.brand_name ?? '',
    ).trim().toLowerCase()
    return slug === GENERIC_BRAND_SLUG || name === GENERIC_BRAND_NAME.toLowerCase()
  }

  const normalized = String(brandOrValue).trim().toLowerCase()
  return normalized === GENERIC_BRAND_SLUG || normalized === GENERIC_BRAND_NAME.toLowerCase()
}

export function findGenericBrand(brands = []) {
  return brands.find((brand) => isGenericBrand(brand)) ?? null
}

export function extractCreatedBrand(body) {
  const envelope = unwrapApiEnvelope(body)
  const record = envelope?.data ?? body

  if (Array.isArray(record)) return normalizeBrandRecord(record[0])

  const direct = normalizeBrandRecord(record)
  if (direct) return direct

  const nestedCandidates = [
    record?.brand,
    record?.data,
    record?.result,
    record?.item,
  ]

  for (const candidate of nestedCandidates) {
    if (!candidate) continue
    if (Array.isArray(candidate)) {
      const nested = normalizeBrandRecord(candidate[0])
      if (nested) return nested
      continue
    }
    const nested = normalizeBrandRecord(candidate)
    if (nested) return nested
  }

  return null
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
    return { lastPage: 1, currentPage: 1, perPage: null, total: null }
  }

  return {
    lastPage: payload.last_page ?? 1,
    currentPage: payload.current_page ?? 1,
    perPage: payload.per_page ?? null,
    total: payload.total ?? null,
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
  return sortBrandsAlphabetically(dedupeBrandRecords(brands))
    .filter((brand) => !isGenericBrand(brand))
    .map((brand) => ({
      value: String(brand.id),
      label: brand.name,
    }))
}

function dedupeBrandRecords(brands = []) {
  const byId = new Map()
  brands.forEach((brand) => {
    if (!brand?.id) return
    byId.set(String(brand.id), brand)
  })
  return [...byId.values()]
}

export function findBrandBySlug(brands, slug) {
  if (!slug) return null
  const normalized = String(slug).trim().toLowerCase()
  return brands.find((brand) => brand.slug === normalized) ?? null
}

export function findBrandById(brands, id) {
  if (!id) return null
  const normalizedId = String(id)
  return brands.find((brand) => String(brand.id) === normalizedId) ?? null
}

export function getBrandDisplayLabel(brandId, brands) {
  if (!brandId) return null

  if (typeof brandId === 'object') {
    const nestedName = String(brandId.brand_name ?? brandId.name ?? '').trim()
    if (nestedName && !isGenericBrand(brandId)) return nestedName
    return getBrandDisplayLabel(brandId.id, brands)
  }

  const match = findBrandById(brands, brandId)
  if (!match || isGenericBrand(match)) return null
  return match.name
}

/** Form shows empty when product uses the hidden Generic brand. */
export function normalizeBrandIdForForm(brandId, brands = [], brandMeta = null) {
  if (!brandId) return ''
  if (isGenericBrand(brandMeta)) return ''
  const match = findBrandById(brands, brandId)
  if (match && isGenericBrand(match)) return ''
  return String(brandId)
}

/**
 * Vendors may leave Brand empty; API still needs an id — use Generic behind the scenes.
 */
export function resolveBrandIdForSubmit(brandId, brands = []) {
  const trimmed = String(brandId ?? '').trim()
  if (trimmed) {
    const selected = findBrandById(brands, trimmed)
    if (selected && isGenericBrand(selected)) {
      return selected.id
    }
    return trimmed
  }

  const generic = findGenericBrand(brands)
  if (!generic?.id) {
    throw new Error(
      'Could not apply the default brand. Refresh the page and try again.',
    )
  }
  return generic.id
}

export function withResolvedBrandId(values, brands = []) {
  return {
    ...values,
    brand_id: resolveBrandIdForSubmit(values?.brand_id, brands),
  }
}
