const AUTH_LOGOUT_SKIP_PATHS = [
  '/api/vendor/auth/login',
  '/api/vendor/auth/register',
  '/api/vendor/auth/verify_otp',
  '/api/notification/re-send/otp',
  '/api/vendor/auth/logout',
]

const SESSION_EXPIRY_BUFFER_MS = 30_000

let sessionLogoutInProgress = false

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export function isAccessTokenExpired(accessToken, { bufferMs = SESSION_EXPIRY_BUFFER_MS } = {}) {
  const payload = decodeJwtPayload(accessToken)
  if (!payload?.exp) return false

  return payload.exp * 1000 <= Date.now() + bufferMs
}

export function shouldSkipAuthLogout(config) {
  if (config?.skipAuthLogout) return true

  const url = String(config?.url ?? '')
  return AUTH_LOGOUT_SKIP_PATHS.some((path) => url.includes(path))
}

export function shouldForceLogoutOn401(error, config) {
  if (error.response?.status !== 401) return false
  if (shouldSkipAuthLogout(config)) return false

  const hadAuthHeader = Boolean(config?.headers?.Authorization)
  return hadAuthHeader
}

export function runSessionLogoutOnce({ dispatchLogout, persistAuth, notifyExpired }) {
  if (sessionLogoutInProgress) return false

  sessionLogoutInProgress = true
  try {
    dispatchLogout()
    persistAuth()
    notifyExpired()
    return true
  } finally {
    sessionLogoutInProgress = false
  }
}
