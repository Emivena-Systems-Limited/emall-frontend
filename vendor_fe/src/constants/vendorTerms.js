export const VENDOR_TERMS_URL =
  import.meta.env.VITE_VENDOR_TERMS_URL || 'https://e-mall.com/vendor-terms-and-conditions'

export const REGISTRATION_STEPS = [
  { id: 'business', label: 'Business' },
  { id: 'verification', label: 'Verification' },
  { id: 'contact', label: 'Contact' },
  { id: 'consent', label: 'Review' },
]

export const ALLOWED_CERTIFICATE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
export const MAX_CERTIFICATE_SIZE_BYTES = 5 * 1024 * 1024
