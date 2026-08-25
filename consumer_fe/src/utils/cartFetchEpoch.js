let cartFetchEpoch = 0

/** Bump when the shopper changes cart membership so in-flight GET /cart cannot restore deleted lines. */
export function bumpCartFetchEpoch() {
  cartFetchEpoch += 1
  return cartFetchEpoch
}

export function getCartFetchEpoch() {
  return cartFetchEpoch
}

export function isCurrentCartFetchEpoch(epoch) {
  return epoch === cartFetchEpoch
}
