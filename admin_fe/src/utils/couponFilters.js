import { COUPON_TYPE_FILTERS } from '../constants/coupons'

export function countCouponDrawerFilters({ type = '', vendorId = '' } = {}) {
  return [type, vendorId].filter(Boolean).length
}

export function getCouponFilterChips({
  type = '',
  vendorId = '',
  vendorName = '',
} = {}) {
  const chips = []
  if (type) {
    const option = COUPON_TYPE_FILTERS.find((item) => item.key === type)
    chips.push({ key: 'type', label: option?.label || 'Offer type' })
  }
  if (vendorId) {
    chips.push({ key: 'vendor', label: vendorName || 'Selected store' })
  }
  return chips
}

export function toCouponActiveParam(status) {
  if (status === 'live') return 1
  if (status === 'paused') return 0
  return ''
}
