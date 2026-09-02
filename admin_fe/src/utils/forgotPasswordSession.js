import { OTP_RESEND_SECONDS, OTP_RESEND_STORAGE_KEYS } from '../constants/auth'
import {
  clearOtpResendCooldown,
  getOtpResendSecondsLeft,
  markOtpResendCooldown,
} from './otpResendCooldown'

const EMAIL_KEY = 'admin_forgot_password_email'
const RESEND_AT_KEY = OTP_RESEND_STORAGE_KEYS.FORGOT_PASSWORD

export function saveForgotPasswordEmail(email) {
  const normalized = String(email ?? '').trim().toLowerCase()
  if (!normalized) return
  sessionStorage.setItem(EMAIL_KEY, normalized)
}

export function readForgotPasswordEmail() {
  try {
    return sessionStorage.getItem(EMAIL_KEY)?.trim() || null
  } catch {
    return null
  }
}

export function clearForgotPasswordSession() {
  try {
    sessionStorage.removeItem(EMAIL_KEY)
    clearOtpResendCooldown(RESEND_AT_KEY)
  } catch {
    /* private mode / blocked storage */
  }
}

export function markForgotPasswordResendCooldown(seconds = OTP_RESEND_SECONDS) {
  markOtpResendCooldown(RESEND_AT_KEY, seconds)
}

export function getForgotPasswordResendSecondsLeft(defaultSeconds = OTP_RESEND_SECONDS) {
  return getOtpResendSecondsLeft(RESEND_AT_KEY, defaultSeconds)
}
