export function getUniqueOrderProducts(order) {
  if (order?.items?.length) {
    const seen = new Set()

    const fromItems = order.items.filter((item) => {
      if (!item.productId || seen.has(item.productId)) return false
      seen.add(item.productId)
      return true
    })

    if (fromItems.length) return fromItems
  }

  if (order?.productId) {
    return [{
      productId: order.productId,
      productName: order.productName,
    }]
  }

  return []
}

export function getViewProductTarget(order) {
  const products = getUniqueOrderProducts(order)
  if (products.length === 0) return null

  const orderId = order.orderId || order.id

  if (products.length === 1) {
    return {
      type: 'direct',
      orderId,
      productId: products[0].productId,
    }
  }

  return {
    type: 'picker',
    orderId,
  }
}

export function buildViewProductPath(productId, orderId) {
  const params = new URLSearchParams()
  if (orderId) params.set('orderId', orderId)
  const query = params.toString()
  return `/products/${productId}/view${query ? `?${query}` : ''}`
}
