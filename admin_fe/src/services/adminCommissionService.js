import apiClient from '../lib/apiClient'
import { FINANCE_PAGE_SIZE } from '../constants/finance'
import { PAYMENT_ADMIN_ENDPOINTS } from '../constants/payments'
import { assertAuthEnvelope } from '../utils/parseApiError'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null),
  )
}

function payloadOf(envelope) {
  const data = envelope?.data
  if (data && typeof data === 'object') return data
  return envelope
}

function extractCommissionRecords(envelope) {
  const payload = payloadOf(envelope)
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.commissions)) return payload.commissions
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function extractCommissionPagination(envelope, { page, perPage }) {
  const payload = payloadOf(envelope)
  const meta = payload?.meta && typeof payload.meta === 'object' ? payload.meta : payload
  const lastPage = Number(meta?.last_page ?? meta?.lastPage ?? 1)
  const currentPage = Number(meta?.current_page ?? meta?.currentPage ?? page)
  const total = Number(meta?.total)
  const size = Number(meta?.per_page ?? meta?.perPage ?? perPage)

  return {
    page: Number.isFinite(currentPage) && currentPage > 0 ? currentPage : page,
    totalPages: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    perPage: Number.isFinite(size) && size > 0 ? size : perPage,
    total: Number.isFinite(total) && total >= 0 ? total : null,
  }
}

export async function fetchAdminCommissions({
  search = '',
  vendorId = '',
  status = '',
  from = '',
  to = '',
  page = 1,
  perPage = FINANCE_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(PAYMENT_ADMIN_ENDPOINTS.COMMISSIONS, {
    params: compactParams({
      search: String(search ?? '').trim(),
      vendorId,
      status,
      from_date: from,
      to_date: to,
      page,
      perPage,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load commissions.')
  const records = extractCommissionRecords(envelope).filter((item) => item && typeof item === 'object')

  return {
    records,
    pagination: extractCommissionPagination(envelope, { page, perPage }),
  }
}
