export function formatTicketDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) {
    return date.toLocaleDateString('en-GB', { weekday: 'short' })
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function isSupportSender(sender) {
  return sender === 'support' || sender === 'admin'
}

export function isClosedTicket(ticket) {
  return ticket.status === 'closed' || ticket.status === 'resolved' || ticket.status === 'archived'
}

export function computeTicketSummary(tickets) {
  const totalConversations = tickets.length
  const unreadMessages = tickets.reduce((sum, ticket) => sum + (ticket.unreadCount || 0), 0)
  const openCount = tickets.filter((ticket) => ticket.status === 'open' || ticket.status === 'pending').length
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const resolvedThisWeek = tickets.filter((ticket) => {
    if (ticket.status !== 'closed') return false
    return new Date(ticket.updatedAt) >= weekAgo
  }).length

  const responseTimes = tickets
    .flatMap((ticket) => ticket.messages || [])
    .filter((message, index, messages) => {
      if (!isSupportSender(message.sender)) return false
      return messages[index - 1]?.sender === 'customer'
    })
    .map((message) => {
      const ticket = tickets.find((item) => item.messages?.some((entry) => entry.id === message.id))
      const messageIndex = ticket?.messages?.findIndex((entry) => entry.id === message.id) ?? -1
      if (messageIndex <= 0) return null
      const customerMessage = ticket.messages[messageIndex - 1]
      if (customerMessage?.sender !== 'customer') return null
      return (new Date(message.sentAt) - new Date(customerMessage.sentAt)) / (1000 * 60 * 60)
    })
    .filter(Boolean)

  const avgResponseHours = responseTimes.length
    ? responseTimes.reduce((total, hours) => total + hours, 0) / responseTimes.length
    : 0

  return {
    totalConversations,
    unreadMessages,
    openCount,
    avgResponseHours,
    resolvedThisWeek,
  }
}

export function filterTickets(tickets, { search, categoryFilter }) {
  let result = [...tickets]

  if (categoryFilter === 'awaiting') {
    result = result.filter((ticket) => ticket.unreadCount > 0 && !isClosedTicket(ticket))
  } else if (categoryFilter === 'open') {
    result = result.filter((ticket) => ticket.status === 'open')
  } else if (categoryFilter === 'closed') {
    result = result.filter(isClosedTicket)
  } else {
    result = result.filter((ticket) => !isClosedTicket(ticket))
  }

  if (search.trim()) {
    const query = search.trim().toLowerCase()
    result = result.filter(
      (ticket) =>
        ticket.customerName?.toLowerCase().includes(query)
        || ticket.subject?.toLowerCase().includes(query)
        || ticket.topic?.toLowerCase().includes(query)
        || ticket.preview?.toLowerCase().includes(query)
        || ticket.orderNumber?.toLowerCase().includes(query)
        || ticket.ticketNumber?.toLowerCase().includes(query),
    )
  }

  return result
}

export function sortTicketsByUpdated(tickets) {
  return [...tickets].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export function paginateTickets(items, { page, pageSize }) {
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

export function markTicketRead(tickets, ticketId) {
  return tickets.map((ticket) => (
    ticket.id === ticketId ? { ...ticket, unreadCount: 0 } : ticket
  ))
}

export function appendTicketReply(tickets, ticketId, text) {
  const now = new Date().toISOString()
  const reply = { id: `msg-${Date.now()}`, sender: 'support', text, sentAt: now }

  return tickets.map((ticket) => {
    if (ticket.id !== ticketId) return ticket
    return {
      ...ticket,
      messages: [...(ticket.messages || []), reply],
      preview: text.slice(0, 80),
      updatedAt: now,
      status: ticket.status === 'open' ? 'pending' : ticket.status,
    }
  })
}

export function closeTicket(tickets, ticketId) {
  return tickets.map((ticket) => (
    ticket.id === ticketId ? { ...ticket, status: 'closed' } : ticket
  ))
}
