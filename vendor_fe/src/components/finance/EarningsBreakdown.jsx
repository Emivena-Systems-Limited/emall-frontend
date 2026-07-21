import { Megaphone, Package, Percent, Truck } from 'lucide-react'
import { formatMoney } from '../../utils/financeUtils'

const cards = [
  {
    key: 'productSales',
    label: 'Product Sales',
    icon: Package,
    color: '#059669',
    bg: 'bg-emerald-500',
  },
  {
    key: 'shipping',
    label: 'Shipping',
    icon: Truck,
    color: '#0284c7',
    bg: 'bg-sky-500',
  },
  {
    key: 'platformFees',
    label: 'Platform Fees',
    icon: Percent,
    color: '#7c3aed',
    bg: 'bg-violet-500',
  },
  {
    key: 'adCharges',
    label: 'Advertisement Charges',
    icon: Megaphone,
    color: '#d97706',
    bg: 'bg-amber-500',
  },
]

export default function EarningsBreakdown({ breakdown }) {
  const earningsTotal = breakdown.earningsTotal || 0
  const deductionsTotal = breakdown.platformFees + breakdown.adCharges
  const grandTotal = earningsTotal + deductionsTotal

  const getContribution = (key) => {
    if (grandTotal === 0) return 0
    const value = key === 'platformFees' || key === 'adCharges'
      ? breakdown[key]
      : breakdown[key]
    return Math.round((value / grandTotal) * 100)
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">Earnings Breakdown</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          How your revenue and charges are distributed for the selected period.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, color, bg }) => {
          const amount = breakdown[key] ?? 0
          const contribution = getContribution(key)
          const isDeduction = key === 'platformFees' || key === 'adCharges'

          return (
            <article
              key={key}
              className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-slate-300 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)]"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-100">
                  <Icon className="size-4" style={{ color }} strokeWidth={2} />
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  {contribution}%
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-600">{label}</p>
              <p className={`mt-2 font-sans text-xl font-bold tabular-nums ${isDeduction ? 'text-rose-600' : 'text-slate-950'}`}>
                {isDeduction ? '−' : ''}{formatMoney(amount)}
              </p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${bg}`}
                  style={{ width: `${Math.max(contribution, 2)}%` }}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
