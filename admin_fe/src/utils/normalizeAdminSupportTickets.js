import { TICKETS_PAGE_SIZE } from '../constants/supportTickets'
import { unwrapApiEnvelope } from './parseApiError'
import { composeFullName } from './profileUtils'

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function firstText(...values) {
  for (const value of values) {
    if (value == null || isRecord(value) || Array.isArray(value)) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

function toRecordList(value) {
  return Array.isArray(value) ? value.filter((item) => isRecord(item)) : []
}

export function extractSupportTicketList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []

  const lists = [
    payload.support_tickets?.data,
    payload.tickets?.data,
    payload.data,
    payload.tickets,
    payload.support_tickets,
    payload.records,
  ]

  for (const list of lists) {
    const records = toRecordList(list)
    if (records.length) return records
  }

  return []
}

function pickPaginationSource(payload) {
  if (!isRecord(payload) || Array.isArray(payload)) return {}
  const nestedTickets = isRecord(payload.tickets) && !Array.isArray(payload.tickets) ? payload.tickets : {}
  const nestedList = isRecord(payload.support_tickets) && !Array.isArray(payload.support_tickets)
    ? payload.support_tickets
    : {}
  const summary = isRecord(payload.pagination) ? payload.pagination : {}
  const meta = isRecord(payload.meta) ? payload.meta : {}
  return { ...payload, ...nestedList, ...nestedTickets, ...meta, ...summary }
}

export function extractSupportTicketPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractSupportTicketList(body)
  const source = pickPaginationSource(payload)
  const page = Number(source.current_page ?? source.currentPage ?? source.page ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? TICKETS_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : TICKETS_PAGE_SIZE
  const total = Number(source.total ?? list.length)
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : list.length
  const inferredLastPage = Math.max(1, Math.ceil((safeTotal || 1) / safePerPage))
  const lastPage = Number(source.last_page ?? source.lastPage ?? inferredLastPage)
  const inferredFrom = list.length ? (safePage - 1) * safePerPage + 1 : 0
  const inferredTo = list.length ? inferredFrom + list.length - 1 : 0

  return {
    page: safePage,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    perPage: safePerPage,
    total: safeTotal,
    from: Number.isFinite(Number(source.from)) && Number(source.from) > 0 ? Number(source.from) : inferredFrom,
    to: Number.isFinite(Number(source.to)) && Number(source.to) > 0 ? Number(source.to) : inferredTo,
  }
}

function normalizeTicketStatus(value) {
  const status = String(value ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (status === 'resolved' || status === 'archived' || status === 'closed') return 'closed'
  if (status === 'in_progress') return 'in_progress'
  if (status === 'pending' || status === 'replied') return 'pending'
  return 'open'
}

function isSupportAuthor(record) {
  const sender = firstText(
    record.sender_type_slug,
    record.sender_type,
    typeof record.sender === 'string' ? record.sender : '',
    record.author_type,
    record.user_type,
    record.role,
  ).toLowerCase()

  return sender.includes('admin')
    || sender.includes('support')
    || sender.includes('agent')
    || sender.includes('staff')
    || record.is_admin === true
    || record.is_staff === true
    || record.from_admin === true
}

function normalizeTicketMessage(record, index) {
  if (!isRecord(record)) return null
  const text = firstText(record.message, record.body, record.text, record.content, record.reply)
  if (!text) return null

  const senderRecord = isRecord(record.sender) ? record.sender : {}

  return {
    id: firstText(record.id, `msg-${index + 1}`),
    sender: isSupportAuthor(record) ? 'support' : 'customer',
    authorName: composeFullName(senderRecord.first_name, senderRecord.last_name),
    text,
    sentAt: firstText(record.sent_at, record.created_at, record.updated_at),
  }
}

export function normalizeAdminSupportReply(body) {
  const envelope = unwrapApiEnvelope(body)
  const record = isRecord(envelope?.data) ? envelope.data : envelope
  const message = normalizeTicketMessage(record, 0)
  if (!message) return null

  return {
    ticketId: firstText(record.support_ticket_id, record.ticket_id),
    message: {
      ...message,
      sentAt: message.sentAt || new Date().toISOString(),
    },
  }
}

export function normalizeAdminSupportTicket(record) {
  if (!isRecord(record)) return null

  const user = isRecord(record.user)
    ? record.user
    : (isRecord(record.customer) ? record.customer : {})
  const topic = isRecord(record.topic) ? record.topic : {}
  const order = isRecord(record.order) ? record.order : {}
  const rawMessages = Array.isArray(record.messages)
    ? record.messages
    : (Array.isArray(record.replies) ? record.replies : [])
  const messages = rawMessages.map(normalizeTicketMessage).filter(Boolean)
  const opening = firstText(record.message, record.description, record.body)
  const thread = messages.length
    ? messages
    : (opening
      ? [{
        id: 'opening',
        sender: 'customer',
        text: opening,
        sentAt: firstText(record.created_at, record.updated_at),
      }]
      : [])
  const latest = thread[thread.length - 1]
  const customerName = composeFullName(user.first_name, user.last_name)
    || firstText(user.name, user.full_name, record.customer_name, record.user_name, 'Shopper')
  const id = firstText(record.id, record.ticket_id, record.uuid)

  if (!id && !customerName) return null

  return {
    id: id || customerName,
    ticketNumber: firstText(record.ticket_number, record.reference, record.ticketNumber),
    customerName,
    customerEmail: firstText(user.email, record.customer_email, record.email),
    topic: firstText(topic.name, record.topic_name, typeof record.topic === 'string' ? record.topic : ''),
    subject: firstText(record.subject, topic.name, record.title, 'Support request'),
    preview: firstText(record.preview, record.last_message, latest?.text).slice(0, 140),
    status: normalizeTicketStatus(record.status),
    unreadCount: Number(record.unread_count ?? record.unread_messages ?? record.unreadCount) || 0,
    orderId: firstText(record.order_id, order.id),
    orderNumber: firstText(record.order_number, order.order_number, order.reference),
    updatedAt: firstText(record.updated_at, latest?.sentAt, record.created_at),
    createdAt: firstText(record.created_at, record.updated_at),
    messages: thread,
  }
}

export function normalizeAdminSupportTickets(body) {
  return extractSupportTicketList(body)
    .map(normalizeAdminSupportTicket)
    .filter(Boolean)
}

export function emptySupportTicketPagination() {
  return {
    page: 1,
    lastPage: 1,
    perPage: TICKETS_PAGE_SIZE,
    total: 0,
    from: 0,
    to: 0,
  }
}
