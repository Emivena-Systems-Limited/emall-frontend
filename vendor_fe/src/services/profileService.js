import { PROFILE_ENDPOINTS } from '../constants/profile'
import {
  getMockBankDetails,
  getMockBusinessInformation,
  getMockDocuments,
  getMockProfile,
  saveMockBankDetails,
  saveMockBusinessInformation,
  saveMockDocument,
  saveMockProfile,
} from '../mocks/profileMockData'

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

// TODO: Connect profile update API.
export async function updateProfile(data) {
  await delay()
  logDev('PATCH', PROFILE_ENDPOINTS.PROFILE)
  return saveMockProfile(data)
}

// TODO: Connect account summary API.
export async function getAccountSummary() {
  await delay(200)
  logDev('GET', PROFILE_ENDPOINTS.SUMMARY)
  return getMockProfile().accountSummary
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

// TODO: Connect bank details API.
export async function getBankDetails() {
  await delay()
  logDev('GET', PROFILE_ENDPOINTS.BANK)
  return getMockBankDetails()
}

// TODO: Connect bank details update API.
// TODO: Confirm backend security/verification requirements for bank-detail changes.
export async function updateBankDetails(data) {
  await delay()
  logDev('PATCH', PROFILE_ENDPOINTS.BANK)
  return saveMockBankDetails(data)
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

// TODO: Connect password change API.
export async function changePassword({ currentPassword, password }) {
  await delay(600)
  logDev('POST', PROFILE_ENDPOINTS.PASSWORD)

  if (!currentPassword || !password) {
    throw new Error('Unable to change password.')
  }

  return { success: true }
}

// TODO: Connect profile editing permissions to backend/vendor role permissions.
// TODO: Confirm role/permission API structure.
