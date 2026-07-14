import { OTP_RESEND_SECONDS } from '../constants/auth'

const EMAIL_KEY = 'vendor_forgot_password_email'
const RESEND_AT_KEY = 'vendor_forgot_password_resend_at'

export function saveForgotPasswordEmail(email) {
  const normalized = String(email ?? '').trim()
  if (!normalized) return
  sessionStorage.setItem(EMAIL_KEY, normalized)
}

export function readForgotPasswordEmail() {
  const email = sessionStorage.getItem(EMAIL_KEY)
  return email?.trim() || null
}

export function clearForgotPasswordSession() {
  sessionStorage.removeItem(EMAIL_KEY)
  sessionStorage.removeItem(RESEND_AT_KEY)
}

export function markForgotPasswordResendCooldown(seconds = OTP_RESEND_SECONDS) {
  sessionStorage.setItem(RESEND_AT_KEY, String(Date.now() + seconds * 1000))
}

export function getForgotPasswordResendSecondsLeft(defaultSeconds = OTP_RESEND_SECONDS) {
  try {
    const raw = sessionStorage.getItem(RESEND_AT_KEY)
    if (!raw) return defaultSeconds

    const remaining = Math.ceil((Number(raw) - Date.now()) / 1000)
    return Math.max(remaining, 0)
  } catch {
    return defaultSeconds
  }
}
