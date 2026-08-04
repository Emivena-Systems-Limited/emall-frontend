import { OTP_RESEND_SECONDS } from '../constants/auth'

export const OTP_RESEND_STORAGE_KEYS = {
  VERIFY_ACCOUNT: 'vendor_verify_account_resend_at',
  FORGOT_PASSWORD: 'vendor_forgot_password_resend_at',
}

export function markOtpResendCooldown(storageKey, seconds = OTP_RESEND_SECONDS) {
  if (!storageKey) return
  sessionStorage.setItem(storageKey, String(Date.now() + seconds * 1000))
}

export function getOtpResendSecondsLeft(storageKey, defaultSeconds = OTP_RESEND_SECONDS) {
  if (!storageKey) return defaultSeconds

  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return defaultSeconds

    const remaining = Math.ceil((Number(raw) - Date.now()) / 1000)
    // Cap to current default so older longer cooldowns don't outlive config changes
    return Math.min(Math.max(remaining, 0), defaultSeconds)
  } catch {
    return defaultSeconds
  }
}

export function clearOtpResendCooldown(storageKey) {
  if (!storageKey) return
  sessionStorage.removeItem(storageKey)
}
