export function isSafeInternalPath(value) {
  const path = String(value ?? '').trim()
  return path.startsWith('/') && !path.startsWith('//')
}

export function getProductReviewsPath(productId) {
  return `/reviews/products/${encodeURIComponent(String(productId))}`
}

export function buildViewProductFromReviewsPath(productId, returnTo) {
  const params = new URLSearchParams({ from: 'reviews' })
  const safeReturnTo = isSafeInternalPath(returnTo) ? returnTo : getProductReviewsPath(productId)
  params.set('returnTo', safeReturnTo)
  return `/products/${productId}/view?${params}`
}

export function resolveReviewsReturnTo(searchParams, location, fallback = '/reviews') {
  const fromQuery = searchParams?.get?.('from')
  const fromState = location?.state?.from
  const isFromReviews = fromQuery === 'reviews' || fromState === 'reviews'
  if (!isFromReviews) return null

  const returnTo = searchParams?.get?.('returnTo') || location?.state?.returnTo || fallback
  return isSafeInternalPath(returnTo) ? returnTo : fallback
}
