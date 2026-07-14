import { OTP_RESEND_SECONDS } from '../constants/auth'

const STORAGE_KEY = 'consumer_auth_otp_session'
const RESEND_AT_KEY = 'consumer_auth_otp_resend_at'

export function isValidAuthOtpSession(session) {
  return Boolean(session?.contact && session?.method)
}

export function markAuthOtpResendCooldown(seconds) {
  sessionStorage.setItem(RESEND_AT_KEY, String(Date.now() + seconds * 1000))
}

export function getAuthOtpResendSecondsLeft(defaultSeconds) {
  try {
    const raw = sessionStorage.getItem(RESEND_AT_KEY)
    if (!raw) return defaultSeconds

    const remaining = Math.ceil((Number(raw) - Date.now()) / 1000)
    return Math.max(remaining, 0)
  } catch {
    return defaultSeconds
  }
}

export function saveAuthOtpSession(session) {
  if (!isValidAuthOtpSession(session)) return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))

  if (!sessionStorage.getItem(RESEND_AT_KEY)) {
    markAuthOtpResendCooldown(OTP_RESEND_SECONDS)
  }
}

export function readAuthOtpSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    return isValidAuthOtpSession(session) ? session : null
  } catch {
    return null
  }
}

export function clearAuthOtpSession() {
  sessionStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(RESEND_AT_KEY)
}
