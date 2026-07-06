const GUEST_CART_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Guest-Cart-Id header must always be the client UUID from POST /api/cart. */
export function isValidGuestCartId(value) {
  const id = String(value ?? '').trim()
  return GUEST_CART_UUID_RE.test(id)
}

/** Client-generated UUID used to register a guest cart with the backend. */
export function generateGuestCartId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function resolveGuestCartId(preferredId, fallbackId) {
  const preferred = String(preferredId ?? '').trim()
  if (isValidGuestCartId(preferred)) return preferred

  const fallback = String(fallbackId ?? '').trim()
  if (isValidGuestCartId(fallback)) return fallback

  return null
}

/** Read the persisted guest UUID or throw before guest cart API calls. */
export function requireGuestCartId(explicitId) {
  const id = String(explicitId ?? '').trim()
  if (isValidGuestCartId(id)) return id

  return null
}
