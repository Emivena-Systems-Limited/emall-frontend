const LANDING_PAGE_CACHE_KEY = 'emall:landing-page-home'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readLandingPageCache() {
  if (!canUseStorage()) return undefined

  try {
    const cached = window.localStorage.getItem(LANDING_PAGE_CACHE_KEY)
    return cached ? JSON.parse(cached) : undefined
  } catch {
    return undefined
  }
}

export function writeLandingPageCache(data) {
  if (!canUseStorage() || !data) return

  try {
    window.localStorage.setItem(LANDING_PAGE_CACHE_KEY, JSON.stringify(data))
  } catch {
    // Cache writes are best effort only.
  }
}
