export function getCustomerInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

export function aggregatePurchasedItems(orderHistory) {
  const map = new Map()

  for (const order of orderHistory || []) {
    for (const item of order.items || []) {
      const key = item.productId || item.productName
      const existing = map.get(key)

      if (!existing) {
        map.set(key, {
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          image: item.image,
          totalQuantity: item.quantity,
          totalSpend: item.totalPrice,
          orderCount: 1,
          lastPurchasedAt: order.orderDate,
          orderNumbers: [order.orderNumber],
        })
        continue
      }

      existing.totalQuantity += item.quantity
      existing.totalSpend += item.totalPrice
      existing.orderCount += 1
      if (new Date(order.orderDate) > new Date(existing.lastPurchasedAt)) {
        existing.lastPurchasedAt = order.orderDate
      }
      if (!existing.orderNumbers.includes(order.orderNumber)) {
        existing.orderNumbers.push(order.orderNumber)
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend)
}

export function countUniqueProducts(orderHistory) {
  return aggregatePurchasedItems(orderHistory).length
}
