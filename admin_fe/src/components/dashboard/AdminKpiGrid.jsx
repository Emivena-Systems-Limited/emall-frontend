import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { formatCediCompact, formatCount, formatPercent } from '../../utils/formatters'
import { ADMIN_DASHBOARD } from '../../constants/adminDashboardData'

function formatValue(kpi) {
  if (kpi.format === 'cedi') return formatCediCompact(kpi.value)
  if (kpi.format === 'percent') return formatPercent(kpi.value)
  return formatCount(kpi.value)
}

export default function AdminKpiGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 lg:gap-4">
      {ADMIN_DASHBOARD.kpis.map((kpi) => {
        const up = kpi.delta >= 0
        const positive = kpi.invert ? !up : up
        const Icon = Math.abs(kpi.delta) < 0.05 ? Minus : up ? ArrowUpRight : ArrowDownRight
        return (
          <article
            key={kpi.key}
            className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300"
          >
            <p className="truncate text-[12px] font-semibold text-slate-500">{kpi.label}</p>
            <p className="mt-2 font-sans text-[clamp(1.05rem,2.4vw,1.45rem)] font-bold leading-none tracking-tight text-slate-950 tabular-nums count-up">
              {formatValue(kpi)}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="truncate text-[11px] text-slate-400">{kpi.helper}</p>
              <span className={`inline-flex shrink-0 items-center gap-0.5 text-[10px] font-bold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                <Icon className="size-3" />
                {formatPercent(kpi.delta, { signed: true })}
              </span>
            </div>
          </article>
        )
      })}
    </div>
  )
}
