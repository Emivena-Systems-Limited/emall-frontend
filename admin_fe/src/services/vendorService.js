import apiClient from '../lib/apiClient'
import { VENDOR_ADMIN_ENDPOINTS, VENDOR_STATUS_REASON_MAX_LENGTH } from '../constants/vendors'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractVendorRecord,
  isPendingVendorQueue,
  normalizeAdminVendor,
  normalizeAdminVendors,
  toApiVendorStatus,
  toListStatusParam,
} from '../utils/normalizeAdminVendors'

const LIST_PAGE_SIZE = 20
const MAX_LIST_PAGES = 20

function getPagination(envelope) {
  const payload = envelope?.data
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    return { page: 1, lastPage: 1 }
  }

  const lastPage = Number(
    payload.last_page
      ?? payload.lastPage
      ?? payload.meta?.last_page
      ?? payload.meta?.lastPage
      ?? payload.pages
      ?? 1,
  )
  const page = Number(
    payload.current_page
      ?? payload.currentPage
      ?? payload.meta?.current_page
      ?? payload.meta?.currentPage
      ?? 1,
  )

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
  }
}

async function fetchVendorPage({ status, page }) {
  const pendingQueue = isPendingVendorQueue(status)
  const { data } = await apiClient.get(
    pendingQueue ? VENDOR_ADMIN_ENDPOINTS.PENDING : VENDOR_ADMIN_ENDPOINTS.LIST,
    {
      params: pendingQueue
        ? { page, per_page: LIST_PAGE_SIZE }
        : {
          status: toListStatusParam(status),
          page,
          per_page: LIST_PAGE_SIZE,
        },
    },
  )
  const envelope = assertAuthEnvelope(data, 'Could not load vendors.')
  return {
    vendors: normalizeAdminVendors(envelope),
    pagination: getPagination(envelope),
  }
}

export async function fetchAdminVendors({ status = '' } = {}) {
  const first = await fetchVendorPage({ status, page: 1 })
  const vendors = [...first.vendors]
  const lastPage = Math.min(first.pagination.lastPage, MAX_LIST_PAGES)

  for (let page = 2; page <= lastPage; page += 1) {
    const next = await fetchVendorPage({ status, page })
    vendors.push(...next.vendors)
  }

  return vendors
}

export async function fetchAdminVendorById(vendorId) {
  const { data } = await apiClient.get(VENDOR_ADMIN_ENDPOINTS.byId(vendorId))
  const envelope = assertAuthEnvelope(data, 'Could not load vendor.')
  const vendor = normalizeAdminVendor(extractVendorRecord(envelope, vendorId))

  if (!vendor?.id) {
    const error = new Error('Vendor not found.')
    error.response = { data: envelope, status: envelope?.status_code ?? 404 }
    throw error
  }

  return vendor
}

export async function updateAdminVendorStatus({ vendorId, status, rejectionReason }) {
  const apiStatus = toApiVendorStatus(status)
  const payload = { status: apiStatus }

  if (apiStatus === 'rejected') {
    const reason = String(rejectionReason ?? '').trim()
    if (!reason) {
      throw new Error('A rejection reason is required.')
    }
    if (reason.length > VENDOR_STATUS_REASON_MAX_LENGTH) {
      throw new Error(`Rejection reason must be ${VENDOR_STATUS_REASON_MAX_LENGTH} characters or fewer.`)
    }
    payload.rejection_reason = reason
  }

  const { data } = await apiClient.patch(VENDOR_ADMIN_ENDPOINTS.status(vendorId), payload)
  const envelope = assertAuthEnvelope(data, 'Could not update vendor status.')
  const record = envelope?.data ?? envelope
  const vendor = normalizeAdminVendor(record)

  return {
    vendor: vendor?.id
      ? vendor
      : { id: String(vendorId), status: payload.status, rejectionReason: payload.rejection_reason ?? '' },
    message: envelope?.reason || envelope?.message || 'Vendor status updated',
  }
}
