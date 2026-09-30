import { canCancelOrder } from '../constants/adminOrders'

function text(...values) {
  for (const value of values) {
    if (value == null || typeof value === 'object') continue
    const next = String(value).trim()
    if (next) return next
  }
  return ''
}

function grantedPermissions(user) {
  const source = user?.permissions ?? user?.abilities ?? user?.permission_names
  if (source == null || source === '') return null
  const list = Array.isArray(source) ? source : String(source).split(',')
  const granted = new Set(list.map((item) => String(item).trim().toLowerCase()).filter(Boolean))
  return granted.size ? granted : null
}

function isUnrestricted(granted) {
  return [...granted].some((item) => (
    item === '*'
    || item === 'all'
    || item === 'admin'
    || item === 'superadmin'
    || item === 'super_admin'
  ))
}

function allows(user, keys) {
  const granted = grantedPermissions(user)
  if (!granted) return true
  if (isUnrestricted(granted)) return true
  return keys.some((key) => granted.has(key.toLowerCase()))
}

export function resolveOrderPaymentId(order) {
  const payment = order?.payment && typeof order.payment === 'object' ? order.payment : {}
  const raw = order?.raw && typeof order.raw === 'object' ? order.raw : {}
  const rawPayment = raw.payment && typeof raw.payment === 'object' ? raw.payment : {}

  return text(
    payment.id,
    payment.payment_id,
    raw.payment_id,
    rawPayment.id,
    rawPayment.payment_id,
  )
}

export function orderPaymentPath(order) {
  const paymentId = resolveOrderPaymentId(order)
  if (paymentId) return `/payments/${encodeURIComponent(paymentId)}`
  const query = text(order?.orderNumber, order?.orderId)
  return query ? `/payments?search=${encodeURIComponent(query)}` : '/payments'
}

function isRefunded(order) {
  return order?.paymentStatus === 'refunded'
    || order?.orderStatus === 'refunded'
    || order?.deliveryStatus === 'refunded'
}

function hasShipment(order) {
  const status = String(order?.deliveryStatus ?? '')
  if (status === 'shipped' || status === 'delivered') return true
  return Boolean(order?.delivery?.trackingNumber || order?.delivery?.trackingUrl)
}

export function getOrderMenuState(order, user) {
  return {
    viewOrder: allows(user, ['orders', 'orders.view', 'orders.read', 'view_orders', 'manage_orders']),
    viewCustomer: Boolean(order?.userId) && allows(user, ['users', 'users.view', 'customers.view', 'view_users', 'manage_users']),
    viewVendor: Boolean(order?.vendorId) && allows(user, ['vendors', 'vendors.view', 'view_vendors', 'manage_vendors']),
    viewPayment: allows(user, ['payments', 'payments.view', 'view_payments', 'manage_payments']),
    viewShipment: hasShipment(order) && allows(user, ['orders', 'orders.view', 'shipments.view', 'view_orders', 'manage_orders']),
    viewRefund: isRefunded(order) && allows(user, ['payments', 'payments.view', 'refunds.view', 'view_payments', 'manage_payments']),
    cancelOrder: canCancelOrder(order) && allows(user, ['orders.cancel', 'orders.update', 'cancel_orders', 'manage_orders']),
  }
}
