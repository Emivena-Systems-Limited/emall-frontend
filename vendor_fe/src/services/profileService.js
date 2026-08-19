import apiClient from '../lib/apiClient'
import { DOCUMENT_CATEGORIES, PROFILE_ENDPOINTS } from '../constants/profile'
import {
  getMockBusinessInformation,
  getMockProfile,
  saveMockBusinessInformation,
  saveMockProfile,
} from '../mocks/profileMockData'
import { extractVendorAddressPayload, extractVendorInformationPayload } from '../utils/profileFormUtils'
import { unwrapApiEnvelope } from '../utils/parseApiError'
import { resolveBackendMediaUrl } from '../utils/resolveBackendMediaUrl'
import {
  normalizeVendorDocument,
  normalizeVendorDocumentsList,
} from '../utils/normalizeVendorDocuments'
import { assertApiSuccess, changeVendorPassword } from './authService'

const MOCK_DELAY_MS = 400

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function logDev(method, endpoint) {
  if (import.meta.env.DEV) {
    console.info(`[profile] ${method} (mock)`, endpoint)
  }
}

// TODO: Connect vendor profile API.
export async function getProfile() {
  await delay()
  logDev('GET', PROFILE_ENDPOINTS.PROFILE)
  return getMockProfile()
}

export async function updateProfile(payload) {
  const body = {
    business_name: String(payload?.business_name ?? '').trim(),
    admin_full_name: String(payload?.admin_full_name ?? '').trim(),
    store_name: String(payload?.store_name ?? '').trim(),
    trading_name: String(payload?.trading_name ?? '').trim(),
    phone_number: String(payload?.phone_number ?? '').replace(/\D/g, ''),
  }

  const { data } = await apiClient.patch(PROFILE_ENDPOINTS.UPDATE_INFORMATION, body)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[profile] POST', PROFILE_ENDPOINTS.UPDATE_INFORMATION, body, data)
  }

  const record = extractVendorInformationPayload(data)
  const envelope = unwrapApiEnvelope(data)

  return {
    user: {
      business_name: record?.business_name ?? body.business_name,
      admin_full_name: record?.admin_full_name ?? body.admin_full_name,
      store_name: record?.store_name ?? body.store_name,
      trading_name: record?.trading_name ?? body.trading_name,
      phone_number: record?.phone_number ?? body.phone_number,
    },
    message: envelope?.message ?? data?.message,
  }
}

export async function updateVendorAddress({ addressId, ...payload }) {
  const id = String(addressId ?? '').trim()
  if (!id) {
    throw new Error('Address id is required to update your address.')
  }

  const body = {
    country: String(payload?.country ?? '').trim(),
    region: String(payload?.region ?? '').trim(),
    city_or_town: String(payload?.city_or_town ?? '').trim(),
    address: String(payload?.address ?? '').trim(),
    gps_address: String(payload?.gps_address ?? '').trim(),
    street_name: String(payload?.street_name ?? '').trim(),
    landmark: String(payload?.landmark ?? '').trim(),
  }

  const endpoint = PROFILE_ENDPOINTS.updateAddress(id)
  const { data } = await apiClient.patch(endpoint, body)
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[profile] POST', endpoint, body, data)
  }

  const record = extractVendorAddressPayload(data)
  const envelope = unwrapApiEnvelope(data)
  const resolvedId = String(record?.id ?? record?.address_id ?? id)

  return {
    addressId: resolvedId,
    address: {
      id: resolvedId,
      country: record?.country ?? body.country,
      region: record?.region ?? body.region,
      city_or_town: record?.city_or_town ?? body.city_or_town,
      address: typeof record?.address === 'string' ? record.address : body.address,
      gps_address: record?.gps_address ?? body.gps_address,
      street_name: record?.street_name ?? body.street_name,
      landmark: record?.landmark ?? body.landmark,
    },
    message: envelope?.message ?? data?.message,
  }
}

// TODO: Connect verification status API.
export async function getVerificationStatus() {
  await delay(200)
  logDev('GET', PROFILE_ENDPOINTS.VERIFICATION)
  const profile = getMockProfile()
  return {
    verificationStatus: profile.verificationStatus,
    verification: profile.verification,
  }
}

