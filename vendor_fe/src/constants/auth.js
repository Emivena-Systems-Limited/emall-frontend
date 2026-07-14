export const OTP_LENGTH = 6
export const OTP_RESEND_SECONDS = 15
export const OTP_EXPIRY_MINUTES = 5

export const AUTH_GUARD = {
  VENDOR: 'vendor',
}

export const AUTH_VERIFICATION_TYPE = {
  REGISTRATION: 'registration',
  PASSWORD_RESET: 'password_reset',
  RESET_PASSWORD: 'reset_password',
}

export const VENDOR_AUTH_ENDPOINTS = {
  REGISTER: '/api/vendor/auth/register',
  LOGIN: '/api/vendor/auth/login',
  VERIFY: '/api/vendor/auth/verify_otp',
  RESEND_OTP: '/api/notification/re-send/otp',
  LOGOUT: '/api/vendor/auth/logout',
  SEND_RESET_PASSWORD_OTP: '/api/vendor/auth/send/reset-password/otp',
  RESET_PASSWORD: '/api/vendor/auth/reset-password',
}
