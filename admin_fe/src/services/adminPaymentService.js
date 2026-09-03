import apiClient from '../lib/apiClient'
import { PAYMENT_ADMIN_ENDPOINTS, PAYMENT_PAGE_SIZE, toPaymentStatusParam } from '../constants/payments'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractPaymentPagination,
  normalizeAdminPaymentDetail,
  normalizeAdminPayments,
  normalizePaymentStats,
} from '../utils/normalizeAdminPayments'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

export async function fetchAdminPayments({
  status = '',
  search = '',
  page = 1,
  perPage = PAYMENT_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(PAYMENT_ADMIN_ENDPOINTS.LIST, {
    params: compactParams({
      payment_status: toPaymentStatusParam(status),
      search: String(search ?? '').trim(),
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load payments.')

  return {
    items: normalizeAdminPayments(envelope),
    pagination: extractPaymentPagination(envelope),
  }
}

export async function fetchAdminPaymentStats() {
  const { data } = await apiClient.get(PAYMENT_ADMIN_ENDPOINTS.STATS)
  const envelope = assertAuthEnvelope(data, 'Could not load payment stats.')
  return normalizePaymentStats(envelope)
}

export async function fetchAdminPaymentById(paymentId) {
  const { data } = await apiClient.get(PAYMENT_ADMIN_ENDPOINTS.byId(paymentId))
  const envelope = assertAuthEnvelope(data, 'Could not load this payment.')
  const item = normalizeAdminPaymentDetail(envelope, paymentId)

  if (!item?.id) {
    const error = new Error('Payment not found.')
    error.response = { data: envelope, status: envelope?.status_code ?? 404 }
    throw error
  }

  return item
}

async function readUpdatedPayment(envelope, paymentId) {
  const item = normalizeAdminPaymentDetail(envelope, paymentId)
  if (item?.id) return item
  return fetchAdminPaymentById(paymentId)
}

export async function updateAdminPaymentStatus({ id, paymentStatus }) {
  const { data } = await apiClient.patch(
    PAYMENT_ADMIN_ENDPOINTS.status(id),
    { payment_status: toPaymentStatusParam(paymentStatus) || paymentStatus },
  )
  const envelope = assertAuthEnvelope(data, 'Could not update payment status.')
  const item = await readUpdatedPayment(envelope, id)

  return {
    item,
    message: envelope?.reason || envelope?.message || 'Payment status updated.',
  }
}

export async function refundAdminPayment({ id, reason }) {
  const { data } = await apiClient.post(
    PAYMENT_ADMIN_ENDPOINTS.refund(id),
    { reason: String(reason ?? '').trim() },
  )
  const envelope = assertAuthEnvelope(data, 'Could not issue this refund.')
  const item = await readUpdatedPayment(envelope, id)

  return {
    item,
    message: envelope?.reason || envelope?.message || 'Refund issued.',
  }
}
