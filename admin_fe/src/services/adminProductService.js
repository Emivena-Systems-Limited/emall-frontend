import apiClient from '../lib/apiClient'
import {
  PRODUCT_ADMIN_ENDPOINTS,
  PRODUCT_PAGE_SIZE,
  VENDOR_PRODUCT_PAGE_SIZE,
} from '../constants/adminProducts'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractAdminProductRecord,
  extractProductPagination,
  normalizeAdminProducts,
  normalizeProductApprovalStatus,
  toAdminCatalogProduct,
  toProductActiveParam,
  toProductApiStatus,
} from '../utils/normalizeAdminProducts'
import { extractProductRecord } from '../utils/normalizeProducts'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

function productMatchesSearch(product, search) {
  const needle = String(search ?? '').trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    product?.name,
    product?.sku,
    product?.slug,
    product?.vendorName,
    product?.brand,
    product?.category,
  ].filter(Boolean).join(' ').toLowerCase()
  return haystack.includes(needle)
}

function applyCatalogFilters(products, pagination, { status = '', visibility = '', vendorId = '', search = '' } = {}) {
  const rows = Array.isArray(products) ? products : []
  const expectedStatus = status ? normalizeProductApprovalStatus(status) : ''
  const vendor = String(vendorId ?? '').trim()
  const needle = String(search ?? '').trim()

  const matches = rows.filter((product) => {
    if (expectedStatus && product.approvalStatus !== expectedStatus) return false
    if (visibility === 'visible' && product.isActive === false) return false
    if (visibility === 'hidden' && product.isActive !== false) return false
    if (vendor && String(product.vendorId ?? '') !== vendor) return false
    if (needle && !productMatchesSearch(product, needle)) return false
    return true
  })

  if (matches.length === rows.length) return { products: rows, pagination }

  return {
    products: matches,
    pagination: {
      ...pagination,
      total: matches.length,
      lastPage: 1,
      page: 1,
      from: matches.length ? 1 : 0,
      to: matches.length,
    },
  }
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
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load products.')
  const products = normalizeAdminProducts(envelope)
  const pagination = extractProductPagination(envelope)

  return applyCatalogFilters(products, pagination, {
    status: pending ? 'pending' : status,
    visibility,
    vendorId,
    search,
  })
}

export async function fetchAdminPendingProducts(params = {}) {
  return fetchAdminProducts({ ...params, pending: true, status: 'pending' })
}

export async function fetchAdminVendorProducts({
  vendorId,
  status = '',
  visibility = '',
  search = '',
  page = 1,
  perPage = VENDOR_PRODUCT_PAGE_SIZE,
} = {}) {
  if (!vendorId) {
    return {
      products: [],
      pagination: extractProductPagination({ data: [] }),
    }
  }

  const { data } = await apiClient.get(PRODUCT_ADMIN_ENDPOINTS.byVendor(vendorId), {
    params: compactParams({
      status: toProductApiStatus(status),
      is_active: toProductActiveParam(visibility),
      search: String(search ?? '').trim(),
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load vendor products.')
  const products = normalizeAdminProducts(envelope)
  const pagination = extractProductPagination(envelope)

  return applyCatalogFilters(products, pagination, { status, visibility, search })
}

const MAX_VENDOR_PRODUCT_PAGES = 50

export async function fetchAllAdminVendorProducts(vendorId) {
  if (!vendorId) return []

  const first = await fetchAdminVendorProducts({
    vendorId,
    page: 1,
    perPage: PRODUCT_PAGE_SIZE,
  })
  const products = [...first.products]
  const lastPage = Math.min(first.pagination.lastPage, MAX_VENDOR_PRODUCT_PAGES)

  for (let page = 2; page <= lastPage; page += 1) {
    const next = await fetchAdminVendorProducts({
      vendorId,
      page,
      perPage: PRODUCT_PAGE_SIZE,
    })
    products.push(...next.products)
  }

  return products
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
    payload.rejected_reason = String(rejectionReason ?? '').trim()
  }

  const { data } = await apiClient.patch(PRODUCT_ADMIN_ENDPOINTS.status(id), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update product status.')
  const record = extractAdminProductRecord(envelope, id) ?? extractProductRecord(envelope)

  const saved = record?.id ? record : await fetchAdminProductById(id)

  return {
    record: { ...saved, status: payload.status },
    product: toAdminCatalogProduct({ ...(saved ?? {}), id, status: payload.status }),
    message: envelope?.reason || envelope?.message || 'Product status updated.',
  }
}

export async function toggleAdminProductActive(productId, isActive) {
  const payload = { is_active: Boolean(isActive) }
  const { data } = await apiClient.put(PRODUCT_ADMIN_ENDPOINTS.isActive(productId), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update product visibility.')
  const record = extractAdminProductRecord(envelope, productId) ?? extractProductRecord(envelope)
  const next = record?.id ? record : await fetchAdminProductById(productId)

  return {
    ...next,
    is_active: payload.is_active,
  }
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
