const STORAGE_KEY = 'consumer_auth_otp_session'

export function isValidAuthOtpSession(session) {
  return Boolean(session?.contact && session?.method)
}

export function saveAuthOtpSession(session) {
  if (!isValidAuthOtpSession(session)) return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
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
}
