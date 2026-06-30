export function getUniqueOrderProducts(order) {
  if (!order?.items?.length) return []

  const seen = new Set()

  return order.items.filter((item) => {
    if (!item.productId || seen.has(item.productId)) return false
    seen.add(item.productId)
    return true
  })
}

export function getViewProductTarget(order) {
  const products = getUniqueOrderProducts(order)
  if (products.length === 0) return null

  if (products.length === 1) {
    return {
      type: 'direct',
      orderId: order.id,
      productId: products[0].productId,
    }
  }

  return {
    type: 'picker',
    orderId: order.id,
  }
}

export function buildViewProductPath(productId, orderId) {
  const params = new URLSearchParams()
  if (orderId) params.set('orderId', orderId)
  const query = params.toString()
  return `/products/${productId}/view${query ? `?${query}` : ''}`
}
