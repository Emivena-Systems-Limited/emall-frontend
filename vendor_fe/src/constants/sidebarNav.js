import {
  BarChart3,
  CircleDollarSign,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  UserCog,
  Users,
} from 'lucide-react'

/** Replace with API-driven counts when notification endpoints are available */
export const SIDEBAR_NAV_BADGES = {
  orders: 12,
  notifications: 8,
  messages: 3,
  reviews: 5,
  finance: 1,
}

export function formatBadgeCount(count) {
  if (!count || count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

export const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/orders', icon: ShoppingCart, label: 'Orders', badgeKey: 'orders' },
      { to: '/products', icon: Package, label: 'Products' },
      { to: '/customers', icon: Users, label: 'Customers' },
      { to: '/promotions', icon: Tag, label: 'Promotions' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/analytics', icon: BarChart3, label: 'Analytics & Reports' },
      { to: '/finance', icon: CircleDollarSign, label: 'Finance', badgeKey: 'finance' },
      { to: '/reviews', icon: Star, label: 'Reviews & Ratings', badgeKey: 'reviews' },
      { to: '/messages', icon: MessageSquare, label: 'Messages', badgeKey: 'messages' },
    ],
  },
  {
    label: 'Config',
    items: [
      { to: '/settings', icon: Settings, label: 'Store Settings' },
      { to: '/users', icon: UserCog, label: 'Users & Permissions' },
      { to: '/help', icon: HelpCircle, label: 'Help & Support' },
    ],
  },
]

export function getNavBadgeCount(badgeKey) {
  if (!badgeKey) return 0
  const count = SIDEBAR_NAV_BADGES[badgeKey]
  return typeof count === 'number' && count > 0 ? count : 0
}
