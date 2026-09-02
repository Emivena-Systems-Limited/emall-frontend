import {
  CircleDollarSign,
  Package,
  ShoppingCart,
  Store,
} from 'lucide-react'
import { formatCediCompact, formatCount, formatPercent } from '../../utils/formatters'
import { ADMIN_DASHBOARD } from '../../constants/adminDashboardData'

const KPI_META = {
  gmv: { icon: CircleDollarSign, accent: '#c73b2d', well: 'bg-[#fdf2f1] ring-[#f5d5d2]' },
  vendors: { icon: Store, accent: '#4f46e5', well: 'bg-indigo-50 ring-indigo-100' },
  orders: { icon: ShoppingCart, accent: '#0284c7', well: 'bg-sky-50 ring-sky-100' },
  listings: { icon: Package, accent: '#d97706', well: 'bg-amber-50 ring-amber-100' },
}

function formatValue(kpi) {
  if (kpi.format === 'cedi') return formatCediCompact(kpi.value)
  if (kpi.format === 'percent') return formatPercent(kpi.value)
  return formatCount(kpi.value)
}

function MiniSpark({ values = [], color }) {
  const max = Math.max(...values, 1)

  return (
    <div className="flex h-10 w-[4.75rem] items-end justify-end gap-1" aria-hidden="true">
      {values.slice(-7).map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="w-1.5 rounded-t-full bg-current opacity-30 transition-opacity duration-200 group-hover:opacity-55"
          style={{
            height: `${Math.max(12, Math.round((value / max) * 40))}px`,
            color,
          }}
        />
      ))}
    </div>
  )
}

export default function AdminKpiGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ADMIN_DASHBOARD.kpis.map((kpi) => {
        const meta = KPI_META[kpi.key] ?? KPI_META.gmv
        const Icon = meta.icon

        return (
          <article
            key={kpi.key}
            className="group relative flex min-h-[168px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:p-6"
            aria-label={`${kpi.label} ${formatValue(kpi)}`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ backgroundColor: meta.accent }}
            />

            <div className="relative flex items-start justify-between gap-3">
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${meta.well}`}>
                <Icon className="size-5" style={{ color: meta.accent }} strokeWidth={2.1} aria-hidden="true" />
              </span>
              <MiniSpark values={kpi.spark} color={meta.accent} />
            </div>

            <p className="relative mt-3 text-sm font-semibold leading-snug text-slate-700">
              {kpi.label}
            </p>

            <p className="relative mt-5 font-sans text-[clamp(1.7rem,3vw,2.15rem)] font-bold leading-none tracking-tight text-slate-950 tabular-nums count-up">
              {formatValue(kpi)}
            </p>
            <p className="relative mt-auto border-t border-slate-100 pt-3 text-xs leading-snug text-slate-400">{kpi.helper}</p>
          </article>
        )
      })}
    </div>
  )
}
