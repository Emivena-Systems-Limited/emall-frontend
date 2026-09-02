import { ADMIN_DASHBOARD } from '../../constants/adminDashboardData'
import { formatCount, formatPercent } from '../../utils/formatters'

const BAR = {
  slate: 'bg-slate-400',
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
}

export default function VendorPipeline() {
  const total = ADMIN_DASHBOARD.pipeline.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-bold text-slate-900">Vendor pipeline</h2>
        <p className="text-xs text-slate-500">{formatCount(total)} sellers on the books</p>
      </div>
      <ul className="flex flex-1 flex-col px-5 py-1">
        {ADMIN_DASHBOARD.pipeline.map((item) => {
          const share = total > 0 ? (item.value / total) * 100 : 0
          const width = Math.max(6, share)
          return (
            <li key={item.key} className="flex flex-1 flex-col justify-center">
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700">{item.label}</span>
                <span className="shrink-0 tabular-nums text-slate-500">
                  {formatCount(item.value)}
                  <span className="text-slate-400"> · {formatPercent(share)}</span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${BAR[item.tone]}`} style={{ width: `${width}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
