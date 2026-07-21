import { TICKET_CATEGORIES, TICKET_PRIORITY, TICKET_STATUS } from '../constants/helpSupport'

export function formatTicketDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatRelativeDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return formatTicketDate(iso)
}

export function computeTicketsSummary(tickets) {
  const total = tickets.length
  const open = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress' || t.status === 'awaiting_reply').length
  const awaitingReply = tickets.filter((t) => t.status === 'awaiting_reply').length
  const resolved = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length
  return { total, open, awaitingReply, resolved }
}

export function filterTickets(tickets, { search, statusFilter }) {
  let result = [...tickets]

  if (statusFilter === 'active') {
    result = result.filter((t) => t.status !== 'resolved' && t.status !== 'closed')
  } else if (statusFilter === 'resolved') {
    result = result.filter((t) => t.status === 'resolved' || t.status === 'closed')
  } else if (statusFilter !== 'all') {
    result = result.filter((t) => t.status === statusFilter)
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    result = result.filter(
      (t) =>
        t.subject?.toLowerCase().includes(q)
        || t.preview?.toLowerCase().includes(q)
        || TICKET_CATEGORIES[t.category]?.toLowerCase().includes(q),
    )
  }

  return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export function paginateItems(items, { page, pageSize }) {
  const totalItems = items.length
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  return {
    items: items.slice(startIndex, endIndex),
    page: safePage,
    pageCount,
    totalItems,
    startIndex: totalItems === 0 ? 0 : startIndex + 1,
    endIndex,
  }
}

export function createSupportTicket({ subject, category, message, priority = 'normal' }) {
  const now = new Date().toISOString()
  return {
    id: `ticket-${Date.now()}`,
    subject: subject.trim(),
    category,
    status: 'open',
    priority,
    createdAt: now,
    updatedAt: now,
    lastReplyBy: 'vendor',
    preview: message.trim().slice(0, 100),
    messages: [{ id: `tm-${Date.now()}`, sender: 'vendor', text: message.trim(), sentAt: now }],
  }
}

export function appendTicketReply(tickets, ticketId, text) {
  const now = new Date().toISOString()
  const newMsg = { id: `tm-${Date.now()}`, sender: 'vendor', text, sentAt: now }

  return tickets.map((t) => {
    if (t.id !== ticketId) return t
    return {
      ...t,
      messages: [...(t.messages || []), newMsg],
      preview: text.slice(0, 100),
      updatedAt: now,
      lastReplyBy: 'vendor',
      status: t.status === 'resolved' || t.status === 'closed' ? 'open' : t.status,
    }
  })
}

export { TICKET_STATUS, TICKET_PRIORITY, TICKET_CATEGORIES }
