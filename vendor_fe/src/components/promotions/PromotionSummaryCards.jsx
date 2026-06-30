import { Clock3, Flame, Percent, Sparkles, Tag, Timer, Trash2 } from 'lucide-react'
import { SUMMARY_FILTERS } from '../../constants/promotions'

const cards = [
  {
    key: SUMMARY_FILTERS.ALL,
    label: 'Total Promotions',
    statusText: 'All promotions',
    icon: Tag,
    tone: 'text-cyan-700 bg-cyan-50 ring-cyan-100',
    valueKey: 'total',
  },
  {
    key: SUMMARY_FILTERS.ACTIVE,
    label: 'Active Promotions',
    statusText: 'Currently running',
    icon: Sparkles,
    tone: 'text-emerald-700 bg-emerald-50 ring-emerald-100',
    valueKey: 'active',
  },
  {
    key: SUMMARY_FILTERS.SCHEDULED,
    label: 'Scheduled Promotions',
    statusText: 'Starting soon',
    icon: Clock3,
    tone: 'text-sky-700 bg-sky-50 ring-sky-100',
    valueKey: 'scheduled',
  },
  {
    key: SUMMARY_FILTERS.EXPIRED,
    label: 'Expired Promotions',
    statusText: 'Past end date',
    icon: Timer,
    tone: 'text-slate-700 bg-slate-100 ring-slate-200',
    valueKey: 'expired',
  },
  {
    key: SUMMARY_FILTERS.TODAYS_DEALS,
    label: "Today's Deals",
    statusText: 'Daily spotlight offers',
    icon: Percent,
    tone: 'text-violet-700 bg-violet-50 ring-violet-100',
    valueKey: 'todaysDeals',
  },
  {
    key: SUMMARY_FILTERS.FLASH_SALES,
    label: 'Flash Sales',
    statusText: 'Limited-time urgency',
    icon: Flame,
    tone: 'text-orange-700 bg-orange-50 ring-orange-100',
    valueKey: 'flashSales',
  },
  {
    key: SUMMARY_FILTERS.CLEARANCE,
    label: 'Clearance',
    statusText: 'Inventory markdowns',
    icon: Trash2,
    tone: 'text-rose-700 bg-rose-50 ring-rose-100',
    valueKey: 'clearance',
  },
]

export default function PromotionSummaryCards({ summary, activeFilter, onFilterChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
      {cards.map(({ key, label, statusText, icon: Icon, tone, valueKey }) => {
        const isActive = activeFilter === key

        return (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            className={`rounded-xl border px-2.5 py-2 text-left transition-all md:px-3 md:py-2.5 ${
              isActive
                ? 'border-brand/30 bg-brand-light/20 shadow-[0_8px_20px_rgba(199,59,45,0.06)] ring-1 ring-brand/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 md:gap-2.5">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ring-1 md:size-8 ${tone}`}>
                <Icon className="size-3.5 md:size-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-base font-bold leading-none text-slate-950 md:text-lg">{summary[valueKey]}</p>
                <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-800 md:mt-1 md:text-[11px]">{label}</p>
                <p className="mt-0.5 truncate text-[9px] leading-tight text-slate-500 md:text-[10px]">{statusText}</p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
