import { ORDER_DELIVERY_OPTIONS, ORDER_PAYMENT_OPTIONS } from '../constants/adminOrders'

function formatFilterDate(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function countOrderDrawerFilters({
  paymentStatus,
  deliveryStatus,
  vendorId,
  userId,
  startDate,
  endDate,
} = {}) {
  return [paymentStatus, deliveryStatus, vendorId, userId, startDate || endDate].filter(Boolean).length
}

export function getOrderFilterChips({
  paymentStatus,
  deliveryStatus,
  vendorId,
  vendorLabel,
  userId,
  userLabel,
  startDate,
  endDate,
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
  if (startDate || endDate) {
    const from = formatFilterDate(startDate)
    const to = formatFilterDate(endDate)
    const label = from && to ? `${from} – ${to}` : (from ? `From ${from}` : `Until ${to}`)
    chips.push({ key: 'dateRange', label })
  }
  return chips
}
