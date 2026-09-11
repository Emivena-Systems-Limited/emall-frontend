import apiClient from '../lib/apiClient'

export const SUPPORT_ENDPOINTS = {
  TOPICS: '/support/topics',
  FAQS: '/support/faqs',
  CONFIG: '/support/config',
  TICKETS: '/support/tickets',
  ticket: (ticketId) => `/support/tickets/${ticketId}`,
  replies: (ticketId) => `/support/tickets/${ticketId}/replies`,
  close: (ticketId) => `/support/tickets/${ticketId}/close`,
}

function assertApiSuccess(response) {
  if (!response?.in_error) return response
  const error = new Error(response.message || response.reason || 'Support request failed')
  error.response = { data: response }
  throw error
}

function unwrap(response) {
  assertApiSuccess(response)
  return response?.data ?? response ?? {}
}

export async function getSupportTopics() {
  const { data } = await apiClient.get(SUPPORT_ENDPOINTS.TOPICS, { skipAuthLogout: true })
  return unwrap(data)?.topics ?? []
}

export async function getSupportFaqs(params = {}) {
  const { data } = await apiClient.get(SUPPORT_ENDPOINTS.FAQS, {
    params: { page: 1, per_page: 10, ...params },
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getSupportConfig() {
  const { data } = await apiClient.get(SUPPORT_ENDPOINTS.CONFIG, { skipAuthLogout: true })
  return unwrap(data)
}

export async function getSupportTickets(params = {}) {
  const { data } = await apiClient.get(SUPPORT_ENDPOINTS.TICKETS, {
    params: { page: 1, per_page: 10, ...params },
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getSupportTicket(ticketId) {
  const { data } = await apiClient.get(SUPPORT_ENDPOINTS.ticket(ticketId), { skipAuthLogout: true })
  return unwrap(data)
}

export async function createSupportTicket(payload) {
  const { data } = await apiClient.post(SUPPORT_ENDPOINTS.TICKETS, payload, { skipAuthLogout: true })
  return unwrap(data)
}

export async function replyToSupportTicket(ticketId, message) {
  const { data } = await apiClient.post(SUPPORT_ENDPOINTS.replies(ticketId), { message }, { skipAuthLogout: true })
  return unwrap(data)
}

export async function closeSupportTicket(ticketId) {
  const { data } = await apiClient.patch(SUPPORT_ENDPOINTS.close(ticketId), {}, { skipAuthLogout: true })
  return unwrap(data)
}
