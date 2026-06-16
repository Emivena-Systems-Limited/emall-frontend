export const OTP_LENGTH = 6
export const OTP_RESEND_SECONDS = 15

export const AUTH_VERIFICATION_TYPE = {
  REGISTRATION: 'registration',
}

export const VENDOR_AUTH_ENDPOINTS = {
  REGISTER: '/api/vendor/auth/register',
  LOGIN: '/api/vendor/auth/login',
  VERIFY: '/api/vendor/auth/verify_otp',
  RESEND_OTP: '/api/vendor/auth/resend-otp',
  LOGOUT: '/api/vendor/auth/logout',
}
