import { ORDER_DELIVERY_OPTIONS, ORDER_PAYMENT_OPTIONS } from '../constants/adminOrders'

export function countOrderDrawerFilters({ paymentStatus, deliveryStatus, vendorId, userId } = {}) {
  return [paymentStatus, deliveryStatus, vendorId, userId].filter(Boolean).length
}

export function getOrderFilterChips({
  paymentStatus,
  deliveryStatus,
  vendorId,
  vendorLabel,
  userId,
  userLabel,
} = {}) {
  const chips = []
  if (paymentStatus) {
    const option = ORDER_PAYMENT_OPTIONS.find((item) => item.key === paymentStatus)
    chips.push({ key: 'paymentStatus', label: option?.label || 'Payment' })
  }
  if (deliveryStatus) {
    const option = ORDER_DELIVERY_OPTIONS.find((item) => item.key === deliveryStatus)
    chips.push({ key: 'deliveryStatus', label: option?.label || 'Delivery' })
  }
  if (vendorId) chips.push({ key: 'vendorId', label: vendorLabel || 'Selected store' })
  if (userId) chips.push({ key: 'userId', label: userLabel || 'Selected shopper' })
  return chips
}
