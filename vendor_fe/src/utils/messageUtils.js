import { SORT_DIRECTIONS, SORT_FIELDS } from '../constants/messages'

export function formatMessageDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) {
    return date.toLocaleDateString('en-GB', { weekday: 'short' })
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function formatFullDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

export function computeMessagesSummary(conversations) {
  const totalConversations = conversations.length
  const unreadMessages = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  const openCount = conversations.filter((c) => c.status === 'open' || c.status === 'pending').length
  const resolvedThisWeek = conversations.filter((c) => {
    if (c.status !== 'resolved') return false
    const updated = new Date(c.updatedAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return updated >= weekAgo
  }).length

  const responseTimes = conversations
    .flatMap((c) => c.messages || [])
    .filter((m, i, arr) => {
      if (m.sender !== 'vendor') return false
      const prev = arr[i - 1]
      return prev?.sender === 'customer'
    })
    .map((m, i, vendorReplies) => {
      const conv = conversations.find((c) => c.messages?.some((msg) => msg.id === m.id))
      const msgIndex = conv?.messages?.findIndex((msg) => msg.id === m.id) ?? -1
      if (msgIndex <= 0) return null
      const customerMsg = conv.messages[msgIndex - 1]
      if (customerMsg?.sender !== 'customer') return null
      return (new Date(m.sentAt) - new Date(customerMsg.sentAt)) / (1000 * 60 * 60)
    })
    .filter(Boolean)

  const avgResponseHours = responseTimes.length
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0

  return {
    totalConversations,
    unreadMessages,
    openCount,
    avgResponseHours,
    resolvedThisWeek,
  }
}

export function filterConversations(conversations, { search, categoryFilter }) {
  let result = [...conversations]

  if (categoryFilter === 'unread') {
    result = result.filter((c) => c.unreadCount > 0)
  } else if (categoryFilter === 'archived') {
    result = result.filter((c) => c.status === 'archived')
  } else if (categoryFilter !== 'all') {
    result = result.filter((c) => c.category === categoryFilter && c.status !== 'archived')
  } else {
    result = result.filter((c) => c.status !== 'archived')
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    result = result.filter(
      (c) =>
        c.customerName?.toLowerCase().includes(q)
        || c.subject?.toLowerCase().includes(q)
        || c.preview?.toLowerCase().includes(q)
        || c.orderNumber?.toLowerCase().includes(q)
        || c.productName?.toLowerCase().includes(q),
    )
  }

  return result
}

export function sortConversations(conversations, field, direction) {
  const dir = direction === SORT_DIRECTIONS.asc ? 1 : -1
  return [...conversations].sort((a, b) => {
    switch (field) {
      case SORT_FIELDS.unread:
        return (a.unreadCount - b.unreadCount) * dir
      case SORT_FIELDS.customer:
        return a.customerName.localeCompare(b.customerName) * dir
      case SORT_FIELDS.updated:
      default:
        return (new Date(a.updatedAt) - new Date(b.updatedAt)) * dir
    }
  })
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

export function markConversationRead(conversations, conversationId) {
  return conversations.map((c) =>
    c.id === conversationId ? { ...c, unreadCount: 0 } : c,
  )
}

export function appendMessage(conversations, conversationId, text) {
  const now = new Date().toISOString()
  const newMsg = { id: `msg-${Date.now()}`, sender: 'vendor', text, sentAt: now }

  return conversations.map((c) => {
    if (c.id !== conversationId) return c
    const messages = [...(c.messages || []), newMsg]
    return {
      ...c,
      messages,
      preview: text.slice(0, 80),
      updatedAt: now,
      status: c.status === 'resolved' ? 'open' : c.status,
    }
  })
}

export function updateConversationStatus(conversations, conversationId, status) {
  return conversations.map((c) =>
    c.id === conversationId ? { ...c, status } : c,
  )
}
