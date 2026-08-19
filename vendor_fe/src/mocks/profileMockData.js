/** In-memory mock store for vendor profile data until APIs are available. */

export const MOCK_VENDOR_PROFILE = {
  id: 'vendor-001',
  name: 'Kwame Mensah',
  email: 'kwame@example.com',
  phone: '+233241234567',
  phoneCountryCode: '+233',
  phoneLocal: '241234567',
  dateOfBirth: '1995-03-15',
  location: 'Accra, Ghana',
  profilePicture: null,
  role: 'store_owner',
  verificationStatus: 'verified',
  dateJoined: '2025-01-15T08:00:00.000Z',
  storeName: 'Accra Home & Office',
  verification: {
    identity: 'verified',
    business: 'pending',
    address: 'not_verified',
  },
}

export const MOCK_BUSINESS_INFORMATION = {
  businessName: 'Accra Home & Office Ltd',
  registrationNumber: 'BN-123456',
  businessType: 'Retail',
  businessEmail: 'business@accrahome.com',
  businessPhone: '+233301234567',
  businessPhoneCountryCode: '+233',
  businessPhoneLocal: '301234567',
  address: '12 Independence Avenue',
  city: 'Accra',
  region: 'Greater Accra',
  country: 'Ghana',
}

let profileStore = structuredClone(MOCK_VENDOR_PROFILE)
let businessStore = structuredClone(MOCK_BUSINESS_INFORMATION)

export function resetProfileMockStore() {
  profileStore = structuredClone(MOCK_VENDOR_PROFILE)
  businessStore = structuredClone(MOCK_BUSINESS_INFORMATION)
}

export function getMockProfile() {
  return structuredClone(profileStore)
}

export function saveMockProfile(updates) {
  profileStore = { ...profileStore, ...updates }
  return getMockProfile()
}

export function getMockBusinessInformation() {
  return structuredClone(businessStore)
}

export function saveMockBusinessInformation(updates) {
  businessStore = { ...businessStore, ...updates }
  return getMockBusinessInformation()
}
