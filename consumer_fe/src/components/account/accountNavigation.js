import {
  Bell,
  CircleHelp,
  CreditCard,
  Gift,
  Heart,
  House,
  MapPin,
  MessageSquareText,
  Package,
  RotateCcw,
  Settings,
  ShoppingBag,
  Store,
  TicketPercent,
} from 'lucide-react'

export const accountNavigationItems = [
  { id: 'overview', label: 'Profile Overview', icon: House, href: '/account' },
  { id: 'orders', label: 'Orders', icon: Package, href: '/account/orders' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/account/wishlist' },
  { id: 'coupons', label: 'Coupons & Offers', icon: TicketPercent, href: '/account/coupons' },
  { id: 'reviews', label: 'Reviews', icon: MessageSquareText, href: '/account/reviews' },
  { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw, href: '/account/returns' },
  { id: 'stores', label: 'Followed Stores', icon: Store, href: '/account/stores' },
  { id: 'addresses', label: 'Addresses', icon: MapPin, href: '/account/addresses' },
  { id: 'payments', label: 'Payment Methods', icon: CreditCard, href: '/account/payments' },
  { id: 'settings', label: 'Account Settings', icon: Settings, href: '/account/settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/account/notifications' },
  { id: 'support', label: 'Help & Support', icon: CircleHelp, href: '/account/support' },
]

export const accountOverviewStatistics = [
  {
    label: 'Total Orders',
    value: '0',
    link: 'View all orders',
    href: '/account/orders',
    icon: ShoppingBag,
    tone: 'bg-red-50 text-auth-primary',
  },
  {
    label: 'Pending Deliveries',
    value: '0',
    link: 'Track orders',
    href: '/account/orders',
    icon: Package,
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    label: 'Wishlist Items',
    value: '0',
    link: 'View wishlist',
    href: '/account/wishlist',
    icon: Heart,
    tone: 'bg-pink-50 text-pink-600',
  },
  {
    label: 'Available Coupons',
    value: '0',
    link: 'View coupons',
    href: '/account/coupons',
    icon: Gift,
    tone: 'bg-emerald-50 text-emerald-700',
  },
]

export const accountSectionMeta = {
  overview: {
    title: 'Account dashboard',
    description: 'Manage your profile, activity, addresses and preferences from one place.',
  },
  orders: {
    title: 'Order management',
    description: 'Track deliveries, view order history, and manage your purchases.',
  },
  wishlist: {
    title: 'Wishlist',
    description: 'Save products you love and come back to them anytime.',
  },
  coupons: {
    title: 'Coupons & Offers',
    description: 'Browse available vouchers and promotional savings.',
  },
  reviews: {
    title: 'Reviews',
    description: 'Share feedback on products you have purchased.',
  },
  returns: {
    title: 'Returns & Refunds',
    description: 'Request returns and track refund status for eligible orders.',
  },
  stores: {
    title: 'Followed Stores',
    description: 'Keep up with sellers and brands you follow on the marketplace.',
  },
  addresses: {
    title: 'Address management',
    description: 'Manage delivery and billing addresses for faster checkout.',
  },
  payments: {
    title: 'Payment methods',
    description: 'Save cards and mobile money options for quick checkout.',
  },
  settings: {
    title: 'Account settings',
    description: 'Update security preferences and account preferences.',
  },
  notifications: {
    title: 'Notifications',
    description: 'Control order updates, promotions, and account alerts.',
  },
  support: {
    title: 'Help & Support',
    description: 'Find answers, contact support, and get help with your account.',
  },
}

export function resolveAccountSectionId(pathname) {
  if (pathname === '/account') return 'overview'

  const match = accountNavigationItems.find(
    (item) => item.href !== '/account' && pathname.startsWith(item.href),
  )

  return match?.id ?? 'overview'
}

export function isAccountNavItemActive(pathname, href) {
  return href === '/account' ? pathname === '/account' : pathname.startsWith(href)
}
