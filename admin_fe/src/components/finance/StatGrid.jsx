import { formatCediCompact, formatCount, formatPercent } from '../../utils/formatters'

function display(value, format) {
  if (format === 'count') return formatCount(value)
  if (format === 'percent') return formatPercent(value)
  return formatCediCompact(value)
}

export default function StatGrid({ items }) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${items.length > 4 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
      {items.map((item) => (
        <article
          key={item.label}
          className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
          <p className="text-sm font-semibold text-slate-700">{item.label}</p>
          <p className="mt-4 text-[clamp(1.4rem,2.4vw,1.85rem)] font-bold leading-none tracking-tight text-slate-950 tabular-nums">
            {display(item.value, item.format)}
          </p>
          {item.helper ? <p className="mt-3 text-xs text-slate-400">{item.helper}</p> : null}
        </article>
      ))}
    </div>
  )
}
