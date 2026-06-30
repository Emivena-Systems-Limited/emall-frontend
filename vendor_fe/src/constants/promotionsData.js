import { normalizeApplicationType } from '../utils/promotionPayload'

export const MOCK_VENDOR_PROMOTIONS = [
  {
    id: 'promo-001',
    name: 'Weekend Flash Sale',
    shortDescription: '20% off electronics for 48 hours.',
    type: 'flash_sales',
    status: 'active',
    discountType: 'percentage',
    discountValue: 20,
    maximumDiscount: 150,
    startDate: '2026-06-28T00:00:00',
    endDate: '2026-06-30T23:59:00',
    applicationType: 'categories',
    appliesToLabels: ['Electronics'],
    categoryIds: ['electronics'],
    productIds: [],
    orders: 84,
    revenue: 18420,
  },
  {
    id: 'promo-002',
    name: 'Today\'s Top Pick',
    shortDescription: 'Daily spotlight deal on home essentials.',
    type: 'todays_deals',
    status: 'active',
    discountType: 'fixed_amount',
    discountValue: 25,
    maximumDiscount: 25,
    startDate: '2026-06-30T00:00:00',
    endDate: '2026-06-30T23:59:00',
    applicationType: 'specific_products',
    appliesToLabels: ['Desk LED Lamp', 'Portable Blender'],
    categoryIds: [],
    productIds: ['prod-4', 'prod-5'],
    orders: 31,
    revenue: 4620,
  },
  {
    id: 'promo-003',
    name: 'Summer Clearance',
    shortDescription: 'Clear last season fashion inventory.',
    type: 'clearance',
    status: 'scheduled',
    discountType: 'percentage',
    discountValue: 40,
    maximumDiscount: 200,
    startDate: '2026-07-01T00:00:00',
    endDate: '2026-07-15T23:59:00',
    applicationType: 'categories',
    appliesToLabels: ['Fashion'],
    categoryIds: ['fashion'],
    productIds: [],
    orders: 0,
    revenue: 0,
  },
  {
    id: 'promo-004',
    name: 'Free Shipping Weekend',
    shortDescription: 'Free delivery on all orders above GH₵ 100.',
    type: 'flash_sales',
    status: 'paused',
    discountType: 'free_shipping',
    discountValue: 0,
    maximumDiscount: 0,
    startDate: '2026-06-20T00:00:00',
    endDate: '2026-06-22T23:59:00',
    applicationType: 'all_products',
    application_type: 'all_products',
    appliesToLabels: ['All Products'],
    categoryIds: [],
    productIds: [],
    orders: 56,
    revenue: 9800,
  },
  {
    id: 'promo-005',
    name: 'BOGO Sneakers',
    shortDescription: 'Buy one pair, get one 50% off.',
    type: 'todays_deals',
    status: 'expired',
    discountType: 'bogo',
    discountValue: 50,
    maximumDiscount: 0,
    startDate: '2026-05-01T00:00:00',
    endDate: '2026-05-31T23:59:00',
    applicationType: 'specific_products',
    appliesToLabels: ['Running Sneakers'],
    categoryIds: [],
    productIds: ['prod-3'],
    orders: 42,
    revenue: 7140,
  },
  {
    id: 'promo-006',
    name: 'Mid-Year Mega Sale',
    shortDescription: 'Store-wide discount draft for July.',
    type: 'flash_sales',
    status: 'draft',
    discountType: 'percentage',
    discountValue: 15,
    maximumDiscount: 100,
    startDate: '2026-07-10T00:00:00',
    endDate: '2026-07-20T23:59:00',
    applicationType: 'all_products',
    application_type: 'all_products',
    appliesToLabels: ['All Products'],
    categoryIds: [],
    productIds: [],
    orders: 0,
    revenue: 0,
  },
  {
    id: 'promo-007',
    name: 'Beauty Bundle Deal',
    shortDescription: 'Cancelled promotion for beauty category.',
    type: 'clearance',
    status: 'cancelled',
    discountType: 'percentage',
    discountValue: 30,
    maximumDiscount: 80,
    startDate: '2026-04-01T00:00:00',
    endDate: '2026-04-30T23:59:00',
    applicationType: 'categories',
    appliesToLabels: ['Beauty & Personal Care'],
    categoryIds: ['beauty'],
    productIds: [],
    orders: 12,
    revenue: 1560,
  },
  {
    id: 'promo-008',
    name: 'Morning Flash Drop',
    shortDescription: 'Early bird flash sale on gadgets.',
    type: 'flash_sales',
    status: 'scheduled',
    discountType: 'percentage',
    discountValue: 18,
    maximumDiscount: 120,
    startDate: '2026-07-02T06:00:00',
    endDate: '2026-07-02T12:00:00',
    applicationType: 'categories',
    appliesToLabels: ['Electronics'],
    categoryIds: ['electronics'],
    productIds: [],
    orders: 0,
    revenue: 0,
  },
  {
    id: 'promo-009',
    name: 'Clearance Corner',
    shortDescription: 'Deep discounts on slow-moving home items.',
    type: 'clearance',
    status: 'active',
    discountType: 'percentage',
    discountValue: 35,
    maximumDiscount: 250,
    startDate: '2026-06-15T00:00:00',
    endDate: '2026-07-31T23:59:00',
    applicationType: 'categories',
    appliesToLabels: ['Home & Living'],
    categoryIds: ['home-living'],
    productIds: [],
    orders: 27,
    revenue: 5940,
  },
  {
    id: 'promo-010',
    name: 'Watch Wednesday',
    shortDescription: 'Weekly deal on smart watches.',
    type: 'todays_deals',
    status: 'scheduled',
    discountType: 'fixed_amount',
    discountValue: 50,
    maximumDiscount: 50,
    startDate: '2026-07-03T00:00:00',
    endDate: '2026-07-03T23:59:00',
    applicationType: 'specific_products',
    appliesToLabels: ['Smart Watch Series 4'],
    categoryIds: [],
    productIds: ['prod-2'],
    orders: 0,
    revenue: 0,
  },
  {
    id: 'promo-011',
    name: 'Earbuds Launch Promo',
    shortDescription: 'Launch discount on wireless earbuds.',
    type: 'flash_sales',
    status: 'expired',
    discountType: 'percentage',
    discountValue: 10,
    maximumDiscount: 50,
    startDate: '2026-03-01T00:00:00',
    endDate: '2026-03-15T23:59:00',
    applicationType: 'specific_products',
    appliesToLabels: ['Wireless Earbuds Pro'],
    categoryIds: [],
    productIds: ['prod-1'],
    orders: 68,
    revenue: 12240,
  },
  {
    id: 'promo-012',
    name: 'Holiday Prep Draft',
    shortDescription: 'Draft promotion for holiday season.',
    type: 'clearance',
    status: 'draft',
    discountType: 'percentage',
    discountValue: 25,
    maximumDiscount: 150,
    startDate: '2026-12-01T00:00:00',
    endDate: '2026-12-31T23:59:00',
    applicationType: 'all_products',
    application_type: 'all_products',
    appliesToLabels: ['All Products'],
    categoryIds: [],
    productIds: [],
    orders: 0,
    revenue: 0,
  },
]

