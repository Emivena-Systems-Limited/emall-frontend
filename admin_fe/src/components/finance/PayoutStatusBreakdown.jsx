import { PAYOUT_STATUSES, payoutStatusBreakdown } from '../../constants/finance'
import { formatCount, formatPercent } from '../../utils/formatters'

export default function PayoutStatusBreakdown({ payouts }) {
  const rows = payoutStatusBreakdown(payouts)
  const total = payouts.length

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Payout status</h3>
          <p className="text-xs text-slate-500">Vendor payouts in this period</p>
        </div>
        <p className="text-lg font-bold tabular-nums text-slate-950">{formatCount(total)}</p>
      </div>

      {total === 0 ? (
        <p className="flex flex-1 items-center text-sm text-slate-500">No payouts in this period.</p>
      ) : (
        <>
          <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            {rows.filter((row) => row.count > 0).map((row) => (
              <span
                key={row.status}
                style={{ width: `${row.share}%`, backgroundColor: PAYOUT_STATUSES[row.status].bar }}
              />
            ))}
          </div>
          <ul className="space-y-2.5" aria-label="Payouts by status">
            {rows.map((row) => {
              const meta = PAYOUT_STATUSES[row.status]
              return (
                <li key={row.status} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className={`size-2 rounded-full ${meta.dot}`} aria-hidden="true" />
                    {meta.label}
                  </span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${row.share}%`, backgroundColor: meta.bar }}
                    />
                  </span>
                  <span className="text-right text-xs font-semibold tabular-nums text-slate-600">
                    {formatCount(row.count)}
                    <span className="ml-1.5 font-medium text-slate-400">{formatPercent(row.share)}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
