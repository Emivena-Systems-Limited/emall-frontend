export function countInventoryDrawerFilters({ vendorId = '' } = {}) {
  return [vendorId].filter(Boolean).length
}

export function getInventoryFilterChips({ vendorId = '', vendorName = '' } = {}) {
  if (!vendorId) return []
  return [{ key: 'vendor', label: vendorName || 'Selected store' }]
}
