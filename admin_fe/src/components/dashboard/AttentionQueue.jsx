import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { ADMIN_DASHBOARD } from '../../constants/adminDashboardData'

const TONE = {
  urgent: 'bg-rose-50 text-rose-800 ring-rose-200',
  watch: 'bg-amber-50 text-amber-800 ring-amber-200',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
}

export default function AttentionQueue() {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Needs a decision</h2>
          <p className="text-xs text-slate-500">Work that should not wait for the next standup.</p>
        </div>
      </div>
      <ul className="flex-1 divide-y divide-slate-100">
        {ADMIN_DASHBOARD.attention.map((item) => (
          <li key={item.id}>
            <Link
              to={item.to}
              className="flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/80"
            >
              <span className={`inline-flex min-w-8 items-center justify-center rounded-lg px-2 py-1 text-sm font-bold tabular-nums ring-1 ${TONE[item.tone]}`}>
                {item.count}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="truncate text-xs text-slate-500">{item.detail}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-slate-300" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
