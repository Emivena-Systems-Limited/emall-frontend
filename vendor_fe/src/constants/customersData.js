import { MOCK_VENDOR_ORDERS } from './ordersData'

function slugifyEmail(email) {
  return email.split('@')[0].replace(/[^a-z0-9]+/gi, '-').toLowerCase()
}

function buildCustomersFromOrders(orders) {
  const map = new Map()

  for (const order of orders) {
    const key = order.customer.email.toLowerCase()
    const productsPurchased = order.items.map((item) => item.productName)
    const historyEntry = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      productsPurchased,
      orderStatus: order.orderStatus,
    }

    if (!map.has(key)) {
      map.set(key, {
        id: `cust-${slugifyEmail(order.customer.email)}`,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        address: order.delivery.address,
        city: order.delivery.city,
        region: order.delivery.region,
        totalOrders: 0,
        totalSpend: 0,
        firstPurchaseDate: order.orderDate,
        lastOrderDate: order.orderDate,
        orderHistory: [],
        reviews: [],
      })
    }

    const customer = map.get(key)
    customer.totalOrders += 1
    customer.totalSpend += order.totalAmount
    customer.orderHistory.push(historyEntry)

    if (new Date(order.orderDate) < new Date(customer.firstPurchaseDate)) {
      customer.firstPurchaseDate = order.orderDate
    }
    if (new Date(order.orderDate) > new Date(customer.lastOrderDate)) {
      customer.lastOrderDate = order.orderDate
    }

    customer.address = order.delivery.address
    customer.city = order.delivery.city
    customer.region = order.delivery.region
  }

  return Array.from(map.values()).map((customer) => ({
    ...customer,
    orderHistory: customer.orderHistory.sort(
      (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
    ),
  }))
}

const REVIEW_SEEDS = {
  'ama.mensah@example.com': [
    {
      id: 'rev-001',
      orderId: 'ORD-1048',
      rating: 5,
      comment: 'Fast delivery and the earbuds work perfectly. Will order again.',
      date: '2026-06-17T10:00:00',
    },
  ],
  'efua.adjei@example.com': [
    {
      id: 'rev-002',
      orderId: 'ORD-1046',
      rating: 4,
      comment: 'Sneakers fit well. Packaging could be sturdier.',
      date: '2026-06-16T09:30:00',
    },
  ],
  'abena.k@example.com': [
    {
      id: 'rev-003',
      orderId: 'ORD-1044',
      rating: 5,
      comment: 'Desk lamp arrived in great condition. Very happy with the purchase.',
      date: '2026-06-15T14:20:00',
    },
  ],
  'daniel.asare@example.com': [
    {
      id: 'rev-004',
      orderId: 'ORD-1040',
      rating: 3,
      comment: 'Products are good but delivery took longer than expected.',
      date: '2026-06-12T11:45:00',
    },
  ],
}

function attachReviews(customers) {
  return customers.map((customer) => ({
    ...customer,
    reviews: REVIEW_SEEDS[customer.email.toLowerCase()] ?? [],
  }))
}

export const MOCK_VENDOR_CUSTOMERS = attachReviews(buildCustomersFromOrders(MOCK_VENDOR_ORDERS))

export function getCustomerById(customerId) {
  return MOCK_VENDOR_CUSTOMERS.find((customer) => customer.id === customerId) ?? null
}

export function getCustomerSummaryFromCatalog(customers) {
  const now = new Date('2026-06-30T12:00:00')
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    total: customers.length,
    newThisMonth: customers.filter(
      (customer) => new Date(customer.firstPurchaseDate) >= monthStart,
    ).length,
    reviewsReceived: customers.reduce((sum, customer) => sum + customer.reviews.length, 0),
  }
}
