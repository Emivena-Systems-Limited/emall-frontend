import config from './Config'

function getOrigin(url) {
  try {
    return new URL(url).origin
  } catch {
    return ''
  }
}

function isLocalHostname(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

export function isLocalEnvironment() {
  if (import.meta.env.DEV) return true
  if (typeof window === 'undefined') return false
  if (isLocalHostname(window.location.hostname)) return true
  return window.location.origin === getOrigin(config.frontend_url)
}
