export const SETTINGS_TABS = {
  general: { label: 'General', description: 'Store name, contact & hours' },
  branding: { label: 'Branding', description: 'Logo, banner & colours' },
  shipping: { label: 'Shipping', description: 'Delivery zones & fees' },
  policies: { label: 'Policies', description: 'Returns, privacy & terms' },
  notifications: { label: 'Notifications', description: 'Email & alert preferences' },
}

export const EMPTY_STORE_SETTINGS = {
  general: {
    storeName: '',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    businessHours: '',
    website: '',
  },
  branding: {
    logoUrl: '',
    bannerUrl: '',
    primaryColor: '#c73b2d',
    accentColor: '#f97316',
  },
  shipping: {
    freeShippingThreshold: '',
    standardFee: '',
    expressFee: '',
    processingDays: '',
    deliveryRegions: [],
    pickupAvailable: false,
  },
  policies: {
    returnPolicy: '',
    shippingPolicy: '',
    privacyPolicy: '',
    termsOfService: '',
  },
  notifications: {
    newOrderEmail: true,
    lowStockEmail: true,
    newReviewEmail: true,
    newMessageEmail: true,
    weeklyReportEmail: false,
    marketingUpdates: false,
  },
}

export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Eastern',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Western North',
  'Oti',
  'Savannah',
  'North East',
]
