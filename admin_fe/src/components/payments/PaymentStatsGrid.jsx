import { CheckCircle2, Clock3, RotateCcw, Wallet, XCircle } from 'lucide-react'
import { PAYMENT_STATS } from '../../constants/payments'
import { formatCount, formatOrderMoney } from '../../utils/formatters'

const ICONS = {
  wallet: Wallet,
  check: CheckCircle2,
  clock: Clock3,
  x: XCircle,
  undo: RotateCcw,
}

export default function PaymentStatsGrid({ stats, activeKey, onSelect }) {
  const values = {
    all: stats.total,
    paid: stats.paid,
    pending: stats.pending,
    failed: stats.failed,
    refunded: stats.refunded,
  }

  return (
    <div className="space-y-3">
      {stats.captured > 0 ? (
        <p className="text-xs font-semibold text-slate-500">
          Captured volume
          {' '}
          <span className="tabular-nums text-slate-900">{formatOrderMoney(stats.captured)}</span>
          {stats.refundedAmount > 0 ? (
            <>
              {' · '}
              Returned
              {' '}
              <span className="tabular-nums text-slate-900">{formatOrderMoney(stats.refundedAmount)}</span>
            </>
          ) : null}
          {stats.today > 0 ? (
            <>
              {' · '}
              Today
              {' '}
              <span className="tabular-nums text-slate-900">{formatCount(stats.today)}</span>
              {stats.todayAmount > 0 ? (
                <>
                  {' '}
                  <span className="tabular-nums text-slate-900">{formatOrderMoney(stats.todayAmount)}</span>
                </>
              ) : null}
            </>
          ) : null}
        </p>
      ) : null}

      {stats.methods?.length > 0 ? (
        <p className="text-xs text-slate-500">
          {stats.methods.map((method, index) => (
            <span key={method.key}>
              {index > 0 ? ' · ' : null}
              {method.label}
              {' '}
              <span className="font-semibold tabular-nums text-slate-800">{formatCount(method.count)}</span>
            </span>
          ))}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {PAYMENT_STATS.map((stat) => {
          const Icon = ICONS[stat.icon] ?? Wallet
          const selected = activeKey === stat.key
          const value = values[stat.key]
          const needsAttention = (stat.key === 'pending' || stat.key === 'failed')
            && Number(value) > 0
            && !selected

          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => onSelect(stat.status)}
              aria-pressed={selected}
              aria-label={`${stat.label} ${formatCount(value ?? 0)}`}
              className={`group relative flex min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border bg-white px-4 py-3.5 text-left shadow-[0_16px_45px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                needsAttention
                  ? 'border-amber-200 ring-1 ring-amber-100'
                  : selected
                    ? 'border-slate-300 ring-1 ring-slate-200'
                    : 'border-slate-200/80'
              }`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ backgroundColor: needsAttention ? '#d97706' : stat.accent }}
              />
              <span className={`relative flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${stat.well}`}>
                <Icon className="size-4" style={{ color: stat.accent }} strokeWidth={2.1} aria-hidden="true" />
              </span>
              <span className="relative min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800">{stat.label}</span>
                <span className="mt-0.5 block truncate text-[11px] leading-snug text-slate-400">
                  {needsAttention ? 'Handle these first' : stat.helper}
                </span>
              </span>
              <span className="relative shrink-0 font-sans text-2xl font-bold tabular-nums tracking-tight text-slate-950">
                {formatCount(value ?? 0)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
