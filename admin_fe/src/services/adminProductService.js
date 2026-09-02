import apiClient from '../lib/apiClient'
import { PRODUCT_ADMIN_ENDPOINTS, PRODUCT_PAGE_SIZE } from '../constants/adminProducts'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractAdminProductRecord,
  extractProductPagination,
  normalizeAdminProducts,
  toAdminCatalogProduct,
  toProductActiveParam,
  toProductApiStatus,
} from '../utils/normalizeAdminProducts'
import { extractProductRecord } from '../utils/normalizeProducts'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

export async function fetchAdminProducts({
  status = '',
  visibility = '',
  vendorId = '',
  search = '',
  page = 1,
  perPage = PRODUCT_PAGE_SIZE,
  pending = false,
} = {}) {
  const endpoint = pending ? PRODUCT_ADMIN_ENDPOINTS.PENDING : PRODUCT_ADMIN_ENDPOINTS.LIST
  const { data } = await apiClient.get(endpoint, {
    params: compactParams({
      status: pending ? '' : toProductApiStatus(status),
      is_active: toProductActiveParam(visibility),
      vendor_id: vendorId,
      search: String(search ?? '').trim(),
      page,
      per_page: perPage,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load products.')

  return {
    products: normalizeAdminProducts(envelope),
    pagination: extractProductPagination(envelope),
  }
}

export async function fetchAdminPendingProducts(params = {}) {
  return fetchAdminProducts({ ...params, pending: true, status: 'pending' })
}

export async function fetchAdminProductById(productId) {
  const { data } = await apiClient.get(PRODUCT_ADMIN_ENDPOINTS.byId(productId))
  const envelope = assertAuthEnvelope(data, 'Could not load product.')
  const record = extractAdminProductRecord(envelope, productId) ?? extractProductRecord(envelope)

  if (!record?.id) {
    const error = new Error('Product not found.')
    error.response = { data: envelope, status: envelope?.status_code ?? 404 }
    throw error
  }

  return record
}

export async function updateAdminProduct(productId, body) {
  const { data } = await apiClient.put(PRODUCT_ADMIN_ENDPOINTS.byId(productId), body)
  const envelope = assertAuthEnvelope(data, 'Could not update product.')
  const record = extractAdminProductRecord(envelope, productId) ?? extractProductRecord(envelope)

  if (record?.id) return record
  return fetchAdminProductById(productId)
}

export async function updateAdminProductStatus({ id, status, rejectionReason = '' }) {
  const payload = {
    status: toProductApiStatus(status) || 'approved',
  }
  if (payload.status === 'rejected') {
    payload.rejection_reason = String(rejectionReason ?? '').trim()
  }

  const { data } = await apiClient.patch(PRODUCT_ADMIN_ENDPOINTS.status(id), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update product status.')
  const record = extractAdminProductRecord(envelope, id) ?? extractProductRecord(envelope)

  return {
    record: record?.id ? record : await fetchAdminProductById(id),
    product: toAdminCatalogProduct(record?.id ? record : { id, status: payload.status }),
    message: envelope?.reason || envelope?.message || 'Product status updated.',
  }
}

export async function toggleAdminProductActive(productId) {
  const { data } = await apiClient.put(PRODUCT_ADMIN_ENDPOINTS.isActive(productId))
  const envelope = assertAuthEnvelope(data, 'Could not update product visibility.')
  const record = extractAdminProductRecord(envelope, productId) ?? extractProductRecord(envelope)

  if (record?.id) return record
  return fetchAdminProductById(productId)
}

export async function deleteAdminProduct(id) {
  const { data } = await apiClient.delete(PRODUCT_ADMIN_ENDPOINTS.byId(id))
  if (!data || typeof data !== 'object') {
    return { id: String(id), message: 'Product removed.' }
  }

  const envelope = assertAuthEnvelope(data, 'Could not remove product.')
  return {
    id: String(id),
    message: envelope?.reason || envelope?.message || 'Product removed.',
  }
}
