import { isSafeInternalPath } from './reviewNavigation'

const ANALYTICS_PATH = '/analytics'

export function buildViewProductFromAnalyticsPath(productId, returnTo = ANALYTICS_PATH) {
  const id = String(productId ?? '').trim()
  if (!id) return ANALYTICS_PATH

  const params = new URLSearchParams({ from: 'analytics' })
  const safeReturnTo = isSafeInternalPath(returnTo) ? returnTo : ANALYTICS_PATH
  params.set('returnTo', safeReturnTo)
  return `/products/${encodeURIComponent(id)}/view?${params}`
}

export function resolveAnalyticsReturnTo(searchParams, location, fallback = ANALYTICS_PATH) {
  const fromQuery = searchParams?.get?.('from')
  const fromState = location?.state?.from
  const isFromAnalytics = fromQuery === 'analytics' || fromState === 'analytics'
  if (!isFromAnalytics) return null

  const returnTo = searchParams?.get?.('returnTo') || location?.state?.returnTo || fallback
  return isSafeInternalPath(returnTo) ? returnTo : fallback
}
