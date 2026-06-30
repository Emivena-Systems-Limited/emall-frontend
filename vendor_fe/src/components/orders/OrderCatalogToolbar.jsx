import { Search } from 'lucide-react'
import { STATUS_FILTER_TABS } from '../../constants/orders'

export default function OrderCatalogToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) {
  return (
    <div className="space-y-4">
      <label className="block min-w-0">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Search
        </span>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by order number, customer, email, or product…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
          />
        </div>
      </label>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTER_TABS.map((tab) => {
          const isActive = statusFilter === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusFilterChange(tab.key)}
              className={`cursor-pointer whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
