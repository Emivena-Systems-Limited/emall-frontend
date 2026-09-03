/**
 * Context-aware back navigation for admin routes.
 * Tracks the previous in-app path and resolves explicit `location.state.returnTo` when present.
 */

let previousInternalPath = null
let currentInternalPath = null

export function isSafeInternalPath(value) {
  const path = String(value ?? '').trim()
  return (
    path.startsWith('/')
    && !path.startsWith('//')
    && !path.startsWith('/login')
    && !path.startsWith('/forgot-password')
    && !path.startsWith('/reset-password')
  )
}

export function getCurrentPath(location) {
  return `${location.pathname}${location.search ?? ''}`
}

export function syncNavigationHistory(location) {
  const next = getCurrentPath(location)

  if (currentInternalPath && currentInternalPath !== next && isSafeInternalPath(currentInternalPath)) {
    previousInternalPath = currentInternalPath
  }

  currentInternalPath = next
}

export function getPreviousInternalPath() {
  return previousInternalPath
}

const ROUTE_DESTINATIONS = [
  { test: /^\/dashboard$/, label: 'Dashboard', short: 'Command center' },
  { test: /^\/products\/pending$/, label: 'Pending products', short: 'Pending products' },
  { test: /^\/products$/, label: 'Products', short: 'All products' },
  { test: /^\/vendors\/[^/]+\/products$/, label: 'Store catalogue', short: 'Store catalogue' },
  { test: /^\/vendors\/[^/]+\/sales$/, label: 'Store sales', short: 'Store sales' },
  { test: /^\/vendors\/[^/]+$/, label: 'Vendor details', short: 'Vendor details' },
  { test: /^\/vendors$/, label: 'Vendor roster', short: 'Vendor roster' },
  { test: /^\/products\/[^/]+\/edit$/, label: 'Edit product', short: 'Edit product' },
  { test: /^\/products\/[^/]+$/, label: 'Product details', short: 'Product details' },
  { test: /^\/orders$/, label: 'Orders', short: 'All orders' },
  { test: /^\/coupons\/[^/]+\/usage$/, label: 'Coupon usage', short: 'Coupon usage' },
  { test: /^\/coupons\/[^/]+$/, label: 'Coupon details', short: 'Coupon details' },
  { test: /^\/coupons$/, label: 'Coupons', short: 'All coupons' },
  { test: /^\/users\/[^/]+$/, label: 'User details', short: 'User details' },
  { test: /^\/users$/, label: 'Users', short: 'All users' },
  { test: /^\/reviews\/[^/]+$/, label: 'Review details', short: 'Review details' },
  { test: /^\/reviews$/, label: 'Reviews', short: 'All reviews' },
  { test: /^\/inventory\/[^/]+$/, label: 'Stock record', short: 'Stock record' },
  { test: /^\/inventory$/, label: 'Inventory', short: 'All inventory' },
  { test: /^\/payments\/[^/]+$/, label: 'Payment details', short: 'Payment details' },
  { test: /^\/payments$/, label: 'Payments', short: 'All payments' },
  { test: /^\/brands\/[^/]+$/, label: 'Brand details', short: 'Brand details' },
  { test: /^\/brands$/, label: 'Brands', short: 'All brands' },
  { test: /^\/notifications\/[^/]+$/, label: 'Notification details', short: 'Notification details' },
  { test: /^\/notifications$/, label: 'Notifications', short: 'All notifications' },
  { test: /^\/categories$/, label: 'Categories', short: 'All categories' },
  { test: /^\/carts$/, label: 'Carts', short: 'All carts' },
  { test: /^\/wishlists$/, label: 'Wishlists', short: 'All wishlists' },
  { test: /^\/searches$/, label: 'Searches', short: 'All searches' },
  { test: /^\/profile$/, label: 'Profile', short: 'Profile' },
]

function getQueryAwareLabel(path) {
  const search = path.includes('?') ? path.slice(path.indexOf('?')) : ''
  if (search.includes('customerId=')) {
    return { label: 'Customer orders', short: 'Customer orders' }
  }
  return null
}

export function getDestinationMeta(path) {
  const fullPath = String(path ?? '').trim()
  const pathname = fullPath.split('?')[0]

  const queryMeta = getQueryAwareLabel(fullPath)
  if (queryMeta) return queryMeta

  for (const entry of ROUTE_DESTINATIONS) {
    if (entry.test.test(pathname)) {
      return { label: entry.label, short: entry.short }
    }
  }

  return null
}

export function resolveReturnTo(location, fallback) {
  const explicit = location?.state?.returnTo
  if (explicit && isSafeInternalPath(explicit)) {
    return explicit
  }

  const current = getCurrentPath(location)
  const previous = getPreviousInternalPath()

  if (previous && previous !== current && isSafeInternalPath(previous)) {
    return previous
  }

  return fallback
}

export function resolveReturnLabel(location, { fallbackLabel, returnTo, labelStyle = 'back' } = {}) {
  if (location?.state?.returnLabel) {
    return location.state.returnLabel
  }

  const meta = getDestinationMeta(returnTo)
  if (meta) {
    if (labelStyle === 'short') return meta.short
    return `Back to ${meta.label.toLowerCase()}`
  }

  return fallbackLabel
}

export function buildNavigationState(location, extra = {}) {
  return {
    returnTo: getCurrentPath(location),
    ...extra,
  }
}

export function mergeNavigationState(existingState = {}, overrides = {}) {
  return {
    returnTo: overrides.returnTo ?? existingState?.returnTo,
    returnLabel: overrides.returnLabel ?? existingState?.returnLabel,
    ...overrides,
  }
}
