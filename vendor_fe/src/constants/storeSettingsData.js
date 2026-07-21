import { EMPTY_STORE_SETTINGS } from './storeSettings'

export const MOCK_STORE_SETTINGS = null

export const DEV_STORE_SETTINGS = {
  general: {
    storeName: 'Accra Home & Office',
    tagline: 'Quality furniture and essentials for modern living',
    description:
      'We curate premium home and office products for Ghanaian professionals and families. From ergonomic chairs to smart storage solutions, every item is selected for quality and value.',
    email: 'hello@accrahome.com',
    phone: '+233 24 123 4567',
    address: '14 Ring Road East, Osu',
    city: 'Accra',
    region: 'Greater Accra',
    businessHours: 'Mon–Sat 9:00 AM – 6:00 PM',
    website: 'https://accrahome.com',
  },
  branding: {
    logoUrl: '',
    bannerUrl: '',
    primaryColor: '#c73b2d',
    accentColor: '#f97316',
  },
  shipping: {
    freeShippingThreshold: '500',
    standardFee: '25',
    expressFee: '45',
    processingDays: '2',
    deliveryRegions: ['Greater Accra', 'Ashanti', 'Central', 'Eastern'],
    pickupAvailable: true,
  },
  policies: {
    returnPolicy:
      'We accept returns within 14 days of delivery for unused items in original packaging. Refunds are processed within 5 business days of receiving the returned item.',
    shippingPolicy:
      'Orders are processed within 1–2 business days. Standard delivery within Accra takes 1–3 days. Regional deliveries may take 3–7 business days.',
    privacyPolicy:
      'We collect only the information necessary to fulfil your orders and improve your shopping experience. We never sell your personal data to third parties.',
    termsOfService:
      'By purchasing from our store, you agree to our return and shipping policies. Prices are listed in GHS and include applicable taxes unless stated otherwise.',
  },
  notifications: {
    newOrderEmail: true,
    lowStockEmail: true,
    newReviewEmail: true,
    newMessageEmail: true,
    weeklyReportEmail: true,
    marketingUpdates: false,
  },
}

export function getEmptyStoreSettings() {
  return structuredClone(EMPTY_STORE_SETTINGS)
}

export function isStoreConfigured(settings) {
  if (!settings?.general) return false
  return Boolean(settings.general.storeName?.trim())
}
