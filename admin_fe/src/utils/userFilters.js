import { USER_ACTIVITY_FILTERS, USER_PHONE_FILTERS } from '../constants/adminUsers'

export function countUserDrawerFilters({
  region = '',
  district = '',
  city = '',
  phoneVerified = '',
  activity = '',
} = {}) {
  return [region, district, city, phoneVerified, activity].filter(Boolean).length
}

export function getUserFilterChips({
  region = '',
  district = '',
  city = '',
  phoneVerified = '',
  activity = '',
} = {}) {
  const chips = []
  if (region) chips.push({ key: 'region', label: region })
  if (district) chips.push({ key: 'district', label: district })
  if (city) chips.push({ key: 'city', label: city })
  if (phoneVerified) {
    const option = USER_PHONE_FILTERS.find((item) => item.key === phoneVerified)
    chips.push({ key: 'phoneVerified', label: option?.label || 'Phone' })
  }
  if (activity) {
    const option = USER_ACTIVITY_FILTERS.find((item) => item.key === activity)
    chips.push({ key: 'activity', label: option?.label || 'Activity' })
  }
  return chips
}

export function toUserPhoneVerifiedParam(value) {
  if (value === 'verified') return 1
  if (value === 'unverified') return 0
  return ''
}

export function toUserHasOrdersParam(value) {
  if (value === 'with_orders') return 1
  if (value === 'no_orders') return 0
  return ''
}

export function uniqueSortedLabels(values, selected = '') {
  const set = new Set()
  const extra = String(selected ?? '').trim()
  if (extra) set.add(extra)
  values.forEach((value) => {
    const text = String(value ?? '').trim()
    if (text) set.add(text)
  })
  return [...set].sort((left, right) => left.localeCompare(right))
}
