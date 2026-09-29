export const TICKET_STATUS = {
  open: { label: 'Open', tone: 'sky' },
  in_progress: { label: 'In progress', tone: 'amber' },
  pending: { label: 'Replied', tone: 'amber' },
  closed: { label: 'Closed', tone: 'slate' },
}

export const SUPPORT_TOPICS = {
  orders: 'Orders & delivery',
  returns: 'Returns & refunds',
  payments: 'Payments',
  products: 'Products & stores',
}

export const TICKET_FILTERS = {
  all: 'All',
  open: 'Open',
  in_progress: 'In progress',
  closed: 'Closed',
}

export const SUPPORT_ADMIN_ENDPOINTS = {
  LIST: '/api/support/admin/all-tickets',
  reply: (ticketId) => `/api/support/admin/reply-message/${encodeURIComponent(ticketId)}`,
  close: (ticketId) => `/api/support/admin/ticket-close/${encodeURIComponent(ticketId)}`,
}

export const TICKETS_PAGE_SIZE = 5

export function toSupportTicketStatusParam(filter) {
  if (filter === 'open' || filter === 'in_progress' || filter === 'closed') return filter
  return ''
}
