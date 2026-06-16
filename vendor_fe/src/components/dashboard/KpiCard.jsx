import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { SPARK_DATA } from '../../constants/dashboardData'

function MiniBars({ data, color }) {
  const values = data.map((item) => item.v)
  const max = Math.max(...values)

  return (
    <div className="flex h-14 w-24 items-end justify-end gap-1.5">
      {values.slice(-7).map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="w-2 rounded-t-full bg-current opacity-15 transition-all duration-300 group-hover:opacity-30"
          style={{
            height: `${Math.max(14, Math.round((value / max) * 48))}px`,
            color,
          }}
        />
      ))}
    </div>
  )
}

export default function KpiCard({
  icon: Icon,
  label,
  value,
  changeText,
  helper,
  isPositive,
  isNeutral,
  sparkKey,
  accentColor,
}) {
  const TrendIcon = isNeutral ? Minus : isPositive ? ArrowUpRight : ArrowDownRight

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 ring-1 ring-cyan-100">
            <Icon className="size-3.5" style={{ color: accentColor }} strokeWidth={2.2} />
          </span>
          <p className="truncate text-[13px] font-semibold text-slate-900">{label}</p>
        </div>
        <MiniBars data={SPARK_DATA[sparkKey]} color={accentColor} />
      </div>

      <div className="flex min-w-0 items-center gap-1.5 text-[11px]">
        <span className={`inline-flex shrink-0 items-center gap-1 font-bold ${
          isNeutral ? 'text-slate-400' : isPositive ? 'text-emerald-600' : 'text-rose-500'
        }`}>
          <TrendIcon className="size-3" />
          {changeText}
        </span>
        <span className="truncate text-slate-500">{helper}</span>
      </div>

      <p className="mt-4 whitespace-nowrap font-sans text-lg font-semibold tracking-tight text-slate-900 tabular-nums sm:text-xl lg:text-2xl count-up">
        {value}
      </p>
    </article>
  )
}
