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
import Container from '../layout/Container'
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
      className="group inline-flex shrink-0 snap-start items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 sm:gap-2.5 sm:px-4 sm:py-3 sm:text-[0.9375rem] md:min-w-0 md:flex-1"
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
    <Container>
      <nav
        aria-label="Quick actions"
        className="-mx-[clamp(0.75rem,2vw,2rem)] flex gap-2 overflow-x-auto overscroll-x-contain scroll-smooth px-[clamp(0.75rem,2vw,2rem)] py-2.5 snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] sm:gap-2.5 sm:py-3 md:mx-0 md:overflow-visible md:px-0 md:snap-none lg:py-3.5 [&::-webkit-scrollbar]:hidden"
      >
        {actions.map((action) => (
          <QuickActionPill key={action.id} action={action} />
        ))}
      </nav>
    </Container>
  )
}
