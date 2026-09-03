import { Heart, Layers, Package, UserRound } from 'lucide-react'
import { WISHLIST_STATS } from '../../constants/wishlistAnalytics'
import { formatCount } from '../../utils/formatters'
import { formatWishlistAverage } from '../../utils/normalizeWishlistAnalytics'

const ICONS = {
  heart: Heart,
  user: UserRound,
  box: Package,
  layers: Layers,
}

function formatStatValue(stat, stats) {
  if (stat.format === 'average') return formatWishlistAverage(stats[stat.key])
  return formatCount(stats[stat.key] ?? 0)
}

function helperFor(stat, stats) {
  if (stat.key === 'total' && stats.weekAdded > 0) {
    return `${formatCount(stats.weekAdded)} this week`
  }
  return stat.helper
}

function shouldShowStat(stat, stats) {
  if (stat.key === 'total') return true
  if (stat.key === 'shoppers') return stats.shoppers > 0 || stats.total > 0
  if (stat.key === 'listings') return stats.listings > 0 || stats.total > 0
  if (stat.key === 'averagePerShopper') return stats.averagePerShopper > 0
  return true
}

export default function WishlistStatsGrid({ stats }) {
  const cards = WISHLIST_STATS.filter((stat) => shouldShowStat(stat, stats))

  return (
    <div className="space-y-3">
      {stats.todayAdded > 0 ? (
        <p className="text-xs font-semibold text-slate-500">
          Today
          {' '}
          <span className="tabular-nums text-slate-900">{formatCount(stats.todayAdded)}</span>
        </p>
      ) : null}

      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${cards.length > 4 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
        {cards.map((stat) => {
          const Icon = ICONS[stat.icon] ?? Heart
          const value = formatStatValue(stat, stats)
          const helper = helperFor(stat, stats)

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
                <span className="mt-0.5 block truncate text-[11px] leading-snug text-slate-400">{helper}</span>
              </span>
              <span className="relative shrink-0 text-2xl font-sans font-bold tabular-nums tracking-tight text-slate-950">
                {value}
              </span>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export function WishlistStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading wishlist stats">
      {Array.from({ length: 4 }, (_, index) => (
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
