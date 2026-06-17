import { AlertTriangle, Boxes, CheckCircle2 } from 'lucide-react'
import { SUMMARY_FILTERS } from '../../constants/productCatalog'

const cards = [
  {
    key: SUMMARY_FILTERS.ALL,
    label: 'Listed products',
    helper: 'Total products in your catalogue',
    icon: Boxes,
    tone: 'text-cyan-700 bg-cyan-50 ring-cyan-100',
  },
  {
    key: SUMMARY_FILTERS.ACTIVE,
    label: 'Active listings',
    helper: 'Products currently live',
    icon: CheckCircle2,
    tone: 'text-emerald-700 bg-emerald-50 ring-emerald-100',
  },
  {
    key: SUMMARY_FILTERS.LOW_STOCK,
    label: 'Low stock',
    helper: 'Products with inventory alerts',
    icon: AlertTriangle,
    tone: 'text-amber-700 bg-amber-50 ring-amber-100',
  },
]

export default function ProductSummaryCards({ summary, activeFilter, onFilterChange }) {
  const values = {
    [SUMMARY_FILTERS.ALL]: summary.listed,
    [SUMMARY_FILTERS.ACTIVE]: summary.active,
    [SUMMARY_FILTERS.LOW_STOCK]: summary.lowStock,
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map(({ key, label, helper, icon: Icon, tone }) => {
        const isActive = activeFilter === key

        return (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              isActive
                ? 'border-brand/30 bg-brand-light/20 shadow-[0_12px_30px_rgba(199,59,45,0.08)] ring-1 ring-brand/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className={`flex size-10 items-center justify-center rounded-xl ring-1 ${tone}`}>
                <Icon className="size-5" strokeWidth={2} />
              </span>
              {isActive && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Filtered
                </span>
              )}
            </div>
            <p className="font-sans text-2xl font-bold text-slate-950">{values[key]}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{label}</p>
            <p className="mt-1 text-xs text-slate-500">{helper}</p>
          </button>
        )
      })}
    </div>
  )
}
