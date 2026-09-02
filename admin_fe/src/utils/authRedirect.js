import { AUTH_PATHS, DEFAULT_POST_LOGIN_PATH } from '../constants/auth'

const LAST_APP_PATH_KEY = 'admin:last-app-path'

function isAuthPath(pathname) {
  return AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export function getSafeAppPath(from, fallback = DEFAULT_POST_LOGIN_PATH) {
  const pathname = typeof from === 'string' ? from : from?.pathname
  const search = typeof from === 'object' && from ? from.search ?? '' : ''
  const hash = typeof from === 'object' && from ? from.hash ?? '' : ''

  if (!pathname || !pathname.startsWith('/') || pathname.startsWith('//')) {
    return fallback
  }

  if (isAuthPath(pathname)) return fallback

  return `${pathname}${search}${hash}`
}

export function rememberAppPath(location) {
  const path = getSafeAppPath(location, '')
  if (!path) return

  try {
    sessionStorage.setItem(LAST_APP_PATH_KEY, path)
  } catch {
    /* private mode / blocked storage */
  }
}

export function getLastAppPath(fallback = DEFAULT_POST_LOGIN_PATH) {
  try {
    return getSafeAppPath(sessionStorage.getItem(LAST_APP_PATH_KEY), fallback)
  } catch {
    return fallback
  }
}

export function getPostAuthRedirect(from, fallback = DEFAULT_POST_LOGIN_PATH) {
  const fromPath = getSafeAppPath(from, '')
  if (fromPath) return fromPath
  return getLastAppPath(fallback)
}
