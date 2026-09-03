import {
  Award,
  Bell,
  Boxes,
  CreditCard,
  FolderTree,
  Heart,
  LayoutDashboard,
  Package,
  Search,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  TicketPercent,
  User,
  UserCog,
  Users,
} from 'lucide-react'

export const SIDEBAR_NAV_BADGES = {}

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
    label: 'Catalogue',
    items: [
      { to: '/vendors', icon: Store, label: 'Vendors' },
      { to: '/categories', icon: FolderTree, label: 'Categories', end: true },
      { to: '/brands', icon: Award, label: 'Brands' },
      { to: '/products', icon: Package, label: 'Products' },
      { to: '/inventory', icon: Boxes, label: 'Inventory' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/orders', icon: ShoppingCart, label: 'Orders' },
      { to: '/carts', icon: ShoppingBag, label: 'Carts' },
      { to: '/payments', icon: CreditCard, label: 'Payments' },
      { to: '/coupons', icon: TicketPercent, label: 'Coupons' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { to: '/users', icon: Users, label: 'Users' },
      { to: '/wishlists', icon: Heart, label: 'Wishlist' },
      { to: '/reviews', icon: Star, label: 'Reviews' },
      { to: '/searches', icon: Search, label: 'Search' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/staff', icon: UserCog, label: 'Staff & roles', comingSoon: true },
      { to: '/audit', icon: Shield, label: 'Audit log', comingSoon: true },
      { to: '/profile', icon: User, label: 'My profile' },
    ],
  },
]

export function getNavBadgeCount(badgeKey) {
  if (!badgeKey) return 0
  const count = SIDEBAR_NAV_BADGES[badgeKey]
  return typeof count === 'number' && count > 0 ? count : 0
}
