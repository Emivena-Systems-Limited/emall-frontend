import apiClient from '../lib/apiClient'
import { PROFILE_ENDPOINTS } from '../constants/profile'
import {
  getMockBusinessInformation,
  getMockDocuments,
  getMockProfile,
  saveMockBusinessInformation,
  saveMockDocument,
  saveMockProfile,
} from '../mocks/profileMockData'
import { extractVendorAddressPayload, extractVendorInformationPayload } from '../utils/profileFormUtils'
import { unwrapApiEnvelope } from '../utils/parseApiError'
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

// TODO: Connect documents API.
export async function getDocuments() {
  await delay()
  logDev('GET', PROFILE_ENDPOINTS.DOCUMENTS)
  return getMockDocuments()
}

// TODO: Connect document upload API/storage.
export async function uploadDocument({ documentId, file, documentType }) {
  await delay(600)
  logDev('POST', PROFILE_ENDPOINTS.DOCUMENT(documentId))

  const uploadedAt = new Date().toISOString()
  return saveMockDocument({
    id: documentId,
    fileName: file?.name ?? 'uploaded-document.pdf',
    documentType: documentType ?? 'Uploaded Document',
    verificationStatus: 'pending',
    uploadedAt,
    previewLabel: `${documentType ?? 'Document'} — uploaded, pending review`,
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
