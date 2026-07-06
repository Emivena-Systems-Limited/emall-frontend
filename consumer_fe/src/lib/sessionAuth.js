const PUBLIC_AUTH_SKIP_PATHS = [
  '/user/auth/login',
  '/user/auth/register',
  '/user/auth/verify_otp',
  '/user/auth/logout',
]

let authRehydrated = false
let sessionLogoutInProgress = false

export function setAuthRehydrated(value = true) {
  authRehydrated = value
}

export function isAuthRehydrated() {
  return authRehydrated
}

export function shouldSkipAuthLogout(config) {
  if (config?.skipAuthLogout) return true

  const url = String(config?.url ?? '')
  return PUBLIC_AUTH_SKIP_PATHS.some((path) => url.includes(path))
}

export function shouldForceLogoutOn401(error, config) {
  if (!authRehydrated) return false
  if (error.response?.status !== 401) return false
  if (shouldSkipAuthLogout(config)) return false

  return Boolean(config?.headers?.Authorization)
}

export function runSessionLogoutOnce({ dispatchLogout, persistAuth, notifyExpired }) {
  if (sessionLogoutInProgress) return false

  sessionLogoutInProgress = true
  try {
    dispatchLogout()
    persistAuth?.()
    notifyExpired?.()
    return true
  } finally {
    sessionLogoutInProgress = false
  }
}
