import { AlertTriangle, Boxes, CheckCircle2, XCircle } from 'lucide-react'
import { INVENTORY_STATS } from '../../constants/inventory'
import { formatCount } from '../../utils/formatters'

const ICONS = {
  boxes: Boxes,
  check: CheckCircle2,
  alert: AlertTriangle,
  x: XCircle,
}

export default function InventoryStatsGrid({ stats, activeKey, onSelect }) {
  const values = {
    all: stats.total,
    in_stock: stats.inStock,
    low: stats.lowStock,
    out: stats.outOfStock,
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {INVENTORY_STATS.map((stat) => {
        const Icon = ICONS[stat.icon] ?? Boxes
        const interactive = stat.key !== 'in_stock'
        const selected = interactive && activeKey === stat.key
        const value = values[stat.key]
        const cardClass = `group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border bg-white px-4 py-3.5 text-left shadow-[0_16px_45px_rgba(15,23,42,0.04)] ${
          interactive
            ? 'cursor-pointer transition-all duration-200 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
            : ''
        } ${selected ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200/80'}`
        const inner = (
          <>
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
            <span className="relative shrink-0 font-sans text-2xl font-bold tabular-nums tracking-tight text-slate-950">
              {formatCount(value ?? 0)}
            </span>
          </>
        )

        if (!interactive) {
          return (
            <div key={stat.key} className={cardClass}>
              {inner}
            </div>
          )
        }

        return (
          <button
            key={stat.key}
            type="button"
            onClick={() => onSelect(stat.view)}
            aria-pressed={selected}
            aria-label={`${stat.label} ${formatCount(value ?? 0)}`}
            className={cardClass}
          >
            {inner}
          </button>
        )
      })}
    </div>
  )
}
