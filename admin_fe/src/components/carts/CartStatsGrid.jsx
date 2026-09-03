import {
  CheckCircle2,
  Clock3,
  Layers,
  Package,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Undo2,
  UserMinus,
  UserRound,
  Wallet,
} from 'lucide-react'
import { CART_STATS } from '../../constants/cartAnalytics'
import { formatCount, formatOrderMoney } from '../../utils/formatters'

const ICONS = {
  bag: ShoppingBag,
  cart: ShoppingCart,
  box: Package,
  clock: Clock3,
  user: UserRound,
  userDash: UserMinus,
  layers: Layers,
  wallet: Wallet,
  tag: Tag,
  undo: Undo2,
  check: CheckCircle2,
}

function formatStatValue(stat, stats) {
  if (stat.format === 'money') return formatOrderMoney(stats[stat.key])
  return formatCount(stats[stat.key] ?? 0)
}

function shouldShowStat(stat, stats) {
  if (stat.key === 'total') return true
  if (stat.key === 'active') return stats.active > 0 || stats.total > 0
  if (stat.key === 'withItems') return stats.withItems > 0
  if (stat.key === 'empty') return stats.empty > 0
  if (stat.key === 'shopper') return stats.shopper > 0
  if (stat.key === 'guest') return stats.guest > 0
  if (stat.key === 'totalItems') return stats.totalItems > 0
  if (stat.key === 'totalValue') return stats.totalValue > 0
  if (stat.key === 'averageValue') return stats.averageValue > 0
  if (stat.key === 'abandoned') return stats.abandoned > 0
  if (stat.key === 'converted') return stats.converted > 0
  return true
}

export default function CartStatsGrid({ stats }) {
  const cards = CART_STATS.filter((stat) => shouldShowStat(stat, stats))

  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${cards.length > 4 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
      {cards.map((stat) => {
        const Icon = ICONS[stat.icon] ?? ShoppingBag
        const value = formatStatValue(stat, stats)

        return (
          <article
            key={stat.key}
            className="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
            aria-label={`${stat.label} ${value}`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ backgroundColor: stat.accent }}
            />
            <span className={`relative flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${stat.well}`}>
              <Icon className="size-4" style={{ color: stat.accent }} strokeWidth={2.1} aria-hidden="true" />
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-800">{stat.label}</span>
              <span className="mt-0.5 block truncate text-[11px] leading-snug text-slate-400">{stat.helper}</span>
            </span>
            <span
              className={`relative shrink-0 font-sans font-bold tabular-nums tracking-tight text-slate-950 ${
                stat.format === 'money' ? 'text-lg' : 'text-2xl'
              }`}
            >
              {value}
            </span>
          </article>
        )
      })}
    </div>
  )
}

export function CartStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading cart stats">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-[76px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="skeleton-shimmer size-10 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3 w-20 rounded-md" />
              <div className="skeleton-shimmer h-3 w-28 rounded-md" />
            </div>
            <div className="skeleton-shimmer h-7 w-12 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
