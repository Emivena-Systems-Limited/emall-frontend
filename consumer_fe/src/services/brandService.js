import apiClient from '../lib/apiClient'

export const BRAND_ENDPOINTS = {
  APPROVED: '/brand/approved',
}

function assertApiSuccess(data) {
  if (!data?.in_error) return data

  const error = new Error(data.message || 'Unable to fetch brands')
  error.response = { data }
  throw error
}

function normalizeBrand(record) {
  if (!record) return null
  const slug = record.slug || record.brand_slug || ''
  const name = record.brand_name || record.name || slug
  const id = record.id || slug
  if (!id || !name) return null
  return {
    id: String(id),
    name: String(name),
    slug: String(slug || id),
  }
}

export async function getApprovedBrands({ page = 1 } = {}) {
  const { data } = await apiClient.get(BRAND_ENDPOINTS.APPROVED, {
    params: { page },
    skipAuthLogout: true,
  })
  assertApiSuccess(data)

  const payload = data?.data ?? data
  const brands = (payload?.brands ?? [])
    .map(normalizeBrand)
    .filter(Boolean)

  const pagination = payload?.pagination ?? {}

  return {
    brands,
    pagination: {
      currentPage: Number(pagination.current_page) || page,
      lastPage: Number(pagination.last_page) || 1,
      perPage: Number(pagination.per_page) || brands.length,
      total: Number(pagination.total) || brands.length,
      hasMore: Boolean(pagination.links?.next)
        || (Number(pagination.current_page) || page) < (Number(pagination.last_page) || 1),
    },
  }
}
