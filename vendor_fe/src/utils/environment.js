import config from './Config'

function getOrigin(url) {
  try {
    return new URL(url).origin
  } catch {
    return ''
  }
}

export function getRootFrontendUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return getOrigin(config.frontend_url)
}

export function isLocalEnvironment() {
  if (typeof window === 'undefined') return false
  return window.location.origin === getOrigin(config.frontend_url)
}
