import apiClient from '../lib/apiClient'
import { BRAND_ADMIN_ENDPOINTS } from '../constants/brands'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractBrandPagination,
  extractBrandRecord,
  normalizeAdminBrand,
  normalizeAdminBrands,
  toBrandApiStatus,
} from '../utils/normalizeAdminBrands'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

export async function fetchAdminBrands({ status = '', page = 1, perPage = 20 } = {}) {
  const { data } = await apiClient.get(BRAND_ADMIN_ENDPOINTS.LIST, {
    params: {
      status: toBrandApiStatus(status),
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    },
  })
  const envelope = assertAuthEnvelope(data, 'Could not load brands.')
  const pagination = extractBrandPagination(envelope)

  return {
    brands: normalizeAdminBrands(envelope),
    pagination,
  }
}

export async function fetchAdminBrandById(brandId) {
  const { data } = await apiClient.get(BRAND_ADMIN_ENDPOINTS.byId(brandId))
  const envelope = assertAuthEnvelope(data, 'Could not load brand.')
  const brand = normalizeAdminBrand(extractBrandRecord(envelope, brandId))

  if (!brand?.id) {
    const error = new Error('Brand not found.')
    error.response = { data: envelope, status: envelope?.status_code ?? 404 }
    throw error
  }

  return brand
}

export async function createAdminBrand({ name, status }) {
  const payload = {
    brand_name: String(name ?? '').trim(),
    status: toBrandApiStatus(status) || 'approved',
  }

  const { data } = await apiClient.post(BRAND_ADMIN_ENDPOINTS.LIST, payload)
  const envelope = assertAuthEnvelope(data, 'Could not create brand.')
  const brand = normalizeAdminBrand(extractBrandRecord(envelope))

  return {
    brand,
    message: envelope?.reason || envelope?.message || 'Brand created.',
  }
}

export async function updateAdminBrand({ id, name }) {
  const payload = {
    brand_name: String(name ?? '').trim(),
  }

  const { data } = await apiClient.put(BRAND_ADMIN_ENDPOINTS.byId(id), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update brand.')
  const brand = normalizeAdminBrand(extractBrandRecord(envelope, id))

  return {
    brand: brand?.id ? brand : { id: String(id), name: payload.brand_name },
    message: envelope?.reason || envelope?.message || 'Brand updated.',
  }
}

export async function updateAdminBrandStatus({ id, status }) {
  const payload = {
    status: toBrandApiStatus(status) || 'pending_approval',
  }

  const { data } = await apiClient.patch(BRAND_ADMIN_ENDPOINTS.status(id), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update brand status.')
  const brand = normalizeAdminBrand(extractBrandRecord(envelope, id))

  return {
    brand: brand?.id ? brand : { id: String(id), status: payload.status },
    message: envelope?.reason || envelope?.message || 'Brand status updated.',
  }
}

export async function deleteAdminBrand(id) {
  const { data } = await apiClient.delete(BRAND_ADMIN_ENDPOINTS.byId(id))
  if (!data || typeof data !== 'object') {
    return {
      id: String(id),
      message: 'Brand removed.',
    }
  }

  const envelope = assertAuthEnvelope(data, 'Could not remove brand.')
  return {
    id: String(id),
    message: envelope?.reason || envelope?.message || 'Brand removed.',
  }
}
