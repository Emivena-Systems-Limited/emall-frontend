import { OTP_RESEND_SECONDS } from '../constants/auth'
import {
  clearOtpResendCooldown,
  getOtpResendSecondsLeft,
  markOtpResendCooldown,
  OTP_RESEND_STORAGE_KEYS,
} from './otpResendCooldown'

const EMAIL_KEY = 'vendor_forgot_password_email'
const RESEND_AT_KEY = OTP_RESEND_STORAGE_KEYS.FORGOT_PASSWORD

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
  clearOtpResendCooldown(RESEND_AT_KEY)
}

export function markForgotPasswordResendCooldown(seconds = OTP_RESEND_SECONDS) {
  markOtpResendCooldown(RESEND_AT_KEY, seconds)
}

export function getForgotPasswordResendSecondsLeft(defaultSeconds = OTP_RESEND_SECONDS) {
  return getOtpResendSecondsLeft(RESEND_AT_KEY, defaultSeconds)
}
