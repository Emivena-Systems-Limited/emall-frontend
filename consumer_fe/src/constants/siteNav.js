export const SITE_NAME = 'EZMall'

const vendorAppUrl = String(import.meta.env.VITE_VENDOR_APP_URL || '').trim().replace(/\/$/, '')
const adminAppUrl = String(import.meta.env.VITE_ADMIN_APP_URL || '').trim().replace(/\/$/, '')

export const footerColumns = [
  {
    title: 'DEALS',
    links: [
      { label: 'Flash Deals', href: '/products/flash-sales' },
      { label: 'Promotions', href: '/promotions' },
      { label: 'New Arrivals', href: '/#new-arrivals' },
      { label: 'Best Sellers', href: '/products/best-sellers' },
      { label: 'All Products', href: '/products' },
    ],
  },
  {
    title: 'HELP',
    links: [
      { label: 'Track My Order', href: '/account/orders' },
      { label: 'Returns & Refunds', href: '/account/support' },
      { label: 'Shipping Info', href: '/account/support' },
      { label: 'FAQs', href: '/account/support' },
      { label: 'Contact Support', href: '/account/support' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      {
        label: 'Sell on eezmall',
        href: vendorAppUrl ? `${vendorAppUrl}/signup` : '/stores',
        external: Boolean(vendorAppUrl),
      },
      { label: 'All Categories', href: '/categories' },
      { label: 'Promotions', href: '/promotions' },
    ],
  },
  {
    title: 'VENDORS & ADMIN',
    links: [
      {
        label: 'Become a Vendor',
        href: vendorAppUrl ? `${vendorAppUrl}/signup` : '/stores',
        external: Boolean(vendorAppUrl),
      },
      {
        label: 'Vendor Sign in',
        href: vendorAppUrl ? `${vendorAppUrl}/login` : '/login',
        external: Boolean(vendorAppUrl),
      },
      {
        label: 'Admin',
        href: adminAppUrl ? `${adminAppUrl}/login` : '/login',
        external: Boolean(adminAppUrl),
      },
    ],
  },
]

export const socialLinks = [
  { label: 'X (Twitter)', href: 'https://twitter.com', icon: 'x' },
  { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
  { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { label: 'TikTok', href: 'https://tiktok.com', icon: 'tiktok' },
]

export const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'Apple Pay', 'Google Pay']
