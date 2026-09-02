export const AUTH_ENDPOINTS = {
  LOGIN: '/api/admin/auth/login',
  LOGOUT: '/api/admin/auth/logout',
  SEND_RESET_PASSWORD_OTP: '/api/admin/auth/send/reset-password/otp',
  RESET_PASSWORD: '/api/admin/auth/reset-password',
  PASSWORD_CHANGE: '/api/admin/auth/password-change',
}

export const AUTH_PATHS = ['/login', '/forgot-password', '/reset-password']

export const DEFAULT_POST_LOGIN_PATH = '/dashboard'

export const OTP_LENGTH = 6
export const OTP_RESEND_SECONDS = 60
export const OTP_EXPIRY_MINUTES = 5

export const OTP_RESEND_STORAGE_KEYS = {
  FORGOT_PASSWORD: 'admin_forgot_password_resend_at',
}
