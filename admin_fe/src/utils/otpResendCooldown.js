import { OTP_RESEND_SECONDS, OTP_RESEND_STORAGE_KEYS } from '../constants/auth'

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
    return Math.min(Math.max(remaining, 0), defaultSeconds)
  } catch {
    return defaultSeconds
  }
}

export function clearOtpResendCooldown(storageKey) {
  if (!storageKey) return
  sessionStorage.removeItem(storageKey)
}

export { OTP_RESEND_STORAGE_KEYS }
