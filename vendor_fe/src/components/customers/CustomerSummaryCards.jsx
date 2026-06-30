import { Star, UserPlus, Users } from 'lucide-react'
import { useNavigate } from 'react-router'
import { SUMMARY_CARD_ROUTES } from '../../constants/customers'

const cards = [
  {
    key: 'total',
    route: SUMMARY_CARD_ROUTES.total,
    label: 'Total Customers',
    helper: 'All customers who have purchased',
    icon: Users,
    tone: 'text-cyan-700 bg-cyan-50 ring-cyan-100',
    valueKey: 'total',
  },
  {
    key: 'newThisMonth',
    route: SUMMARY_CARD_ROUTES.newThisMonth,
    label: 'New Customers This Month',
    helper: 'First-time buyers this month',
    icon: UserPlus,
    tone: 'text-emerald-700 bg-emerald-50 ring-emerald-100',
    valueKey: 'newThisMonth',
  },
  {
    key: 'reviews',
    route: SUMMARY_CARD_ROUTES.reviews,
    label: 'Reviews Received',
    helper: 'Customer feedback on your store',
    icon: Star,
    tone: 'text-amber-700 bg-amber-50 ring-amber-100',
    valueKey: 'reviewsReceived',
  },
]

export default function CustomerSummaryCards({ summary }) {
  const navigate = useNavigate()

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ key, route, label, helper, icon: Icon, tone, valueKey }) => (
        <button
          key={key}
          type="button"
          onClick={() => navigate(route)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition-all hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${tone}`}>
              <Icon className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-xl font-bold leading-none text-slate-950">{summary[valueKey]}</p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-800">{label}</p>
              <p className="mt-0.5 truncate text-[11px] leading-tight text-slate-500">{helper}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