// TODO: Connect business information API.
export async function getBusinessInformation() {
  await delay()
  logDev('GET', PROFILE_ENDPOINTS.BUSINESS)
  return getMockBusinessInformation()
}

// TODO: Connect business information update API.
export async function updateBusinessInformation(data) {
  await delay()
  logDev('PATCH', PROFILE_ENDPOINTS.BUSINESS)
  return saveMockBusinessInformation(data)
}

export async function getDocuments() {
  try {
    const { data } = await apiClient.get(PROFILE_ENDPOINTS.DOCUMENTS)
    assertApiSuccess(data)

    if (import.meta.env.DEV) {
      console.info('[profile] GET', PROFILE_ENDPOINTS.DOCUMENTS, data)
    }

    return normalizeVendorDocumentsList(data)
  } catch (error) {
    if (error?.response?.status === 404) return []
    throw error
  }
}

function buildDocumentFileUrl(file) {
  const safeName = String(file?.name || 'document.bin')
    .trim()
    .replace(/[^\w.\-]+/g, '_')
  return resolveBackendMediaUrl(`vendor-documents/${Date.now()}-${safeName}`)
}

export async function uploadDocument({
  documentId,
  file,
  document_type: documentTypeSnake,
  documentType,
  category,
  name,
  file_url: fileUrlValue,
} = {}) {
  if (!file) {
    throw new Error('Select a document to upload.')
  }

  const resolvedDocumentType = String(documentTypeSnake || documentType || category || '').trim()
  const resolvedCategory = String(category || resolvedDocumentType || '').trim()
  const resolvedName = String(
    name
    || DOCUMENT_CATEGORIES[resolvedCategory]
    || resolvedDocumentType
    || resolvedCategory
    || file.name,
  ).trim()
  const fileUrl = String(fileUrlValue || '').trim() || buildDocumentFileUrl(file)

  if (!resolvedDocumentType) {
    throw new Error('Choose a document type before uploading.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('document_type', resolvedDocumentType)
  formData.append('category', resolvedCategory)
  formData.append('name', resolvedName)
  formData.append('file_name', file.name)
  formData.append('file_url', fileUrl)
  formData.append('verification_status', 'pending')
  if (documentId) formData.append('document_id', String(documentId))

  const payload = Object.fromEntries(formData.entries())
  console.log('[profile] POST', PROFILE_ENDPOINTS.UPLOAD_DOCUMENT, payload)

  const { data } = await apiClient.post(PROFILE_ENDPOINTS.UPLOAD_DOCUMENT, formData, {
    timeout: 60000,
  })
  assertApiSuccess(data)

  if (import.meta.env.DEV) {
    console.info('[profile] POST response', PROFILE_ENDPOINTS.UPLOAD_DOCUMENT, data)
  }

  const envelope = unwrapApiEnvelope(data)
  const record = envelope?.data && typeof envelope.data === 'object' && !Array.isArray(envelope.data)
    ? envelope.data
    : null

  return normalizeVendorDocument(record ?? {
    id: documentId,
    category: resolvedCategory,
    document_type: resolvedDocumentType,
    name: resolvedName,
    file_name: file.name,
    file_url: fileUrl,
    status: 'pending',
    uploaded_at: new Date().toISOString(),
  })
}

// TODO: Connect profile picture upload API.
export async function uploadProfilePicture(file) {
  await delay(700)
  logDev('POST', PROFILE_ENDPOINTS.AVATAR)

  const previewUrl = URL.createObjectURL(file)
  return saveMockProfile({ profilePicture: previewUrl })
}

// TODO: Connect profile picture removal API.
export async function removeProfilePicture() {
  await delay(500)
  logDev('DELETE', PROFILE_ENDPOINTS.AVATAR)
  return saveMockProfile({ profilePicture: null })
}

export async function changePassword(payload) {
  return changeVendorPassword(payload)
}

// TODO: Connect profile editing permissions to backend/vendor role permissions.
// TODO: Confirm role/permission API structure.