function normalizeStoredPromotion(promotion) {
  if (!promotion) return promotion

  const applicationType = normalizeApplicationType(
    promotion.applicationType ?? promotion.application_type ?? promotion.appliesTo,
  )

  return {
    ...promotion,
    applicationType,
    application_type: applicationType,
  }
}

let vendorPromotions = MOCK_VENDOR_PROMOTIONS.map(normalizeStoredPromotion)

export function getVendorPromotions() {
  return vendorPromotions
}

export function saveVendorPromotion(promotion) {
  const normalized = normalizeStoredPromotion(promotion)
  const index = vendorPromotions.findIndex((entry) => entry.id === normalized.id)
  if (index >= 0) {
    vendorPromotions[index] = normalized
  } else {
    vendorPromotions = [normalized, ...vendorPromotions]
  }
}

export function removeVendorPromotion(promotionId) {
  vendorPromotions = vendorPromotions.filter((entry) => entry.id !== promotionId)
}

export function getPromotionById(promotionId) {
  const promotion = vendorPromotions.find((entry) => entry.id === promotionId) ?? null
  return normalizeStoredPromotion(promotion)
}

export function getPromotionCatalogSummary(promotions) {
  return {
    total: promotions.length,
    active: promotions.filter((p) => p.status === 'active').length,
    scheduled: promotions.filter((p) => p.status === 'scheduled').length,
    expired: promotions.filter((p) => p.status === 'expired').length,
    todaysDeals: promotions.filter((p) => p.type === 'todays_deals').length,
    flashSales: promotions.filter((p) => p.type === 'flash_sales').length,
    clearance: promotions.filter((p) => p.type === 'clearance').length,
  }
}

export function duplicatePromotionRecord(promotion) {
  const copyId = `promo-${Date.now()}`
  return {
    ...promotion,
    id: copyId,
    name: `${promotion.name} (Copy)`,
    status: 'draft',
    orders: 0,
    revenue: 0,
  }
}

export function createEmptyPromotion(type = 'flash_sales') {
  return {
    id: '',
    name: '',
    shortDescription: '',
    type,
    status: 'draft',
    discountType: 'percentage',
    discountValue: '',
    maximumDiscount: '',
    startDate: '',
    endDate: '',
    applicationType: 'all_products',
    application_type: 'all_products',
    appliesToLabels: ['All Products'],
    categoryIds: [],
    productIds: [],
    orders: 0,
    revenue: 0,
  }
}
