import { DOCUMENT_CATEGORIES } from '../constants/profile'
import { unwrapApiEnvelope } from './parseApiError'
import { resolveBackendMediaUrl } from './resolveBackendMediaUrl'

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

function toRecordList(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []

  const keys = Object.keys(value)
  if (!keys.length || !keys.every((key) => /^\d+$/.test(key))) return []

  return keys
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => value[key])
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
}

export function extractVendorDocumentList(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? body

  const fromPayload = toRecordList(payload)
  if (fromPayload.length) return fromPayload

  const nestedLists = [
    payload?.data,
    payload?.documents,
    payload?.items,
    payload?.results,
  ]

  for (const nested of nestedLists) {
    const list = toRecordList(nested)
    if (list.length) return list
  }

  return []
}

function resolveDocumentCategory(record) {
  const raw = String(record?.category ?? record?.document_type ?? record?.type ?? '').trim()
  const token = raw.toLowerCase().replace(/\s+/g, '_')

  if (DOCUMENT_CATEGORIES[token]) return token

  const match = Object.entries(DOCUMENT_CATEGORIES).find(
    ([, label]) => label.toLowerCase() === raw.toLowerCase(),
  )
  return match?.[0] || token || ''
}

function resolveVerificationStatus(record) {
  const raw = String(record?.verification_status ?? record?.status ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (raw === 'verified' || raw === 'approved') return 'verified'
  if (raw === 'pending' || raw === 'under_review' || raw === 'review') return 'pending'
  if (raw === 'not_verified' || raw === 'rejected' || raw === 'unverified') return 'not_verified'
  return record?.file_url || record?.file_name || record?.url ? 'pending' : 'not_verified'
}

export function normalizeVendorDocument(record, index = 0) {
  if (!record || typeof record !== 'object') return null

  const category = resolveDocumentCategory(record)
  const fileName = firstValue(
    record.file_name,
    record.filename,
    record.original_name,
    record.original_filename,
  )
  const fileUrl = resolveBackendMediaUrl(firstValue(
    record.file_url,
    record.document_url,
    record.url,
    record.path,
  ))
  const documentType = firstValue(
    DOCUMENT_CATEGORIES[category],
    record.document_type,
    record.type,
    'Document',
  )

  return {
    id: firstValue(record.id, record.document_id, `doc-${index + 1}`),
    category,
    name: firstValue(record.title, record.name, documentType, 'Document'),
    documentType,
    fileName: fileName || null,
    fileUrl: fileUrl || null,
    verificationStatus: resolveVerificationStatus(record),
    uploadedAt: firstValue(record.uploaded_at, record.created_at, record.updated_at) || null,
    previewLabel: fileName || documentType,
  }
}

export function normalizeVendorDocumentsList(body) {
  return extractVendorDocumentList(body).map(normalizeVendorDocument).filter(Boolean)
}
