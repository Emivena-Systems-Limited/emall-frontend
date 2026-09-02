import {
  DEFAULT_VENDOR_FILTERS,
  JOINED_PRESETS,
  SALES_BANDS,
  VENDOR_KYC,
  VENDOR_PAGE_SIZE,
  VENDOR_STATUSES,
  getVendorKycMeta,
  getVendorStatusMeta,
} from '../constants/vendorsData'

const AVATAR_TONES = [
  'bg-rose-50 text-rose-700 ring-rose-100',
  'bg-sky-50 text-sky-800 ring-sky-100',
  'bg-violet-50 text-violet-800 ring-violet-100',
  'bg-emerald-50 text-emerald-800 ring-emerald-100',
  'bg-amber-50 text-amber-800 ring-amber-100',
  'bg-teal-50 text-teal-800 ring-teal-100',
]

export function toggleFilterValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function getStoreInitials(store) {
  return String(store ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function getVendorAvatarTone(id) {
  const seed = String(id ?? '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return AVATAR_TONES[seed % AVATAR_TONES.length]
}

export function formatJoinedDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatJoinedRelative(value, now = new Date()) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const days = Math.max(0, Math.round((now.getTime() - date.getTime()) / 86400000))
  if (days < 1) return 'Joined today'
  if (days === 1) return 'Joined yesterday'
  if (days < 30) return `Joined ${days} days ago`
  if (days < 365) {
    const months = Math.max(1, Math.round(days / 30))
    return `Joined ${months} month${months === 1 ? '' : 's'} ago`
  }
  const years = Math.max(1, Math.round(days / 365))
  return `Joined ${years} year${years === 1 ? '' : 's'} ago`
}

function matchesJoined(vendor, joined, now) {
  if (joined === 'any') return true
  const joinedAt = new Date(vendor.joinedAt).getTime()
  if (Number.isNaN(joinedAt)) return false
  const days = (now.getTime() - joinedAt) / 86400000
  if (joined === '30') return days <= 30
  if (joined === '90') return days <= 90
  if (joined === 'year') return new Date(vendor.joinedAt).getFullYear() === now.getFullYear()
  return true
}

function matchesSalesBand(vendor, salesBand) {
  if (salesBand === 'any') return true
  if (vendor.sales30d == null) return false
  const sales = Number(vendor.sales30d) || 0
  if (salesBand === 'under_50k') return sales < 50000
  if (salesBand === '50_200') return sales >= 50000 && sales < 200000
  if (salesBand === 'over_200') return sales >= 200000
  return true
}

export function filterVendors(vendors, filters, now = new Date()) {
  const query = filters.query.trim().toLowerCase()

  const next = vendors.filter((vendor) => {
    if (query) {
      const haystack = `${vendor.store} ${vendor.businessName} ${vendor.tradingName} ${vendor.owner} ${vendor.email} ${vendor.region} ${vendor.city} ${vendor.category}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (filters.statuses.length && !filters.statuses.includes(vendor.status)) return false
    if (filters.kyc.length && !filters.kyc.includes(vendor.kyc)) return false
    if (filters.regions.length && !filters.regions.includes(vendor.region)) return false
    if (!matchesJoined(vendor, filters.joined, now)) return false
    if (!matchesSalesBand(vendor, filters.salesBand)) return false
    return true
  })

  next.sort((a, b) => {
    if (filters.sort === 'oldest') return new Date(a.joinedAt) - new Date(b.joinedAt)
    if (filters.sort === 'listings_desc') return (Number(b.listings) || 0) - (Number(a.listings) || 0)
    if (filters.sort === 'sales_desc') return (Number(b.sales30d) || 0) - (Number(a.sales30d) || 0)
    if (filters.sort === 'name') return a.store.localeCompare(b.store)
    return new Date(b.joinedAt) - new Date(a.joinedAt)
  })

  return next
}

export function paginateVendors(vendors, page, pageSize = VENDOR_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(vendors.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  return {
    page: safePage,
    totalPages,
    items: vendors.slice(start, start + pageSize),
    rangeStart: vendors.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, vendors.length),
  }
}

export function countVendorDrawerFilters(filters = DEFAULT_VENDOR_FILTERS) {
  return [
    filters.statuses.length > 0,
    filters.kyc.length > 0,
    filters.regions.length > 0,
    filters.joined !== 'any',
    filters.salesBand !== 'any',
  ].filter(Boolean).length
}

export function countAllVendorFilters(filters = DEFAULT_VENDOR_FILTERS) {
  return countVendorDrawerFilters(filters) + (filters.query.trim() ? 1 : 0)
}

export function getVendorFilterChips(filters = DEFAULT_VENDOR_FILTERS) {
  const chips = []

  if (filters.query.trim()) {
    chips.push({ key: 'query', label: `Search: ${filters.query.trim()}` })
  }

  filters.statuses.forEach((status) => {
    chips.push({ key: `status:${status}`, label: getVendorStatusMeta(status).label })
  })

  filters.kyc.forEach((kyc) => {
    chips.push({ key: `kyc:${kyc}`, label: `KYC · ${getVendorKycMeta(kyc).label}` })
  })

  filters.regions.forEach((region) => {
    chips.push({ key: `region:${region}`, label: region })
  })

  if (filters.joined !== 'any') {
    const preset = JOINED_PRESETS.find((item) => item.key === filters.joined)
    chips.push({ key: 'joined', label: preset?.label ?? 'Joined' })
  }

  if (filters.salesBand !== 'any') {
    const band = SALES_BANDS.find((item) => item.key === filters.salesBand)
    chips.push({ key: 'sales', label: band?.label ?? 'Sales' })
  }

  return chips
}

export function removeVendorFilterChip(filters, chipKey) {
  if (chipKey === 'query') return { ...filters, query: '' }
  if (chipKey === 'joined') return { ...filters, joined: 'any' }
  if (chipKey === 'sales') return { ...filters, salesBand: 'any' }
  if (chipKey.startsWith('status:')) {
    return { ...filters, statuses: filters.statuses.filter((item) => item !== chipKey.slice(7)) }
  }
  if (chipKey.startsWith('kyc:')) {
    return { ...filters, kyc: filters.kyc.filter((item) => item !== chipKey.slice(4)) }
  }
  if (chipKey.startsWith('region:')) {
    return { ...filters, regions: filters.regions.filter((item) => item !== chipKey.slice(7)) }
  }
  return filters
}

export function getVendorSummary(vendors) {
  const approved = vendors.filter((vendor) => vendor.status === 'approved').length
  const pending = vendors.filter((vendor) => vendor.status === 'pending').length
  const rejected = vendors.filter((vendor) => vendor.status === 'rejected').length
  const suspended = vendors.filter((vendor) => vendor.status === 'suspended').length

  return {
    total: vendors.length,
    approved,
    pending,
    rejected,
    suspended,
    active: approved,
    pendingReview: pending,
  }
}

export function getActiveStatusTab(statuses) {
  if (!statuses.length) return 'all'
  if (statuses.length === 1) {
    const match = VENDOR_STATUSES.find((item) => item.key === statuses[0])
    return match?.key ?? null
  }
  return null
}

export { VENDOR_STATUSES, VENDOR_KYC }
