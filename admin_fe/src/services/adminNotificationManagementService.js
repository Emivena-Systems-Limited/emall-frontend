import apiClient from '../lib/apiClient'
import { assertAuthEnvelope } from '../utils/parseApiError'

const BASE = '/api/admin/notifications'
const TEMPLATE_BASE = '/api/admin/notification-templates'

function compact(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '' && value != null))
}

function payloadOf(body) {
  const envelope = assertAuthEnvelope(body, 'The notification request could not be completed.')
  return envelope?.data ?? envelope
}

function listOf(payload, keys = []) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key]
  return []
}

function paginationOf(payload, count) {
  const source = payload?.meta ?? payload?.pagination ?? payload ?? {}
  return {
    page: Number(source.current_page ?? source.page ?? 1),
    lastPage: Number(source.last_page ?? source.lastPage ?? 1),
    perPage: Number(source.per_page ?? source.perPage ?? 20),
    total: Number(source.total ?? count),
  }
}

function titleCase(value) {
  return String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function normalizeChannels(value) {
  const list = Array.isArray(value) ? value : String(value ?? '').split(',')
  return list.filter(Boolean).map((channel) => titleCase(channel === 'in_app' ? 'in-app' : channel))
}

export function normalizeManagedNotification(record = {}) {
  const recipients = record.recipient_count ?? record.total_recipients ?? record.recipients_count ?? record.recipients
  const delivered = Number(record.delivered_count ?? record.delivered ?? 0)
  const recipientCount = Number(Array.isArray(recipients) ? recipients.length : recipients ?? 0)
  return {
    ...record,
    id: String(record.id ?? record.notification_id ?? ''),
    title: String(record.title ?? ''),
    message: String(record.message ?? record.body ?? ''),
    type: titleCase(record.type ?? 'general'),
    audience: titleCase(record.audience ?? record.recipient_type ?? 'all users'),
    recipients: recipientCount,
    channels: normalizeChannels(record.channels),
    status: titleCase(record.status ?? 'draft'),
    date: record.scheduled_at ?? record.sent_at ?? record.created_at ?? new Date().toISOString(),
    deliveredRate: Number(record.delivery_rate ?? record.delivered_rate ?? (recipientCount ? (delivered / recipientCount) * 100 : 0)),
  }
}

function toApiValue(value) {
  return String(value ?? '').trim().toLowerCase().replace(/[ -]+/g, '_')
}

function notificationPayload(form) {
  const audience = toApiValue(form.audience)
  return {
    title: form.title.trim(),
    message: form.message.trim(),
    type: toApiValue(form.type),
    audience,
    recipient_ids: audience.startsWith('specific_') ? form.selectedRecipients : [],
    channels: form.channels.map(toApiValue),
    send_now: form.timing !== 'later',
    scheduled_at: form.timing === 'later' ? new Date(form.scheduledAt).toISOString() : null,
    ...(form.templateId ? { template_id: form.templateId } : {}),
  }
}

export async function fetchManagedNotifications(filters = {}) {
  const { data } = await apiClient.get(BASE, {
    params: compact({
      search: filters.search?.trim(),
      recipient_type: toApiValue(filters.recipientType),
      type: toApiValue(filters.type),
      status: toApiValue(filters.status),
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
      page: filters.page ?? 1,
      per_page: filters.perPage ?? 20,
    }),
  })
  const payload = payloadOf(data)
  const records = listOf(payload, ['notifications', 'items', 'records'])
  return { notifications: records.map(normalizeManagedNotification), pagination: paginationOf(payload, records.length) }
}

export async function fetchManagedNotificationStats() {
  const { data } = await apiClient.get(`${BASE}/stats`)
  const source = payloadOf(data)?.stats ?? payloadOf(data) ?? {}
  return {
    total: Number(source.total ?? source.total_notifications ?? 0),
    sent: Number(source.sent ?? source.delivered ?? 0),
    scheduled: Number(source.scheduled ?? 0),
    failed: Number(source.failed ?? 0),
  }
}

export async function fetchManagedNotification(id) {
  const { data } = await apiClient.get(`${BASE}/${encodeURIComponent(id)}`)
  return normalizeManagedNotification(payloadOf(data)?.notification ?? payloadOf(data))
}

export async function createManagedNotification(form) {
  const { data } = await apiClient.post(BASE, notificationPayload(form))
  const payload = payloadOf(data)
  return normalizeManagedNotification(payload?.notification ?? payload)
}

export async function updateManagedNotification({ id, form }) {
  const body = notificationPayload(form)
  delete body.send_now
  delete body.scheduled_at
  const { data } = await apiClient.patch(`${BASE}/${encodeURIComponent(id)}`, body)
  return normalizeManagedNotification(payloadOf(data)?.notification ?? payloadOf(data))
}

export async function rescheduleManagedNotification({ id, scheduledAt }) {
  const { data } = await apiClient.delete(`${BASE}/${encodeURIComponent(id)}/reschedule`, {
    data: { scheduled_at: new Date(scheduledAt).toISOString() },
  })
  return payloadOf(data)
}

export async function cancelManagedNotification(id) {
  const { data } = await apiClient.delete(`${BASE}/${encodeURIComponent(id)}/schedule`)
  return payloadOf(data)
}

export async function resendManagedNotification(id) {
  const { data } = await apiClient.post(`${BASE}/${encodeURIComponent(id)}/resend`)
  return payloadOf(data)
}

function normalizeTemplate(record = {}) {
  return {
    ...record,
    id: String(record.id ?? record.template_id ?? ''),
    name: String(record.name ?? record.title ?? 'Template'),
    title: String(record.title ?? ''),
    message: String(record.message ?? record.body ?? ''),
    type: titleCase(record.type ?? 'general'),
    audience: titleCase(record.audience ?? 'all customers'),
    channels: normalizeChannels(record.channels),
    isActive: Boolean(record.is_active ?? record.active ?? true),
  }
}

export async function fetchNotificationTemplates({ search = '', page = 1, perPage = 100 } = {}) {
  const { data } = await apiClient.get(TEMPLATE_BASE, { params: compact({ search, page, per_page: perPage }) })
  const payload = payloadOf(data)
  return listOf(payload, ['templates', 'items', 'records']).map(normalizeTemplate)
}

export async function createNotificationTemplate(template) {
  const { data } = await apiClient.post(TEMPLATE_BASE, {
    name: template.name,
    title: template.title,
    message: template.message,
    type: toApiValue(template.type),
    channels: template.channels.map(toApiValue),
    audience: toApiValue(template.audience),
    is_active: template.isActive ?? true,
  })
  return normalizeTemplate(payloadOf(data)?.template ?? payloadOf(data))
}

export async function updateNotificationTemplate({ id, changes }) {
  const { data } = await apiClient.patch(`${TEMPLATE_BASE}/${encodeURIComponent(id)}`, changes)
  return normalizeTemplate(payloadOf(data)?.template ?? payloadOf(data))
}

export async function deleteNotificationTemplate(id) {
  const { data } = await apiClient.delete(`${TEMPLATE_BASE}/${encodeURIComponent(id)}`)
  return payloadOf(data)
}
