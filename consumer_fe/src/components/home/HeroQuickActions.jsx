import {
  BadgePercent,
  List,
  LogIn,
  ShoppingCart,
  Store,
  Tag,
  UserPlus,
} from 'lucide-react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import {
  authenticatedQuickActions,
  guestQuickActions,
} from '../../constants/heroSection'

const iconMap = {
  store: Store,
  deals: BadgePercent,
  clearance: Tag,
  wishlist: List,
  orders: ShoppingCart,
  'sign-in': LogIn,
  register: UserPlus,
}

function QuickActionPill({ action }) {
  const Icon = iconMap[action.icon] ?? Store

  return (
    <Link
      to={action.href}
      className="group inline-flex min-w-37 flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 sm:gap-2.5 sm:px-5 sm:py-3 sm:text-[0.9375rem]"
    >
      <Icon className="size-4 shrink-0 text-auth-primary sm:size-4.5" strokeWidth={2.25} />
      <span className="whitespace-nowrap">{action.label}</span>
    </Link>
  )
}

export default function HeroQuickActions() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const actions = isAuthenticated ? authenticatedQuickActions : guestQuickActions

  return (
    <div className="flex w-full gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] scrollbar-none sm:gap-3 sm:px-6 sm:py-3.5 lg:px-8 lg:py-4 [&::-webkit-scrollbar]:hidden">
      {actions.map((action) => (
        <QuickActionPill key={action.id} action={action} />
      ))}
    </div>
  )
}
