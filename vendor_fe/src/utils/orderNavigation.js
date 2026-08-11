/**
 * Preserve the orders list URL (e.g. /orders?customerId=…) when drilling into order detail flows.
 */

export function isOrdersListPath(pathname) {
  return pathname === '/orders'
}

export function resolveOrdersReturnTo(location) {
  if (location?.state?.returnTo) {
    return location.state.returnTo
  }

  if (isOrdersListPath(location?.pathname ?? '')) {
    return `${location.pathname}${location.search ?? ''}`
  }

  return '/orders'
}

export function getOrdersReturnLabel(returnTo = '/orders') {
  return String(returnTo).includes('customerId=') ? 'Back to customer orders' : 'Back to orders'
}

export function buildOrderNavigationState({ returnTo, listPayment } = {}) {
  const state = {}

  if (returnTo) state.returnTo = returnTo
  if (listPayment) state.listPayment = listPayment

  return Object.keys(state).length > 0 ? state : undefined
}

export function mergeOrderNavigationState(existingState = {}, overrides = {}) {
  return buildOrderNavigationState({
    returnTo: overrides.returnTo ?? existingState?.returnTo,
    listPayment: overrides.listPayment ?? existingState?.listPayment,
  })
}
