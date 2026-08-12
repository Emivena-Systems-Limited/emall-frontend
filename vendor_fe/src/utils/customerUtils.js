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

export function mapVendorOrdersToCustomerHistory(orders = []) {
  return orders.map((order) => ({
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderDate: order.orderDate,
    productsPurchased: (order.items ?? []).map((item) => item.productName).filter(Boolean),
    orderStatus: order.orderStatus,
    orderTotal: order.totalAmount,
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      image: item.image,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
  }))
}

export function enrichCustomerWithOrderHistory(customer, orderHistory = []) {
  if (!customer) return null

  const sortedHistory = [...orderHistory].sort(
    (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
  )

  return {
    ...customer,
    totalOrders: sortedHistory.length || customer.totalOrders,
    orderHistory: sortedHistory,
    purchasedItems: aggregatePurchasedItems(sortedHistory),
    firstPurchaseDate: sortedHistory.at(-1)?.orderDate ?? customer.firstPurchaseDate,
    lastOrderDate: sortedHistory[0]?.orderDate ?? customer.lastOrderDate,
  }
}

export function formatOrderProductsDisplay(products, maxVisible = 1) {
  const names = (products || []).filter(Boolean)

  if (names.length === 0) {
    return { primary: '—', extra: 0, all: [] }
  }

  if (names.length <= maxVisible) {
    return { primary: names.join(', '), extra: 0, all: names }
  }

  return {
    primary: names[0],
    extra: names.length - maxVisible,
    all: names,
  }
}
