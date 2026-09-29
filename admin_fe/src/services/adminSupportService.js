import apiClient from '../lib/apiClient'
import { SUPPORT_ADMIN_ENDPOINTS, TICKETS_PAGE_SIZE } from '../constants/supportTickets'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractSupportTicketPagination,
  normalizeAdminSupportReply,
  normalizeAdminSupportTickets,
} from '../utils/normalizeAdminSupportTickets'

export async function fetchAdminSupportTickets({
  status = '',
  page = 1,
  perPage = TICKETS_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(SUPPORT_ADMIN_ENDPOINTS.LIST, {
    params: {
      page,
      per_page: perPage,
      status: status ?? '',
    },
  })
  const envelope = assertAuthEnvelope(data, 'Could not load customer tickets.')

  return {
    tickets: normalizeAdminSupportTickets(envelope),
    pagination: extractSupportTicketPagination(envelope),
  }
}

export async function replyToAdminSupportTicket({ ticketId, message }) {
  const { data } = await apiClient.post(SUPPORT_ADMIN_ENDPOINTS.reply(ticketId), {
    message,
  })
  const envelope = assertAuthEnvelope(data, 'Could not send this reply.')
  return normalizeAdminSupportReply(envelope)
}

export async function closeAdminSupportTicket({ ticketId }) {
  const { data } = await apiClient.post(SUPPORT_ADMIN_ENDPOINTS.close(ticketId))
  assertAuthEnvelope(data, 'Could not close this request.')
  return { ticketId }
}
