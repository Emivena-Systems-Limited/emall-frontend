import {
  Award,
  Bell,
  CircleDollarSign,
  FolderTree,
  Headset,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Store,
  Tag,
  User,
  UserCog,
  Users,
} from 'lucide-react'

export const SIDEBAR_NAV_BADGES = {
  support: 5,
  finance: 2,
}

export function formatBadgeCount(count) {
  if (!count || count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

export const NAV_SECTIONS = [
  {
    label: 'Command',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { to: '/vendors', icon: Store, label: 'Vendors' },
      { to: '/categories', icon: FolderTree, label: 'Categories', end: true },
      { to: '/brands', icon: Award, label: 'Brands' },
      { to: '/products', icon: Package, label: 'Catalogue' },
      { to: '/orders', icon: ShoppingCart, label: 'Orders' },
      { to: '/customers', icon: Users, label: 'Customers', comingSoon: true },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/finance', icon: CircleDollarSign, label: 'Finance', comingSoon: true, badgeKey: 'finance' },
      { to: '/promotions', icon: Tag, label: 'Promotions', comingSoon: true },
      { to: '/reviews', icon: Star, label: 'Trust & reviews', comingSoon: true },
      { to: '/support', icon: Headset, label: 'Support', comingSoon: true, badgeKey: 'support' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/staff', icon: UserCog, label: 'Staff & roles', comingSoon: true },
      { to: '/audit', icon: Shield, label: 'Audit log', comingSoon: true },
      { to: '/settings', icon: Settings, label: 'Platform settings', comingSoon: true },
      { to: '/profile', icon: User, label: 'My profile' },
    ],
  },
]

export function getNavBadgeCount(badgeKey) {
  if (!badgeKey) return 0
  const count = SIDEBAR_NAV_BADGES[badgeKey]
  return typeof count === 'number' && count > 0 ? count : 0
}
